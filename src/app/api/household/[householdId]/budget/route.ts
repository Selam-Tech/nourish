import { NextResponse } from "next/server";
import { createDailyBudgetSchema } from "@/lib/validation/schemas";
import { upsertDailyBudget } from "@/services/nutrition/household-service";

interface RouteParams {
  params: Promise<{ householdId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { householdId } = await params;
    const body = await request.json();
    const parsed = createDailyBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const budget = await upsertDailyBudget(householdId, parsed.data);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
