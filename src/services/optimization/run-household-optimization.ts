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
     * First calculate the household's normal plan.
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
     * Run the same deterministic optimizer again with
     * 10 additional ETB.
     *
     * This powers Nourish's:
     * "What could 10 more Birr do?" feature.
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
       * Store a small audit summary of the marginal
       * calculation with the MealPlan.
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
              quantity: selection.quantity,
              unit: selection.unit,
              totalCost:
                selection.totalCost,
            }),
          ),
      },

      calculatedAt:
        result.metadata.calculatedAt.toISOString(),

      durationMs:
        result.metadata.durationMs,
    } satisfies Prisma.InputJsonObject;

    await prisma.$transaction(
      async (tx) => {
        /*
         * Delete first so this function can safely
         * replace a previous calculation for the same
         * MealPlan if needed.
         */
        await tx.mealPlanItem.deleteMany({
          where: { mealPlanId },
        });

        await tx.mealPlanNutrientCoverage.deleteMany(
          {
            where: { mealPlanId },
          },
        );

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
        }

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