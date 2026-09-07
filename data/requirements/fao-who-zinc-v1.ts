import type { Sex } from "@prisma/client";
import type { ZincBioavailability } from "@/types/nutrient-requirements";

export interface ZincReferenceRow {
  minAgeMonths: number;
  maxAgeMonths: number | null;
  sex: Sex | "ANY";
  values: Record<ZincBioavailability, number>;
}

const retrievedAt = "2026-09-07";

export const faoWhoZincProvenance = {
  source: "FAO_WHO_GIFT" as const,
  sourceName: "FAO/WHO Dietary Zinc Requirements",
  sourceUrl: "https://www.fao.org/4/y2809e/y2809e0m.htm",
  publicationOrReference:
    "FAO/WHO Vitamin and Mineral Requirements in Human Nutrition, 2nd edition, Chapter 16, Table 56",
  referenceType: "RNI" as const,
  retrievedAt,
};

/**
 * FAO/WHO recommended nutrient intakes for dietary zinc.
 *
 * Unit: mg/day.
 *
 * HIGH = approximately 50% bioavailability
 * MODERATE = approximately 30% bioavailability
 * LOW = approximately 15% bioavailability
 *
 * Nourish does not silently choose a bioavailability category.
 *
 * Infants are intentionally excluded because FAO/WHO distinguishes
 * infant feeding patterns that the current Nourish profile does not collect.
 *
 * Pregnancy and lactation special targets are intentionally excluded
 * from automatic calculation because they require trimester or
 * postpartum-duration information that Nourish does not currently collect.
 */
export const faoWhoZincReferenceRows: ZincReferenceRow[] = [
  {
    minAgeMonths: 12,
    maxAgeMonths: 47,
    sex: "ANY",
    values: {
      HIGH: 2.4,
      MODERATE: 4.1,
      LOW: 8.3,
    },
  },
  {
    minAgeMonths: 48,
    maxAgeMonths: 83,
    sex: "ANY",
    values: {
      HIGH: 2.9,
      MODERATE: 4.8,
      LOW: 9.6,
    },
  },
  {
    minAgeMonths: 84,
    maxAgeMonths: 119,
    sex: "ANY",
    values: {
      HIGH: 3.3,
      MODERATE: 5.6,
      LOW: 11.2,
    },
  },
  {
    minAgeMonths: 120,
    maxAgeMonths: 227,
    sex: "FEMALE",
    values: {
      HIGH: 4.3,
      MODERATE: 7.2,
      LOW: 14.4,
    },
  },
  {
    minAgeMonths: 120,
    maxAgeMonths: 227,
    sex: "MALE",
    values: {
      HIGH: 5.1,
      MODERATE: 8.6,
      LOW: 17.1,
    },
  },
  {
    minAgeMonths: 228,
    maxAgeMonths: null,
    sex: "FEMALE",
    values: {
      HIGH: 3.0,
      MODERATE: 4.9,
      LOW: 9.8,
    },
  },
  {
    minAgeMonths: 228,
    maxAgeMonths: null,
    sex: "MALE",
    values: {
      HIGH: 4.2,
      MODERATE: 7.0,
      LOW: 14.0,
    },
  },
];