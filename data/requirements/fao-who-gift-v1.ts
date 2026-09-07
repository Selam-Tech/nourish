import type {
  IronBioavailabilityPercent,
  RequirementReferenceRecord,
} from "@/types/nutrient-requirements";

const retrievedAt = "2026-09-07";

const giftProvenance = {
  source: "FAO_WHO_GIFT" as const,
  sourceName: "FAO/WHO GIFT Nutrient Reference Values",
  sourceUrl:
    "https://www.fao.org/gift-individual-food-consumption/data/",
  publicationOrReference:
    "FAO/WHO Vitamin and Mineral Requirements in Human Nutrition, 2nd ed.; values presented by FAO/WHO GIFT",
  referenceType: "EAR" as const,
  retrievedAt,
};

/**
 * FAO/WHO GIFT reference values used by Nourish V1.
 *
 * Age boundaries are represented in completed months.
 *
 * Important:
 * - These are modeled reference targets, not medical diagnoses.
 * - Calcium values below are EARs presented by FAO/WHO GIFT.
 * - Folate values are EARs expressed as mcg DFE/day.
 * - Pregnancy/lactation records override ordinary adult female records
 *   when the applicable life-stage information is available.
 * - Iron is handled separately because its EAR depends on assumed
 *   dietary iron bioavailability.
 * - Nutrients with unresolved assumptions are intentionally not included.
 */
export const faoWhoGiftReferenceRecords: RequirementReferenceRecord[] = [
  // ---------------------------------------------------------------------------
  // CALCIUM — FAO/WHO GIFT EAR, mg/day
  // ---------------------------------------------------------------------------

  {
    nutrientCode: "calcium",
    minAgeMonths: 12,
    maxAgeMonths: 47,
    sex: "ANY",
    targetAmount: 417,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 48,
    maxAgeMonths: 83,
    sex: "ANY",
    targetAmount: 500,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 84,
    maxAgeMonths: 119,
    sex: "ANY",
    targetAmount: 583,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 120,
    maxAgeMonths: 227,
    sex: "ANY",
    targetAmount: 1083,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },

  // Male adults
  {
    nutrientCode: "calcium",
    minAgeMonths: 228,
    maxAgeMonths: 791,
    sex: "MALE",
    targetAmount: 833,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 792,
    maxAgeMonths: null,
    sex: "MALE",
    targetAmount: 1083,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },

  // Female adults
  {
    nutrientCode: "calcium",
    minAgeMonths: 228,
    maxAgeMonths: 611,
    sex: "FEMALE",
    targetAmount: 833,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 612,
    maxAgeMonths: null,
    sex: "FEMALE",
    targetAmount: 1083,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },

  // Female life-stage overrides
  {
    nutrientCode: "calcium",
    minAgeMonths: 120,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "PREGNANT",
    targetAmount: 1000,
    unit: "mg",
    referenceType: "EAR",
    assumptions: {
      notes: [
        "FAO/WHO GIFT calcium pregnancy value applies specifically to the last trimester.",
      ],
    },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "calcium",
    minAgeMonths: 120,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "LACTATING",
    targetAmount: 833,
    unit: "mg",
    referenceType: "EAR",
    provenance: giftProvenance,
  },

  // ---------------------------------------------------------------------------
  // FOLATE — FAO/WHO GIFT EAR, mcg DFE/day
  // ---------------------------------------------------------------------------

  {
    nutrientCode: "folate",
    minAgeMonths: 0,
    maxAgeMonths: 11,
    sex: "ANY",
    targetAmount: 65,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 12,
    maxAgeMonths: 47,
    sex: "ANY",
    targetAmount: 120,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 48,
    maxAgeMonths: 83,
    sex: "ANY",
    targetAmount: 160,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 84,
    maxAgeMonths: 119,
    sex: "ANY",
    targetAmount: 250,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 120,
    maxAgeMonths: 227,
    sex: "ANY",
    targetAmount: 330,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 228,
    maxAgeMonths: null,
    sex: "ANY",
    targetAmount: 320,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },

  // Female life-stage overrides
  {
    nutrientCode: "folate",
    minAgeMonths: 120,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "PREGNANT",
    targetAmount: 520,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
  {
    nutrientCode: "folate",
    minAgeMonths: 120,
    maxAgeMonths: null,
    sex: "FEMALE",
    pregnancyStatus: "LACTATING",
    targetAmount: 450,
    unit: "mcg DFE",
    referenceType: "EAR",
    assumptions: { folateBasis: "DFE" },
    provenance: giftProvenance,
  },
];

interface IronReferenceRow {
  minAgeMonths: number;
  maxAgeMonths: number | null;
  sex: "MALE" | "FEMALE";
  lifeStage:
    | "STANDARD"
    | "PRE_MENARCHE"
    | "POSTMENOPAUSAL"
    | "LACTATING";
  values: Record<IronBioavailabilityPercent, number>;
}

/**
 * FAO/WHO GIFT iron EARs.
 *
 * The source provides values according to assumed dietary iron
 * bioavailability: 15%, 12%, 10%, or 5%.
 *
 * We preserve only categories that can be represented safely.
 *
 * Important:
 * - FAO/WHO GIFT does not provide values in this table for children
 *   younger than 11 years.
 * - General menstruating female values are not supplied in the
 *   FAO/WHO table displayed by GIFT.
 * - We therefore do not invent those values.
 */
export const faoWhoGiftIronReferenceRows: IronReferenceRow[] = [
  {
    minAgeMonths: 132,
    maxAgeMonths: 179,
    sex: "MALE",
    lifeStage: "STANDARD",
    values: {
      15: 6.9,
      12: 8.7,
      10: 10.4,
      5: 20.9,
    },
  },
  {
    minAgeMonths: 180,
    maxAgeMonths: 215,
    sex: "MALE",
    lifeStage: "STANDARD",
    values: {
      15: 8.9,
      12: 11.2,
      10: 13.4,
      5: 26.9,
    },
  },
  {
    minAgeMonths: 216,
    maxAgeMonths: null,
    sex: "MALE",
    lifeStage: "STANDARD",
    values: {
      15: 7.0,
      12: 8.8,
      10: 10.5,
      5: 21.1,
    },
  },
  {
    minAgeMonths: 132,
    maxAgeMonths: 179,
    sex: "FEMALE",
    lifeStage: "PRE_MENARCHE",
    values: {
      15: 5.8,
      12: 7.3,
      10: 8.8,
      5: 17.5,
    },
  },
  {
    minAgeMonths: 216,
    maxAgeMonths: null,
    sex: "FEMALE",
    lifeStage: "POSTMENOPAUSAL",
    values: {
      15: 4.7,
      12: 5.9,
      10: 7.1,
      5: 14.1,
    },
  },
  {
    minAgeMonths: 132,
    maxAgeMonths: null,
    sex: "FEMALE",
    lifeStage: "LACTATING",
    values: {
      15: 7.1,
      12: 8.9,
      10: 10.7,
      5: 21.4,
    },
  },
];

export const faoWhoGiftIronProvenance = {
  ...giftProvenance,
  publicationOrReference:
    "FAO/WHO iron Estimated Average Requirements presented by FAO/WHO GIFT; values vary by assumed dietary iron bioavailability.",
};