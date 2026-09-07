import type { PregnancyStatus, Sex } from "@prisma/client";
import {
  faoWhoGiftIronProvenance,
  faoWhoGiftIronReferenceRows,
  faoWhoGiftReferenceRecords,
} from "../../../data/requirements/fao-who-gift-v1";
import { faoWhoVitaminAReferenceRecords } from "../../../data/requirements/fao-who-vitamin-a-v1";
import {
  faoWhoZincProvenance,
  faoWhoZincReferenceRows,
} from "../../../data/requirements/fao-who-zinc-v1";
import type {
  CalculatedMemberRequirements,
  HouseholdRequirementResult,
  IronBioavailabilityPercent,
  RequirementAssumptions,
  RequirementCalculationOptions,
  RequirementProfile,
  RequirementProvenance,
  RequirementReferenceRecord,
  ZincBioavailability,
} from "@/types/nutrient-requirements";
import type { NutrientRequirement } from "@/types/optimization";

const SUPPORTED_REFERENCE_NUTRIENTS = [
  "calcium",
  "folate",
  "vitamin_a",
  "iron",
  "zinc",
] as const;

export function calculateAgeInCompletedMonths(
  dateOfBirth: Date,
  referenceDate: Date,
): number {
  if (referenceDate.getTime() < dateOfBirth.getTime()) {
    throw new Error("Reference date cannot be before date of birth.");
  }

  let months =
    (referenceDate.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (referenceDate.getMonth() - dateOfBirth.getMonth());

  if (referenceDate.getDate() < dateOfBirth.getDate()) {
    months -= 1;
  }

  return months;
}

function matchesAge(
  record: RequirementReferenceRecord,
  ageMonths: number,
): boolean {
  if (ageMonths < record.minAgeMonths) {
    return false;
  }

  if (
    record.maxAgeMonths !== null &&
    ageMonths > record.maxAgeMonths
  ) {
    return false;
  }

  return true;
}

function matchesSex(
  record: RequirementReferenceRecord,
  sex: Sex,
): boolean {
  return record.sex === "ANY" || record.sex === sex;
}

function isLifeStageOverride(
  record: RequirementReferenceRecord,
): boolean {
  return record.pregnancyStatus !== undefined;
}

function mergeAssumptions(
  current: RequirementAssumptions,
  incoming?: RequirementAssumptions,
): RequirementAssumptions {
  if (!incoming) {
    return current;
  }

  return {
    ...current,
    ...incoming,
    notes: [
      ...(current.notes ?? []),
      ...(incoming.notes ?? []),
    ],
  };
}

function uniqueProvenance(
  records: RequirementProvenance[],
): RequirementProvenance[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.source,
      record.sourceName,
      record.sourceUrl,
      record.publicationOrReference,
      record.referenceType,
      record.retrievedAt,
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getReferenceRecords(
  nutrientCode: string,
): RequirementReferenceRecord[] {
  if (nutrientCode === "vitamin_a") {
    return faoWhoVitaminAReferenceRecords;
  }

  return faoWhoGiftReferenceRecords;
}

export function findRequirementReference(
  profile: RequirementProfile,
  nutrientCode: string,
  planDate: Date,
): {
  record: RequirementReferenceRecord | null;
  warnings: string[];
} {
  const warnings: string[] = [];

  const ageMonths = calculateAgeInCompletedMonths(
    profile.dateOfBirth,
    planDate,
  );

  const referenceRecords = getReferenceRecords(nutrientCode);

  const candidates = referenceRecords.filter(
    (record) =>
      record.nutrientCode === nutrientCode &&
      matchesAge(record, ageMonths) &&
      matchesSex(record, profile.sex),
  );

  if (
    nutrientCode === "calcium" &&
    profile.pregnancyStatus === "PREGNANT"
  ) {
    warnings.push(
      "Calcium pregnancy reference was not automatically applied because the current profile does not record pregnancy trimester.",
    );

    const ordinaryRecord = candidates.find(
      (record) => !isLifeStageOverride(record),
    );

    return {
      record: ordinaryRecord ?? null,
      warnings,
    };
  }

  if (
    profile.pregnancyStatus === "PREGNANT" ||
    profile.pregnancyStatus === "LACTATING"
  ) {
    const lifeStageRecord = candidates.find(
      (record) =>
        record.pregnancyStatus === profile.pregnancyStatus,
    );

    if (lifeStageRecord) {
      return {
        record: lifeStageRecord,
        warnings,
      };
    }
  }

  const ordinaryRecord = candidates.find(
    (record) => !isLifeStageOverride(record),
  );

  if (
    nutrientCode === "vitamin_a" &&
    ageMonths >= 120 &&
    ageMonths <= 227 &&
    !ordinaryRecord
  ) {
    warnings.push(
      "Vitamin A requirement is unavailable for ages 10-18 because the FAO/WHO source presents an estimated mean requirement range rather than one exact target, and Nourish does not invent a single value.",
    );
  }

  return {
    record: ordinaryRecord ?? null,
    warnings,
  };
}

export function calculateIronRequirement(
  profile: RequirementProfile,
  planDate: Date,
  bioavailabilityPercent?: IronBioavailabilityPercent,
): {
  requirement: NutrientRequirement | null;
  assumptions: RequirementAssumptions;
  provenance: RequirementProvenance[];
  warnings: string[];
} {
  const warnings: string[] = [];

  if (bioavailabilityPercent === undefined) {
    return {
      requirement: null,
      assumptions: {},
      provenance: [],
      warnings: [
        "Iron requirement is unavailable because no dietary iron bioavailability assumption was provided.",
      ],
    };
  }

  const assumptions: RequirementAssumptions = {
    ironBioavailabilityPercent: bioavailabilityPercent,
    notes: [
      `Iron EAR modeled using ${bioavailabilityPercent}% dietary iron bioavailability.`,
    ],
  };

  const ageMonths = calculateAgeInCompletedMonths(
    profile.dateOfBirth,
    planDate,
  );

  if (ageMonths < 132) {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoGiftIronProvenance],
      warnings: [
        "The selected FAO/WHO GIFT iron EAR table does not provide a usable value for this age group.",
      ],
    };
  }

  if (profile.sex === "MALE") {
    const row = faoWhoGiftIronReferenceRows.find(
      (candidate) =>
        candidate.sex === "MALE" &&
        candidate.lifeStage === "STANDARD" &&
        ageMonths >= candidate.minAgeMonths &&
        (candidate.maxAgeMonths === null ||
          ageMonths <= candidate.maxAgeMonths),
    );

    if (!row) {
      return {
        requirement: null,
        assumptions,
        provenance: [faoWhoGiftIronProvenance],
        warnings: [
          "No verified FAO/WHO GIFT iron EAR could be matched to this male profile.",
        ],
      };
    }

    return {
      requirement: {
        nutrientCode: "iron",
        targetAmount: row.values[bioavailabilityPercent],
        unit: "mg",
        memberId: profile.memberId,
      },
      assumptions,
      provenance: [faoWhoGiftIronProvenance],
      warnings,
    };
  }

  if (
    profile.sex === "FEMALE" &&
    profile.pregnancyStatus === "LACTATING"
  ) {
    const row = faoWhoGiftIronReferenceRows.find(
      (candidate) =>
        candidate.sex === "FEMALE" &&
        candidate.lifeStage === "LACTATING" &&
        ageMonths >= candidate.minAgeMonths &&
        (candidate.maxAgeMonths === null ||
          ageMonths <= candidate.maxAgeMonths),
    );

    if (!row) {
      return {
        requirement: null,
        assumptions,
        provenance: [faoWhoGiftIronProvenance],
        warnings: [
          "No verified FAO/WHO GIFT lactation iron EAR could be matched to this profile.",
        ],
      };
    }

    return {
      requirement: {
        nutrientCode: "iron",
        targetAmount: row.values[bioavailabilityPercent],
        unit: "mg",
        memberId: profile.memberId,
      },
      assumptions,
      provenance: [faoWhoGiftIronProvenance],
      warnings,
    };
  }

  if (profile.sex === "FEMALE") {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoGiftIronProvenance],
      warnings: [
        "Iron requirement was not automatically calculated because the available FAO/WHO GIFT female iron categories require life-stage information such as pre-menarche or postmenopausal status that Nourish does not currently collect.",
      ],
    };
  }

  return {
    requirement: null,
    assumptions,
    provenance: [faoWhoGiftIronProvenance],
    warnings: [
      "Iron requirement is unavailable because the selected FAO/WHO GIFT table requires a supported sex-specific category.",
    ],
  };
}

export function calculateZincRequirement(
  profile: RequirementProfile,
  planDate: Date,
  bioavailability?: ZincBioavailability,
): {
  requirement: NutrientRequirement | null;
  assumptions: RequirementAssumptions;
  provenance: RequirementProvenance[];
  warnings: string[];
} {
  if (bioavailability === undefined) {
    return {
      requirement: null,
      assumptions: {},
      provenance: [],
      warnings: [
        "Zinc requirement is unavailable because no dietary zinc bioavailability assumption was provided.",
      ],
    };
  }

  const assumptions: RequirementAssumptions = {
    zincBioavailability: bioavailability,
    notes: [
      `Zinc RNI modeled using ${bioavailability.toLowerCase()} dietary zinc bioavailability.`,
    ],
  };

  const ageMonths = calculateAgeInCompletedMonths(
    profile.dateOfBirth,
    planDate,
  );

  if (ageMonths < 12) {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoZincProvenance],
      warnings: [
        "Zinc requirement is unavailable for infants under 1 year because the FAO/WHO reference distinguishes infant feeding patterns that Nourish does not currently collect.",
      ],
    };
  }

  if (profile.pregnancyStatus === "PREGNANT") {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoZincProvenance],
      warnings: [
        "Pregnancy zinc requirement is unavailable because FAO/WHO zinc recommendations vary by trimester and Nourish does not currently collect pregnancy trimester.",
      ],
    };
  }

  if (profile.pregnancyStatus === "LACTATING") {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoZincProvenance],
      warnings: [
        "Lactation zinc requirement is unavailable because FAO/WHO zinc recommendations vary by months postpartum and Nourish does not currently collect postpartum duration.",
      ],
    };
  }

  const row = faoWhoZincReferenceRows.find(
    (candidate) =>
      ageMonths >= candidate.minAgeMonths &&
      (candidate.maxAgeMonths === null ||
        ageMonths <= candidate.maxAgeMonths) &&
      (candidate.sex === "ANY" ||
        candidate.sex === profile.sex),
  );

  if (!row) {
    return {
      requirement: null,
      assumptions,
      provenance: [faoWhoZincProvenance],
      warnings: [
        "No verified FAO/WHO zinc RNI could be matched to this profile.",
      ],
    };
  }

  return {
    requirement: {
      nutrientCode: "zinc",
      targetAmount: row.values[bioavailability],
      unit: "mg",
      memberId: profile.memberId,
    },
    assumptions,
    provenance: [faoWhoZincProvenance],
    warnings: [],
  };
}

export function calculateMemberRequirements(
  profile: RequirementProfile,
  planDate: Date,
  options: RequirementCalculationOptions = {},
): CalculatedMemberRequirements {
  const requirements: NutrientRequirement[] = [];
  const warnings: string[] = [];
  const unavailableNutrients: string[] = [];
  const provenance: RequirementProvenance[] = [];

  let assumptions: RequirementAssumptions = {};

  for (const nutrientCode of SUPPORTED_REFERENCE_NUTRIENTS) {
    if (nutrientCode === "iron") {
      const ironResult = calculateIronRequirement(
        profile,
        planDate,
        options.ironBioavailabilityPercent,
      );

      warnings.push(...ironResult.warnings);

      assumptions = mergeAssumptions(
        assumptions,
        ironResult.assumptions,
      );

      provenance.push(...ironResult.provenance);

      if (ironResult.requirement) {
        requirements.push(ironResult.requirement);
      } else {
        unavailableNutrients.push("iron");
      }

      continue;
    }

    if (nutrientCode === "zinc") {
      const zincResult = calculateZincRequirement(
        profile,
        planDate,
        options.zincBioavailability,
      );

      warnings.push(...zincResult.warnings);

      assumptions = mergeAssumptions(
        assumptions,
        zincResult.assumptions,
      );

      provenance.push(...zincResult.provenance);

      if (zincResult.requirement) {
        requirements.push(zincResult.requirement);
      } else {
        unavailableNutrients.push("zinc");
      }

      continue;
    }

    const result = findRequirementReference(
      profile,
      nutrientCode,
      planDate,
    );

    warnings.push(...result.warnings);

    if (!result.record) {
      unavailableNutrients.push(nutrientCode);

      warnings.push(
        `No verified ${nutrientCode} reference is available for ${profile.name}'s current profile.`,
      );

      continue;
    }

    requirements.push({
      nutrientCode: result.record.nutrientCode,
      targetAmount: result.record.targetAmount,
      unit: result.record.unit,
      memberId: profile.memberId,
    });

    assumptions = mergeAssumptions(
      assumptions,
      result.record.assumptions,
    );

    provenance.push(result.record.provenance);
  }

  return {
    memberId: profile.memberId,
    requirements,
    assumptions,
    provenance: uniqueProvenance(provenance),
    warnings,
    unavailableNutrients,
  };
}

export function calculateHouseholdRequirements(
  profiles: RequirementProfile[],
  planDate: Date,
  options: RequirementCalculationOptions = {},
): HouseholdRequirementResult {
  const members = profiles.map((profile) =>
    calculateMemberRequirements(
      profile,
      planDate,
      options,
    ),
  );

  const optimizerRequirements = members.flatMap(
    (member) => member.requirements,
  );

  const warnings = members.flatMap((member) =>
    member.warnings.map(
      (warning) => `${member.memberId}: ${warning}`,
    ),
  );

  return {
    members,
    optimizerRequirements,
    warnings,
  };
}

export function toRequirementProfile(member: {
  id: string;
  name: string;
  dateOfBirth: Date;
  sex: Sex;
  pregnancyStatus: PregnancyStatus;
}): RequirementProfile {
  return {
    memberId: member.id,
    name: member.name,
    dateOfBirth: member.dateOfBirth,
    sex: member.sex,
    pregnancyStatus: member.pregnancyStatus,
  };
}