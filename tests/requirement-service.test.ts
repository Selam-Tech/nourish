import { describe, expect, it } from "vitest";
import {
  calculateAgeInCompletedMonths,
  calculateEnergyRequirement,
  calculateHouseholdRequirements,
  calculateIronRequirement,
  calculateMemberRequirements,
  calculateProteinRequirement,
  calculateZincRequirement,
  findRequirementReference,
} from "@/services/nutrition/requirement-service";
import type { RequirementProfile } from "@/types/nutrient-requirements";

function createProfile(
  overrides: Partial<RequirementProfile> = {},
): RequirementProfile {
  return {
    memberId: "member-1",
    name: "Test Member",
    dateOfBirth: new Date("2020-01-15T00:00:00.000Z"),
    sex: "FEMALE",
    pregnancyStatus: "NOT_PREGNANT",
    ...overrides,
  };
}

describe("calculateAgeInCompletedMonths", () => {
  it("calculates completed months using the plan date", () => {
    const age = calculateAgeInCompletedMonths(
      new Date("2020-01-15T00:00:00.000Z"),
      new Date("2025-01-14T00:00:00.000Z"),
    );

    expect(age).toBe(59);
  });

  it("increments the month count on the matching day", () => {
    const age = calculateAgeInCompletedMonths(
      new Date("2020-01-15T00:00:00.000Z"),
      new Date("2025-01-15T00:00:00.000Z"),
    );

    expect(age).toBe(60);
  });

  it("rejects a plan date before the date of birth", () => {
    expect(() =>
      calculateAgeInCompletedMonths(
        new Date("2025-01-01T00:00:00.000Z"),
        new Date("2024-12-31T00:00:00.000Z"),
      ),
    ).toThrow("Reference date cannot be before date of birth");
  });
});

describe("findRequirementReference", () => {
  it("selects calcium for a 5-year-old", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
    });

    const result = findRequirementReference(
      profile,
      "calcium",
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(500);
    expect(result.record?.unit).toBe("mg");
  });

  it("selects folate for a 5-year-old", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
    });

    const result = findRequirementReference(
      profile,
      "folate",
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(160);
    expect(result.record?.unit).toBe("mcg DFE");
  });

  it("selects Vitamin A for a 5-year-old", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(200);
    expect(result.record?.unit).toBe("mcg RE");
    expect(result.record?.assumptions?.vitaminABasis).toBe("RE");
  });

  it("selects adult male calcium", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = findRequirementReference(
      profile,
      "calcium",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(833);
  });

  it("selects adult male Vitamin A", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(300);
    expect(result.record?.unit).toBe("mcg RE");
  });

  it("selects adult female Vitamin A", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(270);
  });

  it("uses pregnancy folate override", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
    });

    const result = findRequirementReference(
      profile,
      "folate",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(520);
    expect(result.record?.assumptions?.folateBasis).toBe("DFE");
  });

  it("uses pregnancy Vitamin A override", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(370);
    expect(result.record?.unit).toBe("mcg RE");
  });

  it("does not automatically apply pregnancy calcium without trimester", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
    });

    const result = findRequirementReference(
      profile,
      "calcium",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(833);

    expect(
      result.warnings.some((warning) =>
        warning.includes("does not record pregnancy trimester"),
      ),
    ).toBe(true);
  });

  it("uses lactation folate override", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
    });

    const result = findRequirementReference(
      profile,
      "folate",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(450);
  });

  it("uses lactation calcium override", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
    });

    const result = findRequirementReference(
      profile,
      "calcium",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(833);
  });

  it("uses lactation Vitamin A override", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record?.targetAmount).toBe(450);
  });

  it("does not invent one Vitamin A target for ages 10 to 18", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2012-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
    });

    const result = findRequirementReference(
      profile,
      "vitamin_a",
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.record).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("range rather than one exact target"),
      ),
    ).toBe(true);
  });
});

describe("calculateIronRequirement", () => {
  const adultMale = createProfile({
    memberId: "adult-male",
    name: "Adult Male",
    dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
    sex: "MALE",
    pregnancyStatus: "NOT_APPLICABLE",
  });

  const planDate = new Date("2026-09-07T00:00:00.000Z");

  it("does not calculate iron without bioavailability assumption", () => {
    const result = calculateIronRequirement(adultMale, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("no dietary iron bioavailability assumption"),
      ),
    ).toBe(true);
  });

  it("calculates adult male iron at 10 percent bioavailability", () => {
    const result = calculateIronRequirement(adultMale, planDate, 10);

    expect(result.requirement).toEqual({
      nutrientCode: "iron",
      targetAmount: 10.5,
      unit: "mg",
      memberId: "adult-male",
    });

    expect(result.assumptions.ironBioavailabilityPercent).toBe(10);
  });

  it("calculates adult male iron at 15 percent bioavailability", () => {
    const result = calculateIronRequirement(adultMale, planDate, 15);
    expect(result.requirement?.targetAmount).toBe(7);
  });

  it("calculates adult male iron at 5 percent bioavailability", () => {
    const result = calculateIronRequirement(adultMale, planDate, 5);
    expect(result.requirement?.targetAmount).toBe(21.1);
  });

  it("calculates lactating female iron at 10 percent bioavailability", () => {
    const profile = createProfile({
      memberId: "lactating-member",
      name: "Lactating Member",
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
    });

    const result = calculateIronRequirement(profile, planDate, 10);

    expect(result.requirement).toEqual({
      nutrientCode: "iron",
      targetAmount: 10.7,
      unit: "mg",
      memberId: "lactating-member",
    });
  });

  it("does not guess general adult female iron requirement", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
    });

    const result = calculateIronRequirement(profile, planDate, 10);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("pre-menarche or postmenopausal"),
      ),
    ).toBe(true);
  });

  it("does not invent iron target for children under 11", () => {
    const child = createProfile({
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateIronRequirement(child, planDate, 10);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("does not provide a usable value"),
      ),
    ).toBe(true);
  });

  it("preserves iron provenance and modeling assumption", () => {
    const result = calculateIronRequirement(adultMale, planDate, 12);

    expect(result.requirement?.targetAmount).toBe(8.8);
    expect(result.provenance).toHaveLength(1);
    expect(result.provenance[0].source).toBe("FAO_WHO_GIFT");
    expect(result.assumptions.ironBioavailabilityPercent).toBe(12);

    expect(
      result.assumptions.notes?.some((note) =>
        note.includes("12% dietary iron bioavailability"),
      ),
    ).toBe(true);
  });
});

describe("calculateZincRequirement", () => {
  const planDate = new Date("2026-09-07T00:00:00.000Z");

  const adultMale = createProfile({
    memberId: "adult-male",
    name: "Adult Male",
    dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
    sex: "MALE",
    pregnancyStatus: "NOT_APPLICABLE",
  });

  it("does not calculate zinc without a bioavailability assumption", () => {
    const result = calculateZincRequirement(adultMale, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("no dietary zinc bioavailability assumption"),
      ),
    ).toBe(true);
  });

  it("calculates adult male zinc for high bioavailability", () => {
    const result = calculateZincRequirement(
      adultMale,
      planDate,
      "HIGH",
    );

    expect(result.requirement).toEqual({
      nutrientCode: "zinc",
      targetAmount: 4.2,
      unit: "mg",
      memberId: "adult-male",
    });
  });

  it("calculates adult male zinc for moderate bioavailability", () => {
    const result = calculateZincRequirement(
      adultMale,
      planDate,
      "MODERATE",
    );

    expect(result.requirement?.targetAmount).toBe(7);
  });

  it("calculates adult male zinc for low bioavailability", () => {
    const result = calculateZincRequirement(
      adultMale,
      planDate,
      "LOW",
    );

    expect(result.requirement?.targetAmount).toBe(14);
  });

  it("calculates adult female zinc", () => {
    const profile = createProfile({
      memberId: "adult-female",
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement?.targetAmount).toBe(4.9);
  });

  it("calculates female adolescent zinc", () => {
    const profile = createProfile({
      memberId: "female-adolescent",
      dateOfBirth: new Date("2012-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement?.targetAmount).toBe(7.2);
  });

  it("calculates male adolescent zinc", () => {
    const profile = createProfile({
      memberId: "male-adolescent",
      dateOfBirth: new Date("2012-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement?.targetAmount).toBe(8.6);
  });

  it("calculates zinc for a child age 5", () => {
    const profile = createProfile({
      memberId: "child",
      dateOfBirth: new Date("2021-01-01T00:00:00.000Z"),
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement?.targetAmount).toBe(4.8);
  });

  it("does not guess infant zinc requirement", () => {
    const profile = createProfile({
      memberId: "infant",
      dateOfBirth: new Date("2026-03-01T00:00:00.000Z"),
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("infant feeding patterns"),
      ),
    ).toBe(true);
  });

  it("does not guess pregnancy zinc without trimester", () => {
    const profile = createProfile({
      memberId: "pregnant-member",
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("does not currently collect pregnancy trimester"),
      ),
    ).toBe(true);
  });

  it("does not guess lactation zinc without postpartum duration", () => {
    const profile = createProfile({
      memberId: "lactating-member",
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
    });

    const result = calculateZincRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("does not currently collect postpartum duration"),
      ),
    ).toBe(true);
  });

  it("preserves zinc provenance and bioavailability assumption", () => {
    const result = calculateZincRequirement(
      adultMale,
      planDate,
      "LOW",
    );

    expect(result.provenance).toHaveLength(1);
    expect(result.provenance[0].source).toBe("FAO_WHO_GIFT");
    expect(result.provenance[0].referenceType).toBe("RNI");
    expect(result.assumptions.zincBioavailability).toBe("LOW");

    expect(
      result.assumptions.notes?.some((note) =>
        note.includes("low dietary zinc bioavailability"),
      ),
    ).toBe(true);
  });
});

describe("calculateProteinRequirement", () => {
  const planDate = new Date("2026-09-08T00:00:00.000Z");

  it("calculates adult protein from actual body weight", () => {
    const profile = createProfile({
      memberId: "adult",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 60,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toEqual({
      nutrientCode: "protein",
      targetAmount: 49.8,
      unit: "g",
      memberId: "adult",
    });

    expect(result.assumptions.proteinBasis).toBe(
      "SAFE_LEVEL_G_PER_KG",
    );
  });

  it("rounds calculated adult protein to two decimal places", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 67.3,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement?.targetAmount).toBe(55.86);
  });

  it("does not calculate protein when body weight is missing", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: null,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("valid body weight"),
      ),
    ).toBe(true);
  });

  it("rejects zero body weight", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 0,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();
  });

  it("rejects negative body weight", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: -10,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();
  });

  it("does not invent an under-19 protein target", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2015-01-01T00:00:00.000Z"),
      weightKg: 35,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("under 19 years"),
      ),
    ).toBe(true);
  });

  it("does not calculate pregnancy protein without trimester", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
      weightKg: 60,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("pregnancy trimester"),
      ),
    ).toBe(true);
  });

  it("does not calculate lactation protein without postpartum duration", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
      weightKg: 60,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("postpartum duration"),
      ),
    ).toBe(true);
  });

  it("preserves WHO FAO UNU protein provenance", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 60,
    });

    const result = calculateProteinRequirement(profile, planDate);

    expect(result.provenance).toHaveLength(1);
    expect(result.provenance[0].source).toBe("FAO_WHO_UNU");
    expect(result.provenance[0].referenceType).toBe(
      "SAFE_INTAKE",
    );
  });
});

describe("calculateEnergyRequirement", () => {
  const planDate = new Date("2026-09-08T00:00:00.000Z");

  it("calculates adult female energy using moderate PAL", () => {
    const profile = createProfile({
      memberId: "adult-female",
      dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "NOT_PREGNANT",
      weightKg: 55,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toEqual({
      nutrientCode: "energy",
      targetAmount: 2408,
      unit: "kcal",
      memberId: "adult-female",
    });

    expect(result.assumptions.energyBasis).toBe("BMR_X_PAL");
    expect(result.assumptions.physicalActivityLevel).toBe(
      "MODERATE",
    );
    expect(result.assumptions.physicalActivityLevelValue).toBe(
      1.85,
    );
  });

  it("calculates adult male energy using moderate PAL", () => {
    const profile = createProfile({
      memberId: "adult-male",
      dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 68,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toEqual({
      nutrientCode: "energy",
      targetAmount: 3175,
      unit: "kcal",
      memberId: "adult-male",
    });
  });

  it("does not calculate energy without PAL", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 70,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("no physical activity level"),
      ),
    ).toBe(true);
  });

  it("does not calculate energy without valid body weight", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: null,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("valid body weight"),
      ),
    ).toBe(true);
  });

  it("does not use the adult method for people under 18", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2010-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 50,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("under 18 years"),
      ),
    ).toBe(true);
  });

  it("does not calculate pregnancy energy with the adult-only V1 method", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "PREGNANT",
      weightKg: 60,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("stage-specific energy"),
      ),
    ).toBe(true);
  });

  it("does not calculate lactation energy without postpartum stage", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1995-01-01T00:00:00.000Z"),
      sex: "FEMALE",
      pregnancyStatus: "LACTATING",
      weightKg: 60,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "MODERATE",
    );

    expect(result.requirement).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("postpartum stage"),
      ),
    ).toBe(true);
  });

  it("preserves FAO WHO UNU energy provenance", () => {
    const profile = createProfile({
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
      weightKg: 70,
    });

    const result = calculateEnergyRequirement(
      profile,
      planDate,
      "LIGHT",
    );

    expect(result.provenance).toHaveLength(1);
    expect(result.provenance[0].source).toBe("FAO_WHO_UNU");
    expect(result.provenance[0].referenceType).toBe(
      "CALCULATED",
    );
  });
});

describe("calculateMemberRequirements", () => {
  it("returns calcium, folate and Vitamin A when bioavailability assumptions are absent", () => {
    const profile = createProfile({
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
    });

    const result = calculateMemberRequirements(
      profile,
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(result.requirements).toHaveLength(3);
    expect(result.unavailableNutrients).toContain("iron");
    expect(result.unavailableNutrients).toContain("zinc");

    expect(result.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "calcium",
          targetAmount: 500,
          unit: "mg",
        }),
        expect.objectContaining({
          nutrientCode: "folate",
          targetAmount: 160,
          unit: "mcg DFE",
        }),
        expect.objectContaining({
          nutrientCode: "vitamin_a",
          targetAmount: 200,
          unit: "mcg RE",
        }),
      ]),
    );
  });

  it("adds iron for a supported male when iron assumption is supplied", () => {
    const profile = createProfile({
      memberId: "male-member",
      name: "Male Member",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateMemberRequirements(
      profile,
      new Date("2026-09-07T00:00:00.000Z"),
      {
        ironBioavailabilityPercent: 10,
      },
    );

    expect(result.requirements).toHaveLength(4);
    expect(result.unavailableNutrients).not.toContain("iron");
    expect(result.unavailableNutrients).toContain("zinc");

    expect(result.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "iron",
          targetAmount: 10.5,
        }),
      ]),
    );
  });

  it("adds zinc when zinc assumption is supplied", () => {
    const profile = createProfile({
      memberId: "male-member",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateMemberRequirements(
      profile,
      new Date("2026-09-07T00:00:00.000Z"),
      {
        zincBioavailability: "MODERATE",
      },
    );

    expect(result.requirements).toHaveLength(4);
    expect(result.unavailableNutrients).not.toContain("zinc");
    expect(result.unavailableNutrients).toContain("iron");

    expect(result.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "zinc",
          targetAmount: 7,
          unit: "mg",
          memberId: "male-member",
        }),
      ]),
    );

    expect(result.assumptions.zincBioavailability).toBe("MODERATE");
  });

  it("adds both iron and zinc when both assumptions are supplied", () => {
    const profile = createProfile({
      memberId: "male-member",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateMemberRequirements(
      profile,
      new Date("2026-09-07T00:00:00.000Z"),
      {
        ironBioavailabilityPercent: 10,
        zincBioavailability: "MODERATE",
      },
    );

    expect(result.requirements).toHaveLength(5);
    expect(result.unavailableNutrients).not.toContain("iron");
    expect(result.unavailableNutrients).not.toContain("zinc");
  });

  it("preserves provenance and nutrient assumptions", () => {
    const result = calculateMemberRequirements(
      createProfile(),
      new Date("2026-09-07T00:00:00.000Z"),
      {
        zincBioavailability: "MODERATE",
      },
    );

    expect(result.provenance.length).toBeGreaterThan(0);
    expect(result.assumptions.folateBasis).toBe("DFE");
    expect(result.assumptions.vitaminABasis).toBe("RE");
    expect(result.assumptions.zincBioavailability).toBe("MODERATE");
  });

  it("includes adult protein when a valid body weight is available", () => {
  const profile = createProfile({
    memberId: "adult-protein",
    dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
    sex: "MALE",
    pregnancyStatus: "NOT_APPLICABLE",
    weightKg: 60,
  });

  const result = calculateMemberRequirements(
    profile,
    new Date("2026-09-08T00:00:00.000Z"),
  );

  expect(result.requirements).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        nutrientCode: "protein",
        targetAmount: 49.8,
        unit: "g",
        memberId: "adult-protein",
      }),
    ]),
  );

  expect(result.unavailableNutrients).not.toContain("protein");
  expect(result.assumptions.proteinBasis).toBe(
    "SAFE_LEVEL_G_PER_KG",
  );
});

it("includes adult protein in optimizer requirements", () => {
  const adult = createProfile({
    memberId: "adult-protein",
    dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
    sex: "MALE",
    pregnancyStatus: "NOT_APPLICABLE",
    weightKg: 60,
  });

  const result = calculateHouseholdRequirements(
    [adult],
    new Date("2026-09-08T00:00:00.000Z"),
  );

  expect(result.optimizerRequirements).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        nutrientCode: "protein",
        targetAmount: 49.8,
        unit: "g",
        memberId: "adult-protein",
      }),
    ]),
  );
});

it("marks protein unavailable when adult body weight is missing", () => {
  const profile = createProfile({
    memberId: "adult-no-weight",
    dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
    sex: "MALE",
    pregnancyStatus: "NOT_APPLICABLE",
    weightKg: null,
  });

  const result = calculateMemberRequirements(
    profile,
    new Date("2026-09-08T00:00:00.000Z"),
  );

  expect(result.unavailableNutrients).toContain("protein");

  expect(
    result.requirements.some(
      (requirement) => requirement.nutrientCode === "protein",
    ),
  ).toBe(false);
});
});

describe("calculateHouseholdRequirements", () => {
  it("combines requirements from multiple household members", () => {
    const child = createProfile({
      memberId: "child",
      name: "Child",
      dateOfBirth: new Date("2020-01-01T00:00:00.000Z"),
    });

    const adult = createProfile({
      memberId: "adult",
      name: "Adult",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateHouseholdRequirements(
      [child, adult],
      new Date("2026-09-07T00:00:00.000Z"),
    );

    expect(result.members).toHaveLength(2);
    expect(result.optimizerRequirements).toHaveLength(6);
  });

  it("includes supported iron when household iron assumption is supplied", () => {
    const adultMale = createProfile({
      memberId: "adult-male",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateHouseholdRequirements(
      [adultMale],
      new Date("2026-09-07T00:00:00.000Z"),
      {
        ironBioavailabilityPercent: 10,
      },
    );

    expect(result.optimizerRequirements).toHaveLength(4);

    expect(result.optimizerRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "iron",
          targetAmount: 10.5,
        }),
      ]),
    );
  });

  it("includes zinc when household zinc assumption is supplied", () => {
    const adultMale = createProfile({
      memberId: "adult-male",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateHouseholdRequirements(
      [adultMale],
      new Date("2026-09-07T00:00:00.000Z"),
      {
        zincBioavailability: "MODERATE",
      },
    );

    expect(result.optimizerRequirements).toHaveLength(4);

    expect(result.optimizerRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "zinc",
          targetAmount: 7,
          unit: "mg",
        }),
      ]),
    );
  });

  it("includes both iron and zinc when both household assumptions are supplied", () => {
    const adultMale = createProfile({
      memberId: "adult-male",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sex: "MALE",
      pregnancyStatus: "NOT_APPLICABLE",
    });

    const result = calculateHouseholdRequirements(
      [adultMale],
      new Date("2026-09-07T00:00:00.000Z"),
      {
        ironBioavailabilityPercent: 10,
        zincBioavailability: "MODERATE",
      },
    );

    expect(result.optimizerRequirements).toHaveLength(5);

    expect(result.optimizerRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientCode: "iron",
          targetAmount: 10.5,
        }),
        expect.objectContaining({
          nutrientCode: "zinc",
          targetAmount: 7,
        }),
      ]),
    );
  });
});