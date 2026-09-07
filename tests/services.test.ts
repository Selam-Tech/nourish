import { describe, it, expect } from "vitest";
import {
  validateFoodRecords,
  validateNutrientRecords,
} from "@/services/nutrition/food-import";
import type { FoodImportRecord, FoodNutrientImportRecord } from "@/types/data-import";

const baseProvenance = {
  sourceName: "Ethiopian Food Composition Table",
  sourceUrl: "https://example.org/efct",
  publicationVersion: "2019",
  importedAt: new Date("2026-01-01"),
  unit: "g",
};

describe("validateFoodRecords", () => {
  it("accepts valid food records", () => {
    const records: FoodImportRecord[] = [
      {
        canonicalId: "efct-teff-white",
        nameEn: "Teff, white",
        nameAm: "ጤፍ",
        foodGroup: "Cereals",
        defaultUnit: "g",
        provenance: baseProvenance,
      },
    ];

    const { valid, invalid } = validateFoodRecords(records);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(0);
  });

  it("rejects missing canonicalId", () => {
    const records: FoodImportRecord[] = [
      {
        canonicalId: "",
        nameEn: "Teff",
        defaultUnit: "g",
        provenance: baseProvenance,
      },
    ];

    const { valid, invalid } = validateFoodRecords(records);
    expect(valid).toHaveLength(0);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].reason).toContain("canonicalId");
  });

  it("rejects duplicate canonicalIds", () => {
    const record: FoodImportRecord = {
      canonicalId: "efct-teff-white",
      nameEn: "Teff",
      defaultUnit: "g",
      provenance: baseProvenance,
    };

    const { valid, invalid } = validateFoodRecords([record, record]);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].reason).toContain("Duplicate");
  });

  it("rejects records without provenance sourceName", () => {
    const records: FoodImportRecord[] = [
      {
        canonicalId: "test-food",
        nameEn: "Test",
        defaultUnit: "g",
        provenance: { ...baseProvenance, sourceName: "" },
      },
    ];

    const { invalid } = validateFoodRecords(records);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].reason).toContain("provenance");
  });
});

describe("validateNutrientRecords", () => {
  it("accepts valid nutrient records", () => {
    const records: FoodNutrientImportRecord[] = [
      {
        canonicalFoodId: "efct-teff-white",
        nutrientCode: "energy",
        amountPer100g: 367,
        provenance: baseProvenance,
      },
    ];

    const { valid, invalid } = validateNutrientRecords(records);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(0);
  });

  it("rejects negative nutrient amounts", () => {
    const records: FoodNutrientImportRecord[] = [
      {
        canonicalFoodId: "efct-teff-white",
        nutrientCode: "protein",
        amountPer100g: -5,
        provenance: baseProvenance,
      },
    ];

    const { invalid } = validateNutrientRecords(records);
    expect(invalid).toHaveLength(1);
  });
});

describe("calculateAge", () => {
  it("calculates age correctly", async () => {
    const { calculateAge, formatMemberAge } = await import(
      "@/services/nutrition/household-service"
    );

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 10);
    expect(calculateAge(dob)).toBe(10);
    expect(formatMemberAge(dob)).toBe("10 yr");
  });

  it("formats infant age in months", async () => {
    const { formatMemberAge } = await import("@/services/nutrition/household-service");

    const dob = new Date();
    dob.setMonth(dob.getMonth() - 8);
    const formatted = formatMemberAge(dob);
    expect(formatted).toMatch(/mo$/);
  });
});

describe("OptimizationService contract", () => {
  it("throws not-implemented for optimize", async () => {
    const { optimizationService } = await import(
      "@/services/optimization/optimization-service"
    );

    await expect(
      optimizationService.optimize({
        context: {
          householdId: "test",
          regionId: null,
          currency: "ETB",
          members: [],
        },
        planDate: new Date(),
        budget: { date: new Date(), amount: 100, currency: "ETB" },
        pantry: [],
        candidateFoods: [],
        nutrientRequirements: [],
        recentNutrientHistory: [],
        excludedFoodIds: [],
      }),
    ).rejects.toThrow("not yet implemented");
  });
});

describe("AIService contract", () => {
  it("throws not-configured for mapFoodTerm", async () => {
    const { aiService } = await import("@/services/ai/ai-service");

    await expect(
      aiService.mapFoodTerm({ term: "injera", locale: "en" }),
    ).rejects.toThrow("not configured");
  });
});

describe("assessReadiness via buildOptimizationInput exports", () => {
  it("PRIORITY_NUTRIENT_CODES contains expected nutrients", async () => {
    const { PRIORITY_NUTRIENT_CODES } = await import("@/lib/constants");
    expect(PRIORITY_NUTRIENT_CODES).toContain("energy");
    expect(PRIORITY_NUTRIENT_CODES).toContain("iron");
    expect(PRIORITY_NUTRIENT_CODES).toHaveLength(7);
  });
});
