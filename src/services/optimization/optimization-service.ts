import type {
  OptimizationInput,
  OptimizationResult,
  MarginalValueQuery,
  MarginalValueResult,
  AffordabilityGapInput,
  AffordabilityGapResult,
  PriceShockInput,
  PriceShockResult,
  NutrientCoverageResult,
  NutrientGap,
  OptimizedFoodSelection,
} from "@/types/optimization";

import {
  aggregateHouseholdNutrientTargets,
  toScarcityFoods,
} from "@/services/optimization/optimization-adapter";

import {
  optimizeScarcity,
} from "@/services/optimization/scarcity-optimizer";

const DEFAULT_OPTIMIZER_VERSION =
  "scarcity-lp-v1";

const GAP_EPSILON = 0.000001;

/**
 * Deterministic Nourish scarcity optimization service.
 *
 * Requirement calculation, database loading, persistence,
 * AI explanations, and UI concerns remain outside this
 * service.
 */
export class DeterministicOptimizationService {
  async optimize(
    input: OptimizationInput,
  ): Promise<OptimizationResult> {
    const startedAt = performance.now();

    if (
      input.budget.currency !==
      input.context.currency
    ) {
      throw new Error(
        "Budget currency must match household currency.",
      );
    }

    const nutrientTargets =
      aggregateHouseholdNutrientTargets(
        input.nutrientRequirements,
      );

    if (nutrientTargets.length === 0) {
      throw new Error(
        "No calculable nutrient requirements were supplied to the optimizer.",
      );
    }

    const foods = toScarcityFoods(
      input.candidateFoods,
      input.excludedFoodIds,
    );

    if (foods.length === 0) {
      throw new Error(
        "No priced candidate foods are available for optimization.",
      );
    }

    const optimizerVersion =
      input.optimizerVersion ??
      DEFAULT_OPTIMIZER_VERSION;

    const scarcityResult = optimizeScarcity({
      budgetEtb: input.budget.amount,
      foods,
      nutrientTargets,
    });

    const durationMs =
      performance.now() - startedAt;

    if (
      scarcityResult.status ===
      "infeasible"
    ) {
      return {
        status: "infeasible",
        selections: [],
        totalCost: 0,
        currency: input.budget.currency,
        nutrientCoverage: [],
        unresolvedGaps: [],
        metadata: {
          optimizerVersion,
          calculatedAt: new Date(),
          durationMs,
          objectiveScore:
            Number.POSITIVE_INFINITY,
          constraintsApplied:
            buildConstraintsApplied(input),
          warnings: buildWarnings(input),
        },
      };
    }

    const candidateFoodById = new Map(
      input.candidateFoods.map((food) => [
        food.foodId,
        food,
      ]),
    );

    const selections: OptimizedFoodSelection[] =
      scarcityResult.selections.map(
        (selection) => {
          const candidate =
            candidateFoodById.get(
              selection.foodId,
            );

          if (!candidate) {
            throw new Error(
              `Optimizer selected unknown food ${selection.foodId}`,
            );
          }

          return {
            foodId: selection.foodId,
            canonicalId:
              candidate.canonicalId,
            nameEn: candidate.nameEn,
            quantity:
              selection.quantityGrams,
            unit: "g",
            unitCost:
              selection.quantityGrams > 0
                ? selection.totalCostEtb /
                  selection.quantityGrams
                : 0,
            totalCost:
              selection.totalCostEtb,
          };
        },
      );

    const nutrientCoverage: NutrientCoverageResult[] =
      scarcityResult.nutrients.map(
        (nutrient) => {
          const isGap =
            nutrient.shortfallAmount >
            GAP_EPSILON;

          return {
            nutrientCode:
              nutrient.nutrientCode,
            targetAmount:
              nutrient.targetAmount,
            actualAmount:
              nutrient.suppliedAmount,
            coverageRatio:
              nutrient.coverageRatio,
            unit: findRequirementUnit(
              input,
              nutrient.nutrientCode,
            ),
            isGap,
          };
        },
      );

    const unresolvedGaps: NutrientGap[] =
      scarcityResult.nutrients
        .filter(
          (nutrient) =>
            nutrient.shortfallAmount >
            GAP_EPSILON,
        )
        .map((nutrient) => ({
          nutrientCode:
            nutrient.nutrientCode,
          targetAmount:
            nutrient.targetAmount,
          actualAmount:
            nutrient.suppliedAmount,
          shortfallAmount:
            nutrient.shortfallAmount,
          unit: findRequirementUnit(
            input,
            nutrient.nutrientCode,
          ),

          /**
           * Marginal cost is intentionally unavailable
           * until the +10 ETB / marginal-value calculation
           * is implemented.
           */
          estimatedMarginalCost: null,
        }));

    return {
      status:
        unresolvedGaps.length === 0
          ? "success"
          : "partial",

      selections,

      totalCost:
        scarcityResult.totalCostEtb,

      currency: input.budget.currency,

      nutrientCoverage,

      unresolvedGaps,

      metadata: {
        optimizerVersion,
        calculatedAt: new Date(),
        durationMs,
        objectiveScore:
          scarcityResult.objectiveScore,
        constraintsApplied:
          buildConstraintsApplied(input),
        warnings: buildWarnings(input),
      },
    };
  }

  async calculateMarginalValue(
    query: MarginalValueQuery,
  ): Promise<MarginalValueResult> {
    void query;

    throw new Error(
      "Marginal Nutrition Value is not implemented yet.",
    );
  }

  async analyzeAffordabilityGaps(
    input: AffordabilityGapInput,
  ): Promise<AffordabilityGapResult[]> {
    void input;

    throw new Error(
      "Affordability Gap analysis is not implemented yet.",
    );
  }

  async simulatePriceShock(
    input: PriceShockInput,
  ): Promise<PriceShockResult> {
    void input;

    throw new Error(
      "Price Shock simulation is not implemented yet.",
    );
  }
}

function findRequirementUnit(
  input: OptimizationInput,
  nutrientCode: string,
): string {
  const requirement =
    input.nutrientRequirements.find(
      (item) =>
        item.nutrientCode ===
        nutrientCode,
    );

  if (!requirement) {
    throw new Error(
      `Missing requirement unit for ${nutrientCode}`,
    );
  }

  return requirement.unit;
}

/**
 * Human-readable calculation metadata.
 *
 * These describe constraints that are genuinely active
 * in the current V1 optimizer.
 */
function buildConstraintsApplied(
  input: OptimizationInput,
): string[] {
  const constraints = [
    "household budget",
    "food availability",
    "food quantity modeling bounds",
    "nutrient minimum targets",
  ];

  if (input.excludedFoodIds.length > 0) {
    constraints.push(
      "explicit food exclusions",
    );
  }

  return constraints;
}

/**
 * Important limitations that must remain visible to
 * higher layers of Nourish.
 */
function buildWarnings(
  input: OptimizationInput,
): string[] {
  const warnings: string[] = [];

  if (input.pantry.length > 0) {
    warnings.push(
      "Pantry inventory is present but is not yet included in scarcity optimization.",
    );
  }

  if (
    input.recentNutrientHistory.length > 0
  ) {
    warnings.push(
      "Nutrient history is present but Nutrient Memory is not yet active.",
    );
  }

  warnings.push(
    "Food quantity bounds are mathematical modeling constraints, not medical recommendations or serving guidelines.",
  );

  return warnings;
}

export const optimizationService =
  new DeterministicOptimizationService();