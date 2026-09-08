import type { Sex } from "@prisma/client";
import type { RequirementProvenance } from "@/types/nutrient-requirements";


export interface AdultBmrEquation {
  sex: Sex;
  minAgeYears: number;
  maxAgeYears: number | null;
  weightCoefficient: number;
  constant: number;
}

export const faoWhoEnergyProvenance: RequirementProvenance = {
  source: "FAO_WHO_UNU",
  sourceName: "Human energy requirements",
  sourceUrl: "https://www.fao.org/4/y5686e/y5686e00.htm",
  publicationOrReference:
    "FAO Food and Nutrition Technical Report Series 1 (2004), adult BMR equations and PAL framework",
  referenceType: "CALCULATED",
  retrievedAt: "2026-09-08",
};

/**
 * Adult BMR prediction equations.
 *
 * Result: kcal/day
 * Input: body weight in kilograms.
 *
 * Source: FAO/WHO/UNU Human Energy Requirements (2004),
 * Table 5.2.
 */
export const faoWhoAdultBmrEquations: AdultBmrEquation[] = [
  {
    sex: "MALE",
    minAgeYears: 18,
    maxAgeYears: 29,
    weightCoefficient: 15.057,
    constant: 692.2,
  },
  {
    sex: "MALE",
    minAgeYears: 30,
    maxAgeYears: 59,
    weightCoefficient: 11.472,
    constant: 873.1,
  },
  {
    sex: "MALE",
    minAgeYears: 60,
    maxAgeYears: null,
    weightCoefficient: 11.711,
    constant: 587.7,
  },
  {
    sex: "FEMALE",
    minAgeYears: 18,
    maxAgeYears: 29,
    weightCoefficient: 14.818,
    constant: 486.6,
  },
  {
    sex: "FEMALE",
    minAgeYears: 30,
    maxAgeYears: 59,
    weightCoefficient: 8.126,
    constant: 845.6,
  },
  {
    sex: "FEMALE",
    minAgeYears: 60,
    maxAgeYears: null,
    weightCoefficient: 9.082,
    constant: 658.5,
  },
];

/**
 * Nourish V1 modeling assumptions for PAL.
 *
 * These are explicit representative values used by Nourish inside
 * the FAO/WHO/UNU PAL framework. They are modeling assumptions,
 * not individualized measurements of energy expenditure.
 *
 * LIGHT = 1.55
 * MODERATE = 1.85
 * VIGOROUS = 2.20
 */
export const nourishPhysicalActivityLevelValues = {
  LIGHT: 1.55,
  MODERATE: 1.85,
  VIGOROUS: 2.2,
} as const;