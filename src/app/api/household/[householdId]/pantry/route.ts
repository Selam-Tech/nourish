import { NextResponse } from "next/server";
import { createPantryItemSchema } from "@/lib/validation/schemas";
import { addPantryItem, getPantryItems } from "@/services/nutrition/household-service";

interface RouteParams {
  params: Promise<{ householdId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { householdId } = await params;
    const items = await getPantryItems(householdId);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { householdId } = await params;
    const body = await request.json();
    const parsed = createPantryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const item = await addPantryItem(householdId, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
