import { NextResponse } from "next/server";
import { removePantryItem } from "@/services/nutrition/household-service";

interface RouteParams {
  params: Promise<{ householdId: string; itemId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { itemId } = await params;
    await removePantryItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
