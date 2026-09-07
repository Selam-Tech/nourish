export const PRIORITY_NUTRIENT_CODES = [
  "energy",
  "protein",
  "iron",
  "calcium",
  "vitamin_a",
  "folate",
  "zinc",
] as const;

export type PriorityNutrientCode = (typeof PRIORITY_NUTRIENT_CODES)[number];

export const SUPPORTED_LOCALES = ["en", "am"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const DEFAULT_CURRENCY = "ETB" as const;
