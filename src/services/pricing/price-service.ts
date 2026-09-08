/**
 * Nourish price normalization utilities.
 *
 * EFCT nutrient values are expressed per 100 g edible portion.
 * The optimizer works with food quantities in grams.
 *
 * Nourish V1 price datasets therefore use ETB/kg and normalize
 * those prices to ETB/g before optimization.
 */

export interface NormalizedFoodPrice {
  pricePerGram: number;
  pricePer100g: number;
  pricePerKg: number;
  currency: "ETB";
}

export function normalizeEtbPerKg(
  pricePerKg: number,
): NormalizedFoodPrice {
  if (
    typeof pricePerKg !== "number" ||
    !Number.isFinite(pricePerKg) ||
    pricePerKg <= 0
  ) {
    throw new Error(
      "Price per kilogram must be a finite number greater than zero",
    );
  }

  return {
    pricePerGram: pricePerKg / 1000,
    pricePer100g: pricePerKg / 10,
    pricePerKg,
    currency: "ETB",
  };
}

export function calculateFoodCost(
  quantityGrams: number,
  pricePerKg: number,
): number {
  if (
    typeof quantityGrams !== "number" ||
    !Number.isFinite(quantityGrams) ||
    quantityGrams < 0
  ) {
    throw new Error(
      "Food quantity must be a finite number greater than or equal to zero",
    );
  }

  const normalized = normalizeEtbPerKg(pricePerKg);

  return quantityGrams * normalized.pricePerGram;
}

export function normalizeStoredFoodPrice(
  price: number,
  unit: string,
  currency: string,
): NormalizedFoodPrice {
  if (currency !== "ETB") {
    throw new Error(
      `Unsupported currency for Nourish V1: ${currency}`,
    );
  }

  const normalizedUnit = unit.trim().toLowerCase();

  if (normalizedUnit !== "kg") {
    throw new Error(
      `Unsupported price unit for Nourish V1: ${unit}`,
    );
  }

  return normalizeEtbPerKg(price);
}