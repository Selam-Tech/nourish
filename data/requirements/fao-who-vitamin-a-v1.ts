import type { RequirementReferenceRecord } from "@/types/nutrient-requirements";

const retrievedAt = "2026-09-07";

const vitaminAProvenance = {
  source: "FAO_WHO_GIFT" as const,
  sourceName: "FAO/WHO Vitamin A Requirements",
  sourceUrl: "https://www.fao.org/4/y2809e/y2809e0d.htm",
  publicationOrReference:
    "FAO/WHO Vitamin and Mineral Requirements in Human Nutrition, 2nd edition, Chapter 7, Table 18",
  referenceType: "CALCULATED" as const,
  retrievedAt,
};

/**
 * FAO/WHO Vitamin A estimated mean requirements.
 *
 * Unit: mcg RE/day.
 *
 * Nourish uses RE because the Ethiopian Food Composition Table 2025
 * provides a VITA value expressed as retinol equivalents (RE).
 *
 * Important:
 * - These are dietary planning reference values, not diagnostic thresholds.
 * - FAO/WHO reports ages 10-18 as a range of 330-400 mcg RE/day.
 *   Nourish does not collapse that range into an invented single target.
 * - Pregnancy and lactation are represented as life-stage overrides.
 */
export const faoWhoVitaminAReferenceRecords: RequirementReferenceRecord[] = [
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 0,
    maxAgeMonths: 6,
    sex: "ANY",
    targetAmount: 180,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 7,
    maxAgeMonths: 11,
    sex: "ANY",
    targetAmount: 190,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 12,
    maxAgeMonths: 47,
    sex: "ANY",
    targetAmount: 200,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 48,
    maxAgeMonths: 83,
    sex: "ANY",
    targetAmount: 200,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 84,
    maxAgeMonths: 119,
    sex: "ANY",
    targetAmount: 250,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },

  // Ages 10-18 intentionally omitted.
  // FAO/WHO reports a range of 330-400 mcg RE/day rather than
  // one exact target.

  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 228,
    maxAgeMonths: 779,
    sex: "FEMALE",
    targetAmount: 270,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 228,
    maxAgeMonths: 779,
    sex: "MALE",
    targetAmount: 300,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 780,
    maxAgeMonths: null,
    sex: "ANY",
    targetAmount: 300,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },

  // Life-stage overrides
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 228,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "PREGNANT",
    targetAmount: 370,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
  {
    nutrientCode: "vitamin_a",
    minAgeMonths: 228,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "LACTATING",
    targetAmount: 450,
    unit: "mcg RE",
    referenceType: "CALCULATED",
    assumptions: {
      vitaminABasis: "RE",
    },
    provenance: vitaminAProvenance,
  },
];

export const faoWhoVitaminAProvenance = vitaminAProvenance;