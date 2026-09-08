import type { PregnancyStatus, Sex } from "@prisma/client";

import type { NutrientRequirement } from "@/types/optimization";

export type RequirementReferenceType =
  | "EAR"
  | "RNI"
  | "SAFE_INTAKE"
  | "CALCULATED"
  | "UNAVAILABLE";

export type RequirementSource =
  | "FAO_WHO_GIFT"
  | "FAO_WHO_UNU";

export type IronBioavailabilityPercent = 5 | 10 | 12 | 15;

export type ZincBioavailability =
  | "HIGH"
  | "MODERATE"
  | "LOW";

export type PhysicalActivityLevel =
  | "LIGHT"
  | "MODERATE"
  | "VIGOROUS";

export interface RequirementProvenance {
  source: RequirementSource;
  sourceName: string;
  sourceUrl: string;
  publicationOrReference: string;
  referenceType: RequirementReferenceType;
  retrievedAt: string;
}

export interface RequirementAssumptions {
  ironBioavailabilityPercent?: IronBioavailabilityPercent;
  zincBioavailability?: ZincBioavailability;
  folateBasis?: "DFE";
  vitaminABasis?: "RE";
  proteinBasis?: "SAFE_LEVEL_G_PER_KG";
  physicalActivityLevel?: PhysicalActivityLevel;
  physicalActivityLevelValue?: number;
  energyBasis?: "BMR_X_PAL";
  notes?: string[];
}

export interface RequirementCalculationOptions {
  ironBioavailabilityPercent?: IronBioavailabilityPercent;
  zincBioavailability?: ZincBioavailability;
  physicalActivityLevel?: PhysicalActivityLevel;
}

export interface RequirementProfile {
  memberId: string;
  name: string;
  dateOfBirth: Date;
  sex: Sex;
  pregnancyStatus: PregnancyStatus;
  weightKg?: number | null;
}

export interface RequirementReferenceRecord {
  nutrientCode: string;
  minAgeMonths: number;
  maxAgeMonths: number | null;
  sex: Sex | "ANY";
  pregnancyStatus?: PregnancyStatus;
  targetAmount: number;
  unit: string;
  referenceType: RequirementReferenceType;
  assumptions?: RequirementAssumptions;
  provenance: RequirementProvenance;
}

export interface CalculatedMemberRequirements {
  memberId: string;
  requirements: NutrientRequirement[];
  assumptions: RequirementAssumptions;
  provenance: RequirementProvenance[];
  warnings: string[];
  unavailableNutrients: string[];
}

export interface HouseholdRequirementResult {
  members: CalculatedMemberRequirements[];
  optimizerRequirements: NutrientRequirement[];
  warnings: string[];
}