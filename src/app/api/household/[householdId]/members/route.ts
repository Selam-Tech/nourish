import { NextResponse } from "next/server";
import { createMemberSchema } from "@/lib/validation/schemas";
import { addHouseholdMember } from "@/services/nutrition/household-service";
interface RouteParams {
  params: Promise<{ householdId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { householdId } = await params;
    const body = await request.json();
    const parsed = createMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const member = await addHouseholdMember(householdId, parsed.data);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
