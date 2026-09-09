import { describe, expect, it } from "vitest";

import {
  optimizeScarcity,
  type ScarcityFood,
  type ScarcityNutrientTarget,
} from "@/services/optimization/scarcity-optimizer";

const targets: ScarcityNutrientTarget[] = [
  {
    nutrientCode: "energy",
    targetAmount: 2000,
  },
  {
    nutrientCode: "protein",
    targetAmount: 50,
  },
];

const foods: ScarcityFood[] = [
  {
    foodId: "food-a",
    name: "Food A",
    pricePerGram: 0.1,
    maxGrams: 1000,
    nutrientsPer100g: {
      energy: 200,
      protein: 5,
    },
  },
  {
    foodId: "food-b",
    name: "Food B",
    pricePerGram: 0.2,
    maxGrams: 500,
    nutrientsPer100g: {
      energy: 100,
      protein: 20,
    },
  },
];

describe("optimizeScarcity", () => {
  it("never spends more than the available budget", () => {
    const result = optimizeScarcity({
      budgetEtb: 50,
      foods,
      nutrientTargets: targets,
    });

    expect(result.status).toBe("optimal");
    expect(result.totalCostEtb).toBeLessThanOrEqual(
      50.000001,
    );
  });

  it("returns partial nutrient coverage when the budget is too small", () => {
    const result = optimizeScarcity({
      budgetEtb: 10,
      foods,
      nutrientTargets: targets,
    });

    expect(result.status).toBe("optimal");

    expect(
      result.nutrients.some(
        (nutrient) => nutrient.shortfallAmount > 0,
      ),
    ).toBe(true);
  });

  it("can meet modeled nutrient targets when sufficient resources exist", () => {
    const result = optimizeScarcity({
      budgetEtb: 200,
      foods,
      nutrientTargets: targets,
    });

    expect(result.status).toBe("optimal");

    for (const nutrient of result.nutrients) {
      expect(nutrient.shortfallAmount).toBeLessThanOrEqual(
        0.0001,
      );

      expect(nutrient.coverageRatio).toBeGreaterThanOrEqual(
        0.9999,
      );
    }
  });

  it("returns full shortfall with a zero budget", () => {
    const result = optimizeScarcity({
      budgetEtb: 0,
      foods,
      nutrientTargets: targets,
    });

    expect(result.status).toBe("optimal");
    expect(result.totalCostEtb).toBeCloseTo(0);
    expect(result.selections).toHaveLength(0);

    for (const nutrient of result.nutrients) {
      expect(nutrient.suppliedAmount).toBeCloseTo(0);
      expect(nutrient.shortfallAmount).toBeCloseTo(
        nutrient.targetAmount,
      );
      expect(nutrient.coverageRatio).toBeCloseTo(0);
    }
  });

  it("respects maximum food quantity constraints", () => {
    const limitedFood: ScarcityFood = {
      foodId: "limited-food",
      name: "Limited Food",
      pricePerGram: 0.01,
      maxGrams: 100,
      nutrientsPer100g: {
        energy: 500,
      },
    };

    const result = optimizeScarcity({
      budgetEtb: 100,
      foods: [limitedFood],
      nutrientTargets: [
        {
          nutrientCode: "energy",
          targetAmount: 2000,
        },
      ],
    });

    expect(result.status).toBe("optimal");

    const selection = result.selections.find(
      (item) => item.foodId === "limited-food",
    );

    expect(selection).toBeDefined();

    expect(
      selection?.quantityGrams ?? 0,
    ).toBeLessThanOrEqual(100.000001);

    expect(result.nutrients[0].shortfallAmount).toBeGreaterThan(
      0,
    );
  });

  it("normalizes nutrient shortfalls across different units", () => {
    const result = optimizeScarcity({
      budgetEtb: 0,
      foods,
      nutrientTargets: [
        {
          nutrientCode: "energy",
          targetAmount: 2000,
        },
        {
          nutrientCode: "iron",
          targetAmount: 10,
        },
      ],
    });

    expect(result.status).toBe("optimal");

    const energy = result.nutrients.find(
      (nutrient) => nutrient.nutrientCode === "energy",
    );

    const iron = result.nutrients.find(
      (nutrient) => nutrient.nutrientCode === "iron",
    );

    expect(energy?.coverageRatio).toBeCloseTo(0);
    expect(iron?.coverageRatio).toBeCloseTo(0);

    /*
     * Both are 100% shortfalls despite having very different
     * physical units and numeric target magnitudes.
     */
    expect(
      (energy?.shortfallAmount ?? 0) /
        (energy?.targetAmount ?? 1),
    ).toBeCloseTo(1);

    expect(
      (iron?.shortfallAmount ?? 0) /
        (iron?.targetAmount ?? 1),
    ).toBeCloseTo(1);
  });

  it("does not produce a worse nutrient-shortfall objective when budget increases", () => {
    const lowBudget = optimizeScarcity({
      budgetEtb: 20,
      foods,
      nutrientTargets: targets,
    });

    const highBudget = optimizeScarcity({
      budgetEtb: 100,
      foods,
      nutrientTargets: targets,
    });

    const normalizedShortfall = (
      result: ReturnType<typeof optimizeScarcity>,
    ) =>
      result.nutrients.reduce(
        (total, nutrient) =>
          total +
          nutrient.shortfallAmount /
            nutrient.targetAmount,
        0,
      );

    expect(
      normalizedShortfall(highBudget),
    ).toBeLessThanOrEqual(
      normalizedShortfall(lowBudget) + 0.000001,
    );
  });

  it("rejects a negative budget", () => {
    expect(() =>
      optimizeScarcity({
        budgetEtb: -1,
        foods,
        nutrientTargets: targets,
      }),
    ).toThrow("budgetEtb");
  });

  it("rejects an empty food list", () => {
    expect(() =>
      optimizeScarcity({
        budgetEtb: 100,
        foods: [],
        nutrientTargets: targets,
      }),
    ).toThrow("at least one candidate food");
  });

  it("rejects an empty nutrient target list", () => {
    expect(() =>
      optimizeScarcity({
        budgetEtb: 100,
        foods,
        nutrientTargets: [],
      }),
    ).toThrow("at least one nutrient target");
  });

  it("rejects duplicate food IDs", () => {
    expect(() =>
      optimizeScarcity({
        budgetEtb: 100,
        foods: [foods[0], foods[0]],
        nutrientTargets: targets,
      }),
    ).toThrow("Duplicate candidate food");
  });

  it("rejects duplicate nutrient targets", () => {
    expect(() =>
      optimizeScarcity({
        budgetEtb: 100,
        foods,
        nutrientTargets: [
          targets[0],
          targets[0],
        ],
      }),
    ).toThrow("Duplicate nutrient target");
  });
});