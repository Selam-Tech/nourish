import { NextResponse } from "next/server";

import { createMealPlanRequestSchema } from "@/lib/validation/schemas";
import { createPendingMealPlan } from "@/services/optimization/prepare-optimization-input";
import { runHouseholdOptimization } from "@/services/optimization/run-household-optimization";

interface RouteParams {
  params: Promise<{ householdId: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const { householdId } = await params;
    const body = await request.json();

    const parsed = createMealPlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors
            .map((error) => error.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    /*
     * First create the MealPlan record so every optimization attempt
     * has a persisted audit trail.
     */
    const { mealPlanId, calculationMeta } =
      await createPendingMealPlan(
        householdId,
        parsed.data.planDate,
        parsed.data.dailyBudgetId,
      );

    const meta = calculationMeta as {
      readiness?: {
        isReady: boolean;
        blockers: string[];
        warnings: string[];
      };
    };

    if (!meta.readiness?.isReady) {
      return NextResponse.json(
        {
          mealPlanId,
          status: "PENDING_OPTIMIZATION",
          message:
            "The meal plan is not ready for optimization.",
          readiness: meta.readiness ?? {
            isReady: false,
            blockers: [],
            warnings: [],
          },
        },
        { status: 422 },
      );
    }

    /*
     * Run the deterministic scarcity optimizer using the real
     * persisted household, verified nutrient requirements,
     * EFCT foods, and regional prices.
     */
    const optimization =
      await runHouseholdOptimization(
        householdId,
        mealPlanId,
        parsed.data.planDate,
      );

    return NextResponse.json(
      {
        mealPlanId,
        status: "OPTIMIZED",
        optimizerStatus: optimization.result.status,
        totalCost: optimization.result.totalCost,
        currency: optimization.result.currency,
        selections: optimization.result.selections,
        nutrientCoverage:
          optimization.result.nutrientCoverage,
        unresolvedGaps:
          optimization.result.unresolvedGaps,
        metadata: optimization.result.metadata,
        readiness: optimization.readiness,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Optimization failed";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 503 },
    );
  }
}