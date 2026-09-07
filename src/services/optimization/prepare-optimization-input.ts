import type { OptimizationInput } from "@/types/optimization";
import type { Prisma } from "@prisma/client";

/**
 * Builds the OptimizationInput structure from persisted household data.
 * Does NOT run optimization — prepares the contract for the future engine.
 */
export async function buildOptimizationInput(
  householdId: string,
  planDate: Date,
): Promise<{ input: Partial<OptimizationInput>; readiness: OptimizationReadiness }> {
  const { prisma } = await import("@/lib/db");

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: {
      members: { where: { isActive: true } },
      pantryItems: { include: { food: true } },
      dailyBudgets: { where: { date: planDate } },
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
  const foods = await prisma.food.findMany({
    where: { isActive: true },
    include: {
      nutrients: { include: { nutrient: true } },
      prices: household.regionId
        ? {
            where: { regionId: household.regionId },
            orderBy: { observedAt: "desc" },
            take: 1,
          }
        : false,
    },
  });

  const readiness = assessReadiness(household, budget, foods);

  const input: Partial<OptimizationInput> = {
    context: {
      householdId: household.id,
      regionId: household.regionId,
      currency: household.currency,
      members: household.members.map((m) => ({
        id: m.id,
        name: m.name,
        dateOfBirth: m.dateOfBirth,
        sex: m.sex,
        pregnancyStatus: m.pregnancyStatus,
        allergies: m.allergies,
        dietaryRestrictions: m.dietaryRestrictions,
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
    pantry: household.pantryItems.map((p) => ({
      foodId: p.foodId,
      quantity: p.quantity,
      unit: p.unit,
    })),
    candidateFoods: foods.map((f) => ({
      foodId: f.id,
      canonicalId: f.canonicalId,
      nameEn: f.nameEn,
      nameAm: f.nameAm,
      foodGroup: f.foodGroup,
      defaultUnit: f.defaultUnit,
      nutrientsPer100g: Object.fromEntries(
        f.nutrients.map((n) => [n.nutrient.code, n.amountPer100g]),
      ),
      price:
        Array.isArray(f.prices) && f.prices[0]
          ? {
              amount: Number(f.prices[0].price),
              unit: f.prices[0].unit,
              currency: f.prices[0].currency,
              observedAt: f.prices[0].observedAt,
              sourceName: f.prices[0].sourceName,
            }
          : null,
    })),
    recentNutrientHistory: household.nutrientHistory.map((h) => ({
      nutrientCode: h.nutrient.code,
      recordDate: h.recordDate,
      targetAmount: h.targetAmount,
      actualAmount: h.actualAmount,
      coverageRatio: h.coverageRatio,
      unit: h.unit,
    })),
    excludedFoodIds: [],
    nutrientRequirements: [],
  };

  return { input, readiness };
}

export interface OptimizationReadiness {
  isReady: boolean;
  blockers: string[];
  warnings: string[];
}

function assessReadiness(
  household: {
    members: unknown[];
    regionId: string | null;
  },
  budget: unknown,
  foods: unknown[],
): OptimizationReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (household.members.length === 0) {
    blockers.push("No household members defined");
  }
  if (!budget) {
    blockers.push("No daily budget set for the plan date");
  }
  if (foods.length === 0) {
    blockers.push("Food database is empty — import authoritative food data first");
  }
  if (!household.regionId) {
    warnings.push("No region set — regional prices may be unavailable");
  }

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
): Promise<{ mealPlanId: string; calculationMeta: Prisma.JsonValue }> {
  const { prisma } = await import("@/lib/db");
  const { input, readiness } = await buildOptimizationInput(householdId, planDate);

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

  return { mealPlanId: mealPlan.id, calculationMeta: mealPlan.calculationMeta };
}
