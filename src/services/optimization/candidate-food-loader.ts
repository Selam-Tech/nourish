import type { Currency } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { CandidateFood } from "@/types/optimization";

const SUPPORTED_NUTRIENT_CODES = new Set([
  "energy",
  "protein",
  "iron",
  "calcium",
  "vitamin_a",
  "folate",
  "zinc",
]);

export interface CandidateFoodLoaderOptions {
  regionId: string;
  currency: Currency;
  asOfDate: Date;
}

/**
 * Loads active foods with:
 *
 * - verified imported nutrient composition
 * - the newest eligible regional price on or before the plan date
 *
 * Foods without a usable regional price are still returned with
 * price: null. The optimization adapter decides whether they can
 * be purchased.
 */
export async function loadCandidateFoods(
  options: CandidateFoodLoaderOptions,
): Promise<CandidateFood[]> {
  const foods = await prisma.food.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      canonicalId: "asc",
    },
    include: {
      nutrients: {
        include: {
          nutrient: true,
        },
      },
      prices: {
        where: {
          regionId: options.regionId,
          currency: options.currency,
          observedAt: {
            lte: options.asOfDate,
          },
        },
        orderBy: {
          observedAt: "desc",
        },
      },
    },
  });

  return foods.map((food) => {
    const nutrientsPer100g: Record<string, number> = {};

    for (const foodNutrient of food.nutrients) {
      const nutrientCode = foodNutrient.nutrient.code;

      if (!SUPPORTED_NUTRIENT_CODES.has(nutrientCode)) {
        continue;
      }

      nutrientsPer100g[nutrientCode] =
        foodNutrient.amountPer100g;
    }

    /*
     * Because prices are ordered newest first, find() returns
     * the newest price that is usable by Nourish V1.
     *
     * At present the optimizer supports ETB/kg price records.
     */
    const latestPrice = food.prices.find(
      (price) =>
        price.unit.trim().toLowerCase() === "kg",
    );

    return {
      foodId: food.id,
      canonicalId: food.canonicalId,
      nameEn: food.nameEn,
      nameAm: food.nameAm,
      foodGroup: food.foodGroup,
      defaultUnit: food.defaultUnit,

      nutrientsPer100g,

      price: latestPrice
        ? {
            amount: Number(latestPrice.price),
            unit: latestPrice.unit,
            currency: latestPrice.currency,
            observedAt: latestPrice.observedAt,
            sourceName: latestPrice.sourceName,
          }
        : null,
    };
  });
}