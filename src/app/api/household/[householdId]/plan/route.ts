import { NextResponse } from "next/server";
import { createMealPlanRequestSchema } from "@/lib/validation/schemas";
import { createPendingMealPlan } from "@/services/optimization/prepare-optimization-input";

interface RouteParams {
  params: Promise<{ householdId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { householdId } = await params;
    const body = await request.json();
    const parsed = createMealPlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const { mealPlanId, calculationMeta } = await createPendingMealPlan(
      householdId,
      parsed.data.planDate,
      parsed.data.dailyBudgetId,
    );

    const meta = calculationMeta as {
      readiness?: { isReady: boolean; blockers: string[]; warnings: string[] };
    };

    return NextResponse.json(
      {
        mealPlanId,
        status: "PENDING_OPTIMIZATION",
        message: "Nutrition optimization engine not yet calculated",
        readiness: meta.readiness ?? { isReady: false, blockers: [], warnings: [] },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
