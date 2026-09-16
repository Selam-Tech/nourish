import type { OptimizationInput } from "@/types/optimization";
import type { Prisma } from "@prisma/client";

import {
  calculateHouseholdRequirements,
  toRequirementProfile,
} from "@/services/nutrition/requirement-service";

import { loadCandidateFoods } from "@/services/optimization/candidate-food-loader";

/**
 * Builds the OptimizationInput structure from persisted household data.
 *
 * This function prepares real household data for the deterministic
 * scarcity optimizer.
 *
 * Important:
 * - Nutrient requirements come from the verified requirement engine.
 * - Missing scientific/modeling inputs are NOT silently invented.
 * - Pantry is loaded but is not yet applied by the scarcity solver.
 * - Nutrient Memory is loaded but is not yet applied by the solver.
 */
export async function buildOptimizationInput(
  householdId: string,
  planDate: Date,
): Promise<{
  input: Partial<OptimizationInput>;
  readiness: OptimizationReadiness;
}> {
  const { prisma } = await import("@/lib/db");

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: {
      members: {
        where: { isActive: true },
      },
      pantryItems: {
        include: { food: true },
      },
      dailyBudgets: {
        where: { date: planDate },
      },
      nutrientHistory: {
        orderBy: { recordDate: "desc" },
        take: 30,
        include: { nutrient: true },
      },
    },
  });

  if (!household) {
    throw new Error(`Household not found: ${householdId}`);
  }

  const budget = household.dailyBudgets[0];

  const requirementProfiles = household.members.map((member) =>
    toRequirementProfile(member),
  );

  /**
   * We intentionally do not provide:
   * - physicalActivityLevel
   * - ironBioavailabilityPercent
   * - zincBioavailability
   *
   * until the household explicitly supplies or accepts those assumptions.
   *
   * The requirement service will therefore return only requirements
   * supported by the data currently available.
   */
  const householdRequirements = calculateHouseholdRequirements(
    requirementProfiles,
    planDate,
  );

  const candidateFoods = household.regionId
    ? await loadCandidateFoods({
        regionId: household.regionId,
        currency: household.currency,
        asOfDate: planDate,
      })
    : [];

  const readiness = assessReadiness({
    memberCount: household.members.length,
    hasBudget: Boolean(budget),
    regionId: household.regionId,
    candidateFoodCount: candidateFoods.length,
    pricedFoodCount: candidateFoods.filter((food) => food.price !== null).length,
    nutrientRequirementCount:
      householdRequirements.optimizerRequirements.length,
    requirementWarnings: householdRequirements.warnings,
  });

  const input: Partial<OptimizationInput> = {
    context: {
      householdId: household.id,
      regionId: household.regionId,
      currency: household.currency,
      members: household.members.map((member) => ({
        id: member.id,
        name: member.name,
        dateOfBirth: member.dateOfBirth,
        sex: member.sex,
        pregnancyStatus: member.pregnancyStatus,
        weightKg: member.weightKg,
        allergies: member.allergies,
        dietaryRestrictions: member.dietaryRestrictions,
      })),
    },

    planDate,

    budget: budget
      ? {
          date: budget.date,
          amount: Number(budget.amount),
          currency: budget.currency,
        }
      : undefined,

    pantry: household.pantryItems.map((item) => ({
      foodId: item.foodId,
      quantity: item.quantity,
      unit: item.unit,
    })),

    candidateFoods,

    nutrientRequirements:
      householdRequirements.optimizerRequirements,

    recentNutrientHistory: household.nutrientHistory.map((history) => ({
      nutrientCode: history.nutrient.code,
      recordDate: history.recordDate,
      targetAmount: history.targetAmount,
      actualAmount: history.actualAmount,
      coverageRatio: history.coverageRatio,
      unit: history.unit,
    })),

    excludedFoodIds: [],
  };

  return {
    input,
    readiness,
  };
}

export interface OptimizationReadiness {
  isReady: boolean;
  blockers: string[];
  warnings: string[];
}

interface ReadinessInput {
  memberCount: number;
  hasBudget: boolean;
  regionId: string | null;
  candidateFoodCount: number;
  pricedFoodCount: number;
  nutrientRequirementCount: number;
  requirementWarnings: string[];
}

function assessReadiness(
  input: ReadinessInput,
): OptimizationReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (input.memberCount === 0) {
    blockers.push("No household members defined");
  }

  if (!input.hasBudget) {
    blockers.push("No daily budget set for the plan date");
  }

  if (!input.regionId) {
    blockers.push(
      "No region set — regional food prices are required for optimization",
    );
  }

  if (input.candidateFoodCount === 0) {
    blockers.push(
      "No candidate foods with nutrition data are available for this region",
    );
  }

  if (input.pricedFoodCount === 0) {
    blockers.push(
      "No priced foods are available for the selected region and plan date",
    );
  }

  if (input.nutrientRequirementCount === 0) {
    blockers.push(
      "No verified nutrient requirements could be calculated for the household",
    );
  }

  warnings.push(...input.requirementWarnings);

  return {
    isReady: blockers.length === 0,
    blockers,
    warnings,
  };
}

export async function createPendingMealPlan(
  householdId: string,
  planDate: Date,
  dailyBudgetId?: string,
): Promise<{
  mealPlanId: string;
  calculationMeta: Prisma.JsonValue;
}> {
  const { prisma } = await import("@/lib/db");

  const { input, readiness } = await buildOptimizationInput(
    householdId,
    planDate,
  );

  const calculationMeta = {
    readiness: {
      isReady: readiness.isReady,
      blockers: readiness.blockers,
      warnings: readiness.warnings,
    },

    inputSnapshot: {
      memberCount: input.context?.members.length ?? 0,
      pantryItemCount: input.pantry?.length ?? 0,
      candidateFoodCount: input.candidateFoods?.length ?? 0,
      pricedFoodCount:
        input.candidateFoods?.filter((food) => food.price !== null)
          .length ?? 0,
      nutrientRequirementCount:
        input.nutrientRequirements?.length ?? 0,
      budgetAmount: input.budget?.amount ?? null,
    },

    preparedAt: new Date().toISOString(),
  } satisfies Prisma.InputJsonObject;

  const mealPlan = await prisma.mealPlan.create({
    data: {
      householdId,
      planDate,
      dailyBudgetId,
      status: "PENDING_OPTIMIZATION",
      currency: input.context?.currency ?? "ETB",
      calculationMeta,
    },
  });

  return {
    mealPlanId: mealPlan.id,
    calculationMeta: mealPlan.calculationMeta,
  };
}