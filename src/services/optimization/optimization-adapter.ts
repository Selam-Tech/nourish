import type {
  CandidateFood,
  NutrientRequirement,
  PantrySnapshot,
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
 * Future versions should replace these with culturally and
 * nutritionally validated food/meal feasibility constraints.
 */
const FOOD_MAX_GRAMS_BY_CANONICAL_ID: Record<
  string,
  number
> = {
  "efct2025-010090": 600,
  "efct2025-010109": 600,
  "efct2025-020011": 600,

  "efct2025-030003": 250,
  "efct2025-030006": 300,
  "efct2025-030032": 250,

  "efct2025-040003": 400,
  "efct2025-040004": 300,
  "efct2025-040008": 400,

  "efct2025-050003": 300,
  "efct2025-050005": 400,

  "efct2025-060007": 100,
  "efct2025-060022": 50,

  "efct2025-080001": 200,
  "efct2025-100009": 750,
};

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
      !Number.isFinite(
        requirement.targetAmount,
      ) ||
      requirement.targetAmount <= 0
    ) {
      continue;
    }

    const existing = totals.get(
      requirement.nutrientCode,
    );

    if (!existing) {
      totals.set(
        requirement.nutrientCode,
        {
          targetAmount:
            requirement.targetAmount,
          unit: requirement.unit,
        },
      );

      continue;
    }

    if (
      existing.unit !== requirement.unit
    ) {
      throw new Error(
        `Cannot aggregate ${requirement.nutrientCode}: ` +
          `mixed units ${existing.unit} and ${requirement.unit}`,
      );
    }

    existing.targetAmount +=
      requirement.targetAmount;
  }

  return Array.from(totals.entries())
    .map(([nutrientCode, value]) => ({
      nutrientCode,
      targetAmount: value.targetAmount,
      weight: 1,
    }))
    .sort((a, b) =>
      a.nutrientCode.localeCompare(
        b.nutrientCode,
      ),
    );
}

/**
 * Convert candidate foods and household pantry
 * inventory into mathematical food variables.
 *
 * A pantry item and a purchased item are separate
 * variables because pantry food has zero additional
 * purchase cost but is limited by the quantity
 * actually available.
 *
 * Pantry quantities must be expressed in grams.
 */
export function toScarcityFoods(
  candidateFoods: CandidateFood[],
  pantry: PantrySnapshot[] = [],
  excludedFoodIds: string[] = [],
): ScarcityFood[] {
  const excluded = new Set(
    excludedFoodIds,
  );

  const pantryGramsByFoodId = new Map<
    string,
    number
  >();

  for (const item of pantry) {
    if (item.unit !== "g") {
      throw new Error(
        `Unsupported pantry unit "${item.unit}" for food ${item.foodId}. ` +
          "Nourish V1 pantry quantities must be stored in grams.",
      );
    }

    if (
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      continue;
    }

    pantryGramsByFoodId.set(
      item.foodId,
      (pantryGramsByFoodId.get(
        item.foodId,
      ) ?? 0) + item.quantity,
    );
  }

  const scarcityFoods: ScarcityFood[] = [];

  for (const food of candidateFoods) {
    if (excluded.has(food.foodId)) {
      continue;
    }

    if (!food.price) {
      continue;
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

    const pantryGrams = Math.min(
      pantryGramsByFoodId.get(
        food.foodId,
      ) ?? 0,
      maxGrams,
    );

    if (pantryGrams > 0) {
      scarcityFoods.push({
        variableId:
          `pantry:${food.foodId}`,
        foodId: food.foodId,
        source: "pantry",
        name: food.nameEn,
        pricePerGram: 0,
        nutrientsPer100g: {
          ...food.nutrientsPer100g,
        },
        maxGrams: pantryGrams,
      });
    }

    const purchaseMaxGrams =
      Math.max(
        0,
        maxGrams - pantryGrams,
      );

    if (purchaseMaxGrams > 0) {
      scarcityFoods.push({
        variableId:
          `purchase:${food.foodId}`,
        foodId: food.foodId,
        source: "purchase",
        name: food.nameEn,
        pricePerGram:
          normalizedPrice.pricePerGram,
        nutrientsPer100g: {
          ...food.nutrientsPer100g,
        },
        maxGrams: purchaseMaxGrams,
      });
    }
  }

  return scarcityFoods;
}