import type {
  CandidateFood,
  NutrientRequirement,
} from "@/types/optimization";

import {
  normalizeStoredFoodPrice,
} from "@/services/pricing/price-service";

import type {
  ScarcityFood,
  ScarcityNutrientTarget,
} from "@/services/optimization/scarcity-optimizer";

/**
 * Nourish V1 food feasibility bounds.
 *
 * These are transparent mathematical modeling constraints.
 * They are NOT medical recommendations, dietary guidelines,
 * or prescribed serving sizes.
 *
 * They prevent the linear optimizer from satisfying nutrient
 * targets using unrealistic quantities of a single food.
 *
 * Future versions should replace these with culturally and
 * nutritionally validated food/meal feasibility constraints.
 */
const FOOD_MAX_GRAMS_BY_CANONICAL_ID: Record<
  string,
  number
> = {
  // Staple foods
  "efct2025-010090": 600, // sorghum enjera
  "efct2025-010109": 600, // teff enjera
  "efct2025-020011": 600, // potato

  // Pulses / legumes
  "efct2025-030003": 250, // shiro
  "efct2025-030006": 300, // chickpea
  "efct2025-030032": 250, // lentil

  // Vegetables
  "efct2025-040003": 400, // cabbage
  "efct2025-040004": 300, // carrot
  "efct2025-040008": 400, // Ethiopian kale

  // Fruit
  "efct2025-050003": 300, // avocado
  "efct2025-050005": 400, // banana

  // Energy-dense nuts / seeds
  "efct2025-060007": 100, // groundnut
  "efct2025-060022": 50, // sesame

  // Animal-source foods
  "efct2025-080001": 200, // egg
  "efct2025-100009": 750, // milk
};

/**
 * Fallback for a food that does not yet have an explicit
 * Nourish V1 feasibility bound.
 */
export const DEFAULT_MAX_FOOD_GRAMS = 500;

export function aggregateHouseholdNutrientTargets(
  requirements: NutrientRequirement[],
): ScarcityNutrientTarget[] {
  const totals = new Map<
    string,
    {
      targetAmount: number;
      unit: string;
    }
  >();

  for (const requirement of requirements) {
    if (
      !requirement.nutrientCode.trim() ||
      !Number.isFinite(requirement.targetAmount) ||
      requirement.targetAmount <= 0
    ) {
      continue;
    }

    const existing = totals.get(
      requirement.nutrientCode,
    );

    if (!existing) {
      totals.set(requirement.nutrientCode, {
        targetAmount: requirement.targetAmount,
        unit: requirement.unit,
      });

      continue;
    }

    if (existing.unit !== requirement.unit) {
      throw new Error(
        `Cannot aggregate ${requirement.nutrientCode}: ` +
          `mixed units ${existing.unit} and ${requirement.unit}`,
      );
    }

    existing.targetAmount += requirement.targetAmount;
  }

  return Array.from(totals.entries())
    .map(([nutrientCode, value]) => ({
      nutrientCode,
      targetAmount: value.targetAmount,
      weight: 1,
    }))
    .sort((a, b) =>
      a.nutrientCode.localeCompare(b.nutrientCode),
    );
}

export function toScarcityFoods(
  candidateFoods: CandidateFood[],
  excludedFoodIds: string[] = [],
): ScarcityFood[] {
  const excluded = new Set(excludedFoodIds);

  return candidateFoods
    .filter((food) => !excluded.has(food.foodId))
    .filter((food) => food.price !== null)
    .map((food) => {
      if (!food.price) {
        throw new Error(
          `Food ${food.foodId} has no usable price`,
        );
      }

      const normalizedPrice =
        normalizeStoredFoodPrice(
          food.price.amount,
          food.price.unit,
          food.price.currency,
        );

      const maxGrams =
        FOOD_MAX_GRAMS_BY_CANONICAL_ID[
          food.canonicalId
        ] ?? DEFAULT_MAX_FOOD_GRAMS;

      return {
        foodId: food.foodId,
        name: food.nameEn,
        pricePerGram:
          normalizedPrice.pricePerGram,
        nutrientsPer100g: {
          ...food.nutrientsPer100g,
        },
        maxGrams,
      };
    });
}