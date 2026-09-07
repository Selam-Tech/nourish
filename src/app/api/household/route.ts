import { NextResponse } from "next/server";
import { createHouseholdSchema, updateHouseholdSchema } from "@/lib/validation/schemas";
import {
  createHousehold,
  getDemoHousehold,
  updateHousehold,
} from "@/services/nutrition/household-service";

export async function GET() {
  try {
    const household = await getDemoHousehold();
    return NextResponse.json(household);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createHouseholdSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const existing = await getDemoHousehold();
    if (existing) {
      return NextResponse.json({ error: "Household already exists" }, { status: 409 });
    }

    const household = await createHousehold(parsed.data);
    return NextResponse.json(household, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const household = await getDemoHousehold();
    if (!household) {
      return NextResponse.json({ error: "No household found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateHouseholdSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const updated = await updateHousehold(household.id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
