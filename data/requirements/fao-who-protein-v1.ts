import type { RequirementProvenance } from "@/types/nutrient-requirements";

export interface ProteinSafeLevelRow {
  ageYears: number;
  safeLevelGramsPerKgPerDay: number;
}

export const faoWhoProteinProvenance: RequirementProvenance = {
  source: "FAO_WHO_UNU",
  sourceName:
    "Protein and amino acid requirements in human nutrition",
  sourceUrl:
    "https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf",
  publicationOrReference:
    "WHO Technical Report Series 935 (2007), Table 33a and adult protein requirements",
  referenceType: "SAFE_INTAKE",
  retrievedAt: "2026-09-07",
};

/**
 * WHO/FAO/UNU 2007, Table 33a.
 *
 * Safe protein intake for weaned infants and children through
 * 10 years of age, expressed as grams of protein per kilogram
 * of body weight per day.
 *
 * These are the 2007 safe-level values, not the older values
 * shown for comparison in the same WHO table.
 */
export const faoWhoChildProteinSafeLevels: ProteinSafeLevelRow[] = [
  { ageYears: 0.5, safeLevelGramsPerKgPerDay: 1.31 },
  { ageYears: 1, safeLevelGramsPerKgPerDay: 1.14 },
  { ageYears: 1.5, safeLevelGramsPerKgPerDay: 1.03 },
  { ageYears: 2, safeLevelGramsPerKgPerDay: 0.97 },
  { ageYears: 3, safeLevelGramsPerKgPerDay: 0.90 },
  { ageYears: 4, safeLevelGramsPerKgPerDay: 0.86 },
  { ageYears: 5, safeLevelGramsPerKgPerDay: 0.85 },
  { ageYears: 6, safeLevelGramsPerKgPerDay: 0.89 },
  { ageYears: 7, safeLevelGramsPerKgPerDay: 0.91 },
  { ageYears: 8, safeLevelGramsPerKgPerDay: 0.92 },
  { ageYears: 9, safeLevelGramsPerKgPerDay: 0.92 },
  { ageYears: 10, safeLevelGramsPerKgPerDay: 0.91 },
];

/**
 * WHO/FAO/UNU 2007 adult safe protein intake.
 *
 * 0.83 g protein/kg body weight/day.
 */
export const faoWhoAdultProteinSafeLevelGramsPerKgPerDay = 0.83;