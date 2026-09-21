import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { buildOptimizationInput } from "@/services/optimization/prepare-optimization-input";
import { optimizationService } from "@/services/optimization/optimization-service";
import type { OptimizationInput } from "@/types/optimization";

const MARGINAL_BUDGET_ETB = 10;

export async function runHouseholdOptimization(
  householdId: string,
  mealPlanId: string,
  planDate: Date,
) {
  const { input, readiness } =
    await buildOptimizationInput(
      householdId,
      planDate,
    );

  if (!readiness.isReady) {
    const message =
      readiness.blockers.join("; ");

    await prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        status: "FAILED",
        errorMessage: message,
        calculationMeta: {
          readiness: {
            isReady: false,
            blockers: readiness.blockers,
            warnings: readiness.warnings,
          },
        } satisfies Prisma.InputJsonObject,
      },
    });

    throw new Error(message);
  }

  /*
   * Readiness guarantees the fields required by the
   * optimizer are present. We still validate them here
   * before constructing OptimizationInput.
   */
  if (
    !input.context ||
    !input.budget ||
    !input.candidateFoods ||
    !input.nutrientRequirements ||
    !input.pantry ||
    !input.recentNutrientHistory ||
    !input.excludedFoodIds
  ) {
    throw new Error(
      "Optimization input is incomplete even though readiness passed.",
    );
  }

  const completeInput: OptimizationInput = {
    context: input.context,
    planDate: input.planDate ?? planDate,
    budget: input.budget,
    pantry: input.pantry,
    candidateFoods: input.candidateFoods,
    nutrientRequirements:
      input.nutrientRequirements,
    recentNutrientHistory:
      input.recentNutrientHistory,
    excludedFoodIds:
      input.excludedFoodIds,
    optimizerVersion:
      input.optimizerVersion,
  };

  try {
    /*
     * Calculate the household's normal plan.
     */
    const result =
      await optimizationService.optimize(
        completeInput,
      );

    if (result.status === "infeasible") {
      const message =
        "The optimizer could not construct a feasible plan with the available foods and constraints.";

      await prisma.mealPlan.update({
        where: { id: mealPlanId },
        data: {
          status: "FAILED",
          errorMessage: message,
          optimizerVersion:
            result.metadata.optimizerVersion,
          calculationMeta: {
            optimizerStatus: result.status,
            objectiveScore:
              result.metadata.objectiveScore,
            constraintsApplied:
              result.metadata
                .constraintsApplied,
            warnings: [
              ...readiness.warnings,
              ...result.metadata.warnings,
            ],
            calculatedAt:
              result.metadata.calculatedAt.toISOString(),
            durationMs:
              result.metadata.durationMs,
          } satisfies Prisma.InputJsonObject,
        },
      });

      throw new Error(message);
    }

    /*
     * Run the same deterministic optimizer with
     * 10 additional ETB.
     *
     * This powers:
     * "What could 10 more Birr do?"
     *
     * No AI guesses nutrient values or food choices.
     */
    const marginalValue =
      await optimizationService.calculateMarginalValue(
        {
          input: completeInput,
          additionalBudget:
            MARGINAL_BUDGET_ETB,
        },
      );

    /*
     * Resolve optimizer nutrient codes to the real
     * NutrientDefinition database IDs.
     */
    const nutrientDefinitions =
      await prisma.nutrientDefinition.findMany(
        {
          where: {
            code: {
              in: result.nutrientCoverage.map(
                (coverage) =>
                  coverage.nutrientCode,
              ),
            },
          },
        },
      );

    const nutrientIdByCode = new Map(
      nutrientDefinitions.map(
        (nutrient) => [
          nutrient.code,
          nutrient.id,
        ],
      ),
    );

    /*
     * Fail safely if an optimizer nutrient does not
     * exist in the verified nutrient definitions.
     */
    for (
      const coverage of
      result.nutrientCoverage
    ) {
      if (
        !nutrientIdByCode.has(
          coverage.nutrientCode,
        )
      ) {
        throw new Error(
          `Nutrient definition not found for optimizer result: ${coverage.nutrientCode}`,
        );
      }
    }

    const calculationMeta = {
      optimizerStatus: result.status,

      objectiveScore:
        result.metadata.objectiveScore,

      constraintsApplied:
        result.metadata.constraintsApplied,

      warnings: [
        ...readiness.warnings,
        ...result.metadata.warnings,
      ],

      unresolvedGaps:
        result.unresolvedGaps.map(
          (gap) => ({
            nutrientCode:
              gap.nutrientCode,
            targetAmount:
              gap.targetAmount,
            actualAmount:
              gap.actualAmount,
            shortfallAmount:
              gap.shortfallAmount,
            unit: gap.unit,
            estimatedMarginalCost:
              gap.estimatedMarginalCost,
          }),
        ),

      /*
       * Store an audit summary of the marginal
       * nutrition calculation with the MealPlan.
       */
      marginalNutritionValue: {
        additionalBudget:
          marginalValue.additionalBudget,

        improvedNutrients:
          marginalValue.improvedNutrients.map(
            (nutrient) => ({
              nutrientCode:
                nutrient.nutrientCode,
              additionalAmount:
                nutrient.additionalAmount,
              unit: nutrient.unit,
            }),
          ),

        recommendedFoodAdditions:
          marginalValue.recommendedFoodAdditions.map(
            (selection) => ({
              foodId: selection.foodId,
              source: selection.source,
              quantity:
                selection.quantity,
              unit: selection.unit,
              totalCost:
                selection.totalCost,
            }),
          ),
      },

      /*
       * Nutrient Memory records modeled dietary
       * coverage. It is not a biological measurement
       * and is not a diagnosis of nutrient deficiency.
       */
      nutrientMemory: {
        recorded: true,
        recordDate:
          planDate.toISOString(),
        sourceType: "CALCULATED",
      },

      calculatedAt:
        result.metadata.calculatedAt.toISOString(),

      durationMs:
        result.metadata.durationMs,
    } satisfies Prisma.InputJsonObject;

    /*
     * Persist the complete result atomically.
     *
     * If any database operation fails, none of these
     * changes are committed.
     */
    await prisma.$transaction(
      async (tx) => {
        /*
         * Delete previous calculated records for this
         * MealPlan before replacing them.
         *
         * This makes recalculation idempotent.
         */
        await tx.mealPlanItem.deleteMany({
          where: { mealPlanId },
        });

        await tx.mealPlanNutrientCoverage.deleteMany(
          {
            where: { mealPlanId },
          },
        );

        /*
         * Remove Nutrient Memory rows previously
         * generated from this MealPlan.
         *
         * This prevents duplicate memory records when
         * the same plan is recalculated.
         */
        await tx.nutrientHistory.deleteMany({
          where: {
            sourcePlanId: mealPlanId,
          },
        });

        /*
         * Persist selected foods.
         */
        if (
          result.selections.length > 0
        ) {
          await tx.mealPlanItem.createMany({
            data: result.selections.map(
              (selection, index) => ({
                mealPlanId,
                foodId:
                  selection.foodId,
                quantity:
                  selection.quantity,
                unit: selection.unit,
                unitCost:
                  selection.unitCost,
                totalCost:
                  selection.totalCost,
                sortOrder: index,
              }),
            ),
          });
        }

        /*
         * Persist nutrient coverage for the MealPlan
         * and write the same calculated dietary
         * coverage into Nutrient Memory.
         */
        if (
          result.nutrientCoverage.length >
          0
        ) {
          await tx.mealPlanNutrientCoverage.createMany(
            {
              data:
                result.nutrientCoverage.map(
                  (coverage) => ({
                    mealPlanId,
                    nutrientId:
                      nutrientIdByCode.get(
                        coverage.nutrientCode,
                      )!,
                    targetAmount:
                      coverage.targetAmount,
                    actualAmount:
                      coverage.actualAmount,
                    coverageRatio:
                      coverage.coverageRatio,
                    unit: coverage.unit,
                    isGap:
                      coverage.isGap,
                  }),
                ),
            },
          );

          /*
           * Nutrient Memory:
           *
           * Store the modeled dietary coverage from
           * this plan so future plans can identify
           * recurring dietary patterns.
           *
           * IMPORTANT:
           * These values do not represent blood levels,
           * body stores, or a medical diagnosis.
           */
          await tx.nutrientHistory.createMany({
            data:
              result.nutrientCoverage.map(
                (coverage) => ({
                  householdId,
                  nutrientId:
                    nutrientIdByCode.get(
                      coverage.nutrientCode,
                    )!,
                  recordDate: planDate,
                  targetAmount:
                    coverage.targetAmount,
                  actualAmount:
                    coverage.actualAmount,
                  coverageRatio:
                    coverage.coverageRatio,
                  unit: coverage.unit,
                  sourcePlanId:
                    mealPlanId,
                  sourceType:
                    "CALCULATED",
                }),
              ),
          });
        }

        /*
         * Mark the MealPlan successful only after all
         * selections, coverage, and Nutrient Memory
         * records have been written successfully.
         */
        await tx.mealPlan.update({
          where: { id: mealPlanId },
          data: {
            status: "OPTIMIZED",
            totalCost:
              result.totalCost,
            currency:
              result.currency,
            optimizerVersion:
              result.metadata
                .optimizerVersion,
            calculationMeta,
            errorMessage: null,
          },
        });
      },
    );

    return {
      mealPlanId,
      result,
      marginalValue,
      readiness,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown optimization error";

    /*
     * Do not overwrite an already-recorded FAILED
     * result unnecessarily.
     */
    const currentPlan =
      await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        select: { status: true },
      });

    if (
      currentPlan &&
      currentPlan.status !== "FAILED"
    ) {
      await prisma.mealPlan.update({
        where: { id: mealPlanId },
        data: {
          status: "FAILED",
          errorMessage: message,
        },
      });
    }

    throw error;
  }
}