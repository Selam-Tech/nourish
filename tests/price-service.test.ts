import { describe, expect, it } from "vitest";

import {
  calculateFoodCost,
  normalizeEtbPerKg,
  normalizeStoredFoodPrice,
} from "@/services/pricing/price-service";

describe("normalizeEtbPerKg", () => {
  it("converts ETB/kg to ETB/g and ETB/100g", () => {
    const result = normalizeEtbPerKg(160);

    expect(result.pricePerGram).toBeCloseTo(0.16);
    expect(result.pricePer100g).toBeCloseTo(16);
    expect(result.pricePerKg).toBe(160);
    expect(result.currency).toBe("ETB");
  });

  it("rejects zero price", () => {
    expect(() => normalizeEtbPerKg(0)).toThrow(
      "greater than zero",
    );
  });

  it("rejects negative price", () => {
    expect(() => normalizeEtbPerKg(-100)).toThrow(
      "greater than zero",
    );
  });

  it("rejects non-finite price", () => {
    expect(() => normalizeEtbPerKg(Number.NaN)).toThrow(
      "greater than zero",
    );
  });
});

describe("calculateFoodCost", () => {
  it("calculates the cost of a quantity in grams", () => {
    expect(calculateFoodCost(250, 160)).toBeCloseTo(40);
  });

  it("allows zero grams", () => {
    expect(calculateFoodCost(0, 160)).toBe(0);
  });

  it("rejects negative quantities", () => {
    expect(() => calculateFoodCost(-100, 160)).toThrow(
      "greater than or equal to zero",
    );
  });

  it("rejects non-finite quantities", () => {
    expect(() =>
      calculateFoodCost(Number.NaN, 160),
    ).toThrow("greater than or equal to zero");
  });
});

describe("normalizeStoredFoodPrice", () => {
  it("normalizes a stored ETB/kg price", () => {
    const result = normalizeStoredFoodPrice(
      190,
      "kg",
      "ETB",
    );

    expect(result.pricePerGram).toBeCloseTo(0.19);
    expect(result.pricePer100g).toBeCloseTo(19);
  });

  it("accepts unit capitalization and whitespace", () => {
    const result = normalizeStoredFoodPrice(
      100,
      " KG ",
      "ETB",
    );

    expect(result.pricePerGram).toBeCloseTo(0.1);
  });

  it("rejects unsupported units", () => {
    expect(() =>
      normalizeStoredFoodPrice(100, "piece", "ETB"),
    ).toThrow("Unsupported price unit");
  });

  it("rejects unsupported currencies", () => {
    expect(() =>
      normalizeStoredFoodPrice(100, "kg", "USD"),
    ).toThrow("Unsupported currency");
  });
});