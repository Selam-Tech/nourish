import { describe, expect, it } from "vitest";
import type {
  CandidateFood,
  NutrientRequirement,
} from "@/types/optimization";

import {
  aggregateHouseholdNutrientTargets,
  DEFAULT_MAX_FOOD_GRAMS,
  toScarcityFoods,
} from "@/services/optimization/optimization-adapter";

describe("aggregateHouseholdNutrientTargets", () => {
  it("sums member requirements by nutrient", () => {
    const requirements: NutrientRequirement[] = [
      {
        nutrientCode: "protein",
        targetAmount: 50,
        unit: "g",
        memberId: "member-1",
      },
      {
        nutrientCode: "protein",
        targetAmount: 40,
        unit: "g",
        memberId: "member-2",
      },
      {
        nutrientCode: "iron",
        targetAmount: 10,
        unit: "mg",
        memberId: "member-1",
      },
    ];

    const result =
      aggregateHouseholdNutrientTargets(
        requirements,
      );

    expect(result).toEqual([
      {
        nutrientCode: "iron",
        targetAmount: 10,
        weight: 1,
      },
      {
        nutrientCode: "protein",
        targetAmount: 90,
        weight: 1,
      },
    ]);
  });

  it("rejects mixed units for the same nutrient", () => {
    const requirements: NutrientRequirement[] = [
      {
        nutrientCode: "protein",
        targetAmount: 50,
        unit: "g",
        memberId: "member-1",
      },
      {
        nutrientCode: "protein",
        targetAmount: 50000,
        unit: "mg",
        memberId: "member-2",
      },
    ];

    expect(() =>
      aggregateHouseholdNutrientTargets(
        requirements,
      ),
    ).toThrow("mixed units");
  });

  it("ignores invalid targets", () => {
    const requirements: NutrientRequirement[] = [
      {
        nutrientCode: "protein",
        targetAmount: 0,
        unit: "g",
        memberId: "member-1",
      },
    ];

    expect(
      aggregateHouseholdNutrientTargets(
        requirements,
      ),
    ).toEqual([]);
  });
});

describe("toScarcityFoods", () => {
  const food: CandidateFood = {
    foodId: "food-1",
    canonicalId: "efct-test",
    nameEn: "Test Food",
    nameAm: null,
    foodGroup: "Test",
    defaultUnit: "g",
    nutrientsPer100g: {
      energy: 200,
      protein: 10,
    },
    price: {
      amount: 160,
      unit: "kg",
      currency: "ETB",
      observedAt: new Date(
        "2026-09-08T00:00:00.000Z",
      ),
      sourceName: "Demo price",
    },
  };

  it("converts ETB/kg into ETB/gram", () => {
    const result = toScarcityFoods([food]);

    expect(result).toHaveLength(1);

    expect(result[0].pricePerGram).toBeCloseTo(
      0.16,
    );

    expect(result[0].maxGrams).toBe(
      DEFAULT_MAX_FOOD_GRAMS,
    );
  });

  it("preserves nutrient values per 100g", () => {
    const result = toScarcityFoods([food]);

    expect(
      result[0].nutrientsPer100g.energy,
    ).toBe(200);

    expect(
      result[0].nutrientsPer100g.protein,
    ).toBe(10);
  });

  it("removes excluded foods", () => {
    const result = toScarcityFoods(
      [food],
      ["food-1"],
    );

    expect(result).toEqual([]);
  });

  it("removes foods without a usable price", () => {
    const result = toScarcityFoods([
      {
        ...food,
        price: null,
      },
    ]);

    expect(result).toEqual([]);
  });

  it("rejects unsupported price units", () => {
    expect(() =>
      toScarcityFoods([
        {
          ...food,
          price: {
            ...food.price!,
            unit: "piece",
          },
        },
      ]),
    ).toThrow("Unsupported price unit");
  });
});