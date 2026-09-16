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

    /**
     * Pantry inventory is passed into the adapter.
     *
     * Pantry food becomes a zero-additional-purchase-cost
     * optimization variable, while food that still needs
     * to be purchased keeps its modeled ETB/gram cost.
     */
    const foods = toScarcityFoods(
      input.candidateFoods,
      input.pantry,
      input.excludedFoodIds,
    );

    if (foods.length === 0) {
      throw new Error(
        "No usable candidate foods are available for optimization.",
      );
    }

    const optimizerVersion =
      input.optimizerVersion ??
      DEFAULT_OPTIMIZER_VERSION;

    const scarcityResult =
      optimizeScarcity({
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
          warnings:
            buildWarnings(input),
        },
      };
    }

    const candidateFoodById =
      new Map(
        input.candidateFoods.map(
          (food) => [
            food.foodId,
            food,
          ],
        ),
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
            nameAm: candidate.nameAm,

            /**
             * This allows the UI to distinguish:
             *
             * pantry   -> Use from home
             * purchase -> Buy
             */
            source: selection.source,

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
           * Marginal cost remains unavailable
           * until the +10 ETB feature is implemented.
           */
          estimatedMarginalCost: null,
        }));

    return {
      status:
        unresolvedGaps.length === 0
          ? "success"
          : "partial",

      selections,

      /**
       * Pantry selections have zero additional cost.
       *
       * Therefore this value represents the modeled
       * amount the household needs to spend now,
       * not the historical value of food already at home.
       */
      totalCost:
        scarcityResult.totalCostEtb,

      currency:
        input.budget.currency,

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

        warnings:
          buildWarnings(input),
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
  ): Promise<
    AffordabilityGapResult[]
  > {
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

  if (
    input.excludedFoodIds.length > 0
  ) {
    constraints.push(
      "explicit food exclusions",
    );
  }

  /**
   * Only claim pantry inventory as an active constraint
   * when this optimization request actually contains it.
   */
  if (input.pantry.length > 0) {
    constraints.push(
      "available household pantry inventory",
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

  /**
   * Pantry is now active, so the old warning saying
   * pantry is "not yet included" must not be returned.
   */

  if (
    input.recentNutrientHistory.length >
    0
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