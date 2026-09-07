import { describe, expect, it } from "vitest";
import {
  efctFoods,
  efctNutrients,
} from "../data/foods/efct-2025-v1";
import { nutrientDefinitions } from "../data/foods/nutrient-definitions";

const EXPECTED_FOOD_COUNT = 15;
const EXPECTED_NUTRIENTS_PER_FOOD = 7;
const EXPECTED_NUTRIENT_RECORD_COUNT =
  EXPECTED_FOOD_COUNT * EXPECTED_NUTRIENTS_PER_FOOD;

const expectedNutrientCodes = [
  "energy",
  "protein",
  "iron",
  "calcium",
  "vitamin_a",
  "folate",
  "zinc",
];

describe("EFCT 2025 V1 data integrity", () => {
  it("contains exactly 15 foods", () => {
    expect(efctFoods).toHaveLength(EXPECTED_FOOD_COUNT);
  });

  it("contains exactly 105 nutrient records", () => {
    expect(efctNutrients).toHaveLength(EXPECTED_NUTRIENT_RECORD_COUNT);
  });

  it("contains exactly the 7 priority nutrient definitions", () => {
    const codes = nutrientDefinitions.map((nutrient) => nutrient.code);

    expect(codes).toHaveLength(EXPECTED_NUTRIENTS_PER_FOOD);
    expect([...codes].sort()).toEqual([...expectedNutrientCodes].sort());
  });

  it("has unique food canonical IDs", () => {
    const ids = efctFoods.map((food) => food.canonicalId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique food and nutrient pairs", () => {
    const pairs = efctNutrients.map(
      (record) => `${record.canonicalFoodId}:${record.nutrientCode}`,
    );

    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("gives every food exactly the 7 priority nutrients", () => {
    for (const food of efctFoods) {
      const records = efctNutrients.filter(
        (record) => record.canonicalFoodId === food.canonicalId,
      );

      expect(records).toHaveLength(EXPECTED_NUTRIENTS_PER_FOOD);

      const codes = records.map((record) => record.nutrientCode);

      expect([...codes].sort()).toEqual([...expectedNutrientCodes].sort());
    }
  });

  it("does not contain nutrient records for unknown foods", () => {
    const foodIds = new Set(efctFoods.map((food) => food.canonicalId));

    for (const record of efctNutrients) {
      expect(foodIds.has(record.canonicalFoodId)).toBe(true);
    }
  });

  it("contains only finite, non-negative nutrient amounts", () => {
    for (const record of efctNutrients) {
      expect(Number.isFinite(record.amountPer100g)).toBe(true);
      expect(record.amountPer100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("preserves EFCT provenance on every food", () => {
    for (const food of efctFoods) {
      expect(food.provenance.sourceName).toBe(
        "Ethiopian Food Composition Table 2025",
      );
      expect(food.provenance.publicationVersion).toBe("2025");
      expect(food.provenance.unit).toBe("per 100 g edible portion");
      expect(food.provenance.importedAt).toBeInstanceOf(Date);
    }
  });

  it("preserves EFCT provenance on every nutrient record", () => {
    for (const record of efctNutrients) {
      expect(record.provenance.sourceName).toBe(
        "Ethiopian Food Composition Table 2025",
      );
      expect(record.provenance.publicationVersion).toBe("2025");
      expect(record.provenance.unit).toBe("per 100 g edible portion");
      expect(record.provenance.importedAt).toBeInstanceOf(Date);
    }
  });

  it("stores the verified lentil folate quality annotation", () => {
    const lentilFolate = efctNutrients.find(
      (record) =>
        record.canonicalFoodId === "efct2025-030032" &&
        record.nutrientCode === "folate",
    );

    expect(lentilFolate).toBeDefined();
    expect(lentilFolate?.amountPer100g).toBe(130);
    expect(lentilFolate?.quality?.sourceFlag).toBe("bracketed");
    expect(lentilFolate?.quality?.qualityNote).toContain(
      "square brackets",
    );
  });

  it("does not assign unverified quality flags to other nutrient records", () => {
    const flaggedRecords = efctNutrients.filter(
      (record) => record.quality?.sourceFlag,
    );

    expect(flaggedRecords).toHaveLength(1);

    expect(flaggedRecords[0].canonicalFoodId).toBe("efct2025-030032");
    expect(flaggedRecords[0].nutrientCode).toBe("folate");
    expect(flaggedRecords[0].quality?.sourceFlag).toBe("bracketed");
  });

  it("keeps Vitamin A defined as RE", () => {
    const vitaminA = nutrientDefinitions.find(
      (nutrient) => nutrient.code === "vitamin_a",
    );

    expect(vitaminA).toBeDefined();
    expect(vitaminA?.nameEn).toBe("Vitamin A (RE)");
    expect(vitaminA?.unit).toBe("mcg");
  });

  it("keeps the expected units for all 7 nutrients", () => {
    const units = Object.fromEntries(
      nutrientDefinitions.map((nutrient) => [
        nutrient.code,
        nutrient.unit,
      ]),
    );

    expect(units).toEqual({
      energy: "kcal",
      protein: "g",
      iron: "mg",
      calcium: "mg",
      vitamin_a: "mcg",
      folate: "mcg",
      zinc: "mg",
    });
  });
});