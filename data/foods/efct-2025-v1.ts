import type {
  FoodImportRecord,
  FoodNutrientImportRecord,
} from "../../src/types/data-import";

const importedAt = new Date("2026-09-07T00:00:00.000Z");

const provenance = {
  sourceName: "Ethiopian Food Composition Table 2025",
  publicationVersion: "2025",
  importedAt,
  unit: "per 100 g edible portion",
};

export const efctFoods: FoodImportRecord[] = [
  {
    canonicalId: "efct2025-010109",
    nameEn: "Enjera, teff, mixed",
    nameAm: "Ye'dibilik teff enjera",
    foodGroup: "Cereals and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-040003",
    nameEn: "Cabbage, white, raw",
    nameAm: "Tikil gomen, ti're",
    foodGroup: "Vegetables and their products",
    defaultUnit: "g",
    ediblePortion: 0.96,
    provenance,
  },
  {
    canonicalId: "efct2025-040008",
    nameEn: "Ethiopian Kale, leaves, raw",
    nameAm: "Ye'habesha gomen, ti're",
    foodGroup: "Vegetables and their products",
    defaultUnit: "g",
    ediblePortion: 0.52,
    provenance,
  },
  {
    canonicalId: "efct2025-060007",
    nameEn: "Groundnut (peanut), dry, roasted, no fat or salt added",
    nameAm: "Lewze (ocholoni), yedereke, yetekola",
    foodGroup: "Nuts, seeds, and their products",
    defaultUnit: "g",
    ediblePortion: 0.97,
    provenance,
  },
  {
    canonicalId: "efct2025-050003",
    nameEn: "Avocado, fresh, raw",
    nameAm: "Avocado",
    foodGroup: "Fruits and their products",
    defaultUnit: "g",
    ediblePortion: 0.67,
    provenance,
  },
  {
    canonicalId: "efct2025-050005",
    nameEn: "Banana, fresh, ripe, raw",
    nameAm: "Muz",
    foodGroup: "Fruits and their products",
    defaultUnit: "g",
    ediblePortion: 0.58,
    provenance,
  },
  {
    canonicalId: "efct2025-080001",
    nameEn: "Egg, chicken, whole, raw",
    nameAm: "Ye'doro enqulal, ti're",
    foodGroup: "Eggs and their products",
    defaultUnit: "g",
    ediblePortion: 0.88,
    provenance,
  },
  {
    canonicalId: "efct2025-020011",
    nameEn: "Potato, Irish, with peel, raw",
    nameAm: "Yaltelate dinch, ti're",
    foodGroup: "Starchy roots, tubers, and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-030003",
    nameEn: "Broad beans, seed, roasted, seed coat removed, spiced, flour (Shiro)",
    nameAm: "Ye'bakela shiro duket",
    foodGroup: "Legumes and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-030006",
    nameEn: "Chickpeas, seed, whole, fresh, raw",
    nameAm: "Ye'shimbra eshet",
    foodGroup: "Legumes and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },

  // NEW BATCH

  {
    canonicalId: "efct2025-030032",
    nameEn: "Lentil, whole, dry, raw",
    nameAm: "Difin misir, yedereke, ti're",
    foodGroup: "Legumes and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-040004",
    nameEn: "Carrot, peeled, raw",
    nameAm: "Yetalete carot, ti're",
    foodGroup: "Vegetables and their products",
    defaultUnit: "g",
    ediblePortion: 0.72,
    provenance,
  },
  {
    canonicalId: "efct2025-060022",
    nameEn: "Sesame seed, kernel, raw",
    nameAm: "Selit, ti're",
    foodGroup: "Nuts, seeds, and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-100009",
    nameEn: "Milk, cow, fat reduced, fluid, pasteurized, unfortified",
    nameAm: "Ye'lame wetet, yetenate, pasteurized",
    foodGroup: "Milk and milk products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
  {
    canonicalId: "efct2025-010090",
    nameEn: "Enjera, sorghum, mixed",
    nameAm: "Ye'dibilik mashila enjera",
    foodGroup: "Cereals and their products",
    defaultUnit: "g",
    ediblePortion: 1,
    provenance,
  },
];

export const efctNutrients: FoodNutrientImportRecord[] = [
  // Mixed teff enjera — 010109
  { canonicalFoodId: "efct2025-010109", nutrientCode: "energy", amountPer100g: 152, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "protein", amountPer100g: 4.2, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "iron", amountPer100g: 11.1, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "calcium", amountPer100g: 66, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "vitamin_a", amountPer100g: 0, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "folate", amountPer100g: 49, provenance },
  { canonicalFoodId: "efct2025-010109", nutrientCode: "zinc", amountPer100g: 1.2, provenance },

  // Cabbage — 040003
  { canonicalFoodId: "efct2025-040003", nutrientCode: "energy", amountPer100g: 27, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "protein", amountPer100g: 1.1, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "iron", amountPer100g: 0.4, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "calcium", amountPer100g: 31, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "vitamin_a", amountPer100g: 0, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "folate", amountPer100g: 16, provenance },
  { canonicalFoodId: "efct2025-040003", nutrientCode: "zinc", amountPer100g: 0.15, provenance },

  // Ethiopian kale — 040008
  { canonicalFoodId: "efct2025-040008", nutrientCode: "energy", amountPer100g: 38, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "protein", amountPer100g: 4.2, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "iron", amountPer100g: 5.7, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "calcium", amountPer100g: 424, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "vitamin_a", amountPer100g: 321, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "folate", amountPer100g: 73, provenance },
  { canonicalFoodId: "efct2025-040008", nutrientCode: "zinc", amountPer100g: 0.65, provenance },

  // Groundnut — 060007
  { canonicalFoodId: "efct2025-060007", nutrientCode: "energy", amountPer100g: 611, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "protein", amountPer100g: 24.5, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "iron", amountPer100g: 2.7, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "calcium", amountPer100g: 45, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "vitamin_a", amountPer100g: 1, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "folate", amountPer100g: 96, provenance },
  { canonicalFoodId: "efct2025-060007", nutrientCode: "zinc", amountPer100g: 2.7, provenance },

  // Avocado — 050003
  { canonicalFoodId: "efct2025-050003", nutrientCode: "energy", amountPer100g: 154, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "protein", amountPer100g: 1.1, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "iron", amountPer100g: 0.9, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "calcium", amountPer100g: 9, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "vitamin_a", amountPer100g: 16, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "folate", amountPer100g: 90, provenance },
  { canonicalFoodId: "efct2025-050003", nutrientCode: "zinc", amountPer100g: 0.54, provenance },

  // Banana — 050005
  { canonicalFoodId: "efct2025-050005", nutrientCode: "energy", amountPer100g: 106, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "protein", amountPer100g: 0.9, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "iron", amountPer100g: 0.5, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "calcium", amountPer100g: 5, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "vitamin_a", amountPer100g: 6, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "folate", amountPer100g: 20, provenance },
  { canonicalFoodId: "efct2025-050005", nutrientCode: "zinc", amountPer100g: 0.16, provenance },

  // Egg — 080001
  { canonicalFoodId: "efct2025-080001", nutrientCode: "energy", amountPer100g: 118, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "protein", amountPer100g: 11.3, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "iron", amountPer100g: 1.8, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "calcium", amountPer100g: 38, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "vitamin_a", amountPer100g: 81, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "folate", amountPer100g: 47, provenance },
  { canonicalFoodId: "efct2025-080001", nutrientCode: "zinc", amountPer100g: 0.97, provenance },

  // Potato — 020011
  { canonicalFoodId: "efct2025-020011", nutrientCode: "energy", amountPer100g: 75, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "protein", amountPer100g: 2.0, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "iron", amountPer100g: 0.9, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "calcium", amountPer100g: 8, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "vitamin_a", amountPer100g: 0, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "folate", amountPer100g: 11, provenance },
  { canonicalFoodId: "efct2025-020011", nutrientCode: "zinc", amountPer100g: 0.38, provenance },

  // Broad bean shiro — 030003
  { canonicalFoodId: "efct2025-030003", nutrientCode: "energy", amountPer100g: 333, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "protein", amountPer100g: 27.6, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "iron", amountPer100g: 12, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "calcium", amountPer100g: 76, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "vitamin_a", amountPer100g: 19, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "folate", amountPer100g: 130, provenance },
  { canonicalFoodId: "efct2025-030003", nutrientCode: "zinc", amountPer100g: 5, provenance },

  // Chickpeas — 030006
  { canonicalFoodId: "efct2025-030006", nutrientCode: "energy", amountPer100g: 120, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "protein", amountPer100g: 7, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "iron", amountPer100g: 2.3, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "calcium", amountPer100g: 63, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "vitamin_a", amountPer100g: 10, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "folate", amountPer100g: 64, provenance },
  { canonicalFoodId: "efct2025-030006", nutrientCode: "zinc", amountPer100g: 1, provenance },

  // ============================================================
  // NEW: Lentil, whole, dry, raw — 030032
  // ============================================================
  { canonicalFoodId: "efct2025-030032", nutrientCode: "energy", amountPer100g: 322, provenance },
  { canonicalFoodId: "efct2025-030032", nutrientCode: "protein", amountPer100g: 26.9, provenance },
  { canonicalFoodId: "efct2025-030032", nutrientCode: "iron", amountPer100g: 6.7, provenance },
  { canonicalFoodId: "efct2025-030032", nutrientCode: "calcium", amountPer100g: 68, provenance },
  { canonicalFoodId: "efct2025-030032", nutrientCode: "vitamin_a", amountPer100g: 2, provenance },
  {
  canonicalFoodId: "efct2025-030032",
  nutrientCode: "folate",
  amountPer100g: 130,
  provenance,
  quality: {
    sourceFlag: "bracketed",
    qualityNote:
      "EFCT 2025 presents this value in square brackets, indicating lower-quality data due to differences in analytical method, definition, or expression.",
  },
},
  { canonicalFoodId: "efct2025-030032", nutrientCode: "zinc", amountPer100g: 3.89, provenance },

  // ============================================================
  // NEW: Carrot, peeled, raw — 040004
  // ============================================================
  { canonicalFoodId: "efct2025-040004", nutrientCode: "energy", amountPer100g: 33, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "protein", amountPer100g: 1.6, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "iron", amountPer100g: 1.3, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "calcium", amountPer100g: 31, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "vitamin_a", amountPer100g: 1700, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "folate", amountPer100g: 17, provenance },
  { canonicalFoodId: "efct2025-040004", nutrientCode: "zinc", amountPer100g: 0.30, provenance },

  // ============================================================
  // NEW: Sesame seed, kernel, raw — 060022
  // ============================================================
  { canonicalFoodId: "efct2025-060022", nutrientCode: "energy", amountPer100g: 621, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "protein", amountPer100g: 23.3, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "iron", amountPer100g: 7.8, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "calcium", amountPer100g: 131, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "vitamin_a", amountPer100g: 7, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "folate", amountPer100g: 100, provenance },
  { canonicalFoodId: "efct2025-060022", nutrientCode: "zinc", amountPer100g: 10.30, provenance },

  // ============================================================
  // NEW: Cow milk — 100009
  // ============================================================
  { canonicalFoodId: "efct2025-100009", nutrientCode: "energy", amountPer100g: 45, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "protein", amountPer100g: 2.5, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "iron", amountPer100g: 0.1, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "calcium", amountPer100g: 80, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "vitamin_a", amountPer100g: 20, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "folate", amountPer100g: 4, provenance },
  { canonicalFoodId: "efct2025-100009", nutrientCode: "zinc", amountPer100g: 0.25, provenance },

  // ============================================================
  // NEW: Mixed sorghum enjera — 010090
  // ============================================================
  { canonicalFoodId: "efct2025-010090", nutrientCode: "energy", amountPer100g: 155, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "protein", amountPer100g: 4.0, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "iron", amountPer100g: 6.1, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "calcium", amountPer100g: 26, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "vitamin_a", amountPer100g: 0, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "folate", amountPer100g: 17, provenance },
  { canonicalFoodId: "efct2025-010090", nutrientCode: "zinc", amountPer100g: 0.95, provenance },
];