import { describe, it, expect } from "vitest";
import {
  createHouseholdSchema,
  createMemberSchema,
  createPantryItemSchema,
  createDailyBudgetSchema,
} from "@/lib/validation/schemas";

describe("createHouseholdSchema", () => {
  it("accepts valid household data", () => {
    const result = createHouseholdSchema.safeParse({ name: "Abebe Family" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createHouseholdSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("defaults currency to ETB", () => {
    const result = createHouseholdSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("ETB");
    }
  });
});

describe("createMemberSchema", () => {
  it("accepts valid member data", () => {
    const result = createMemberSchema.safeParse({
      name: "Tigist",
      dateOfBirth: "2018-05-15",
      sex: "FEMALE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects future date of birth", () => {
    const result = createMemberSchema.safeParse({
      name: "Future",
      dateOfBirth: "2099-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("defaults allergies to empty array", () => {
    const result = createMemberSchema.safeParse({
      name: "Test",
      dateOfBirth: "2020-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allergies).toEqual([]);
    }
  });
});

describe("createPantryItemSchema", () => {
  it("accepts valid pantry item", () => {
    const result = createPantryItemSchema.safeParse({
      foodId: "clxyz1234567890abcdefghij",
      quantity: 2.5,
      unit: "kg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive quantity", () => {
    const result = createPantryItemSchema.safeParse({
      foodId: "clxyz1234567890abcdefghij",
      quantity: 0,
      unit: "kg",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDailyBudgetSchema", () => {
  it("accepts valid budget", () => {
    const result = createDailyBudgetSchema.safeParse({
      date: "2026-03-06",
      amount: 150,
      currency: "ETB",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero budget", () => {
    const result = createDailyBudgetSchema.safeParse({
      date: "2026-03-06",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });
});
