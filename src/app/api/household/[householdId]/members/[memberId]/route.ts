import { NextResponse } from "next/server";
import { updateMemberSchema } from "@/lib/validation/schemas";
import {
  deactivateHouseholdMember,
  updateHouseholdMember,
} from "@/services/nutrition/household-service";

interface RouteParams {
  params: Promise<{ householdId: string; memberId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { memberId } = await params;
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const member = await updateHouseholdMember(memberId, parsed.data);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { memberId } = await params;
    await deactivateHouseholdMember(memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
