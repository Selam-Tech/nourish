import { prisma } from "@/lib/db";

export interface ImpactNutrientGap {
  nutrientCode: string;
  nutrientName: string;
  unit: string;
  recordsAnalyzed: number;
  belowTargetRecords: number;
  gapRate: number;
  averageCoverage: number;
  averageShortfall: number;
}

export interface ImpactDashboardData {
  householdsAnalyzed: number;
  optimizedPlans: number;
  modeledRecords: number;
  planDates: number;
  averagePlanCostEtb: number | null;
  nutrientGaps: ImpactNutrientGap[];
  generatedAt: Date;
}

export async function getImpactDashboardData(): Promise<ImpactDashboardData> {
  /*
   * Only use calculated Nutrient Memory records produced
   * by optimized Nourish plans.
   *
   * This dashboard is aggregate decision support.
   * It does not expose household names or member identities.
   */
  const history = await prisma.nutrientHistory.findMany({
    where: {
      sourceType: "CALCULATED",
      sourcePlanId: {
        not: null,
      },
    },
    include: {
      nutrient: true,
      sourcePlan: {
        select: {
          id: true,
          householdId: true,
          planDate: true,
          status: true,
          totalCost: true,
          currency: true,
        },
      },
    },
    orderBy: {
      recordDate: "desc",
    },
  });

  const optimizedHistory = history.filter(
    (record) =>
      record.sourcePlan?.status === "OPTIMIZED",
  );

  const householdIds = new Set<string>();
  const planIds = new Set<string>();
  const planDates = new Set<string>();

  const planCosts = new Map<string, number>();

  for (const record of optimizedHistory) {
    const plan = record.sourcePlan;

    if (!plan) {
      continue;
    }

    householdIds.add(plan.householdId);
    planIds.add(plan.id);

    planDates.add(
      new Date(plan.planDate)
        .toISOString()
        .slice(0, 10),
    );

    if (
      plan.totalCost !== null &&
      plan.currency === "ETB"
    ) {
      planCosts.set(
        plan.id,
        Number(plan.totalCost),
      );
    }
  }

  const nutrientGroups = new Map<
    string,
    {
      nutrientCode: string;
      nutrientName: string;
      unit: string;
      targetTotal: number;
      actualTotal: number;
      coverageTotal: number;
      belowTargetRecords: number;
      recordsAnalyzed: number;
      shortfallTotal: number;
    }
  >();

  for (const record of optimizedHistory) {
    const existing =
      nutrientGroups.get(
        record.nutrientId,
      );

    const shortfall = Math.max(
      0,
      record.targetAmount -
        record.actualAmount,
    );

    if (existing) {
      existing.targetTotal +=
        record.targetAmount;

      existing.actualTotal +=
        record.actualAmount;

      existing.coverageTotal +=
        record.coverageRatio;

      existing.recordsAnalyzed += 1;

      existing.shortfallTotal +=
        shortfall;

      if (record.coverageRatio < 1) {
        existing.belowTargetRecords += 1;
      }

      continue;
    }

    nutrientGroups.set(
      record.nutrientId,
      {
        nutrientCode:
          record.nutrient.code,
        nutrientName:
          record.nutrient.nameEn,
        unit: record.unit,
        targetTotal:
          record.targetAmount,
        actualTotal:
          record.actualAmount,
        coverageTotal:
          record.coverageRatio,
        belowTargetRecords:
          record.coverageRatio < 1
            ? 1
            : 0,
        recordsAnalyzed: 1,
        shortfallTotal:
          shortfall,
      },
    );
  }

  const nutrientGaps =
    Array.from(
      nutrientGroups.values(),
    )
      .map((group) => ({
        nutrientCode:
          group.nutrientCode,

        nutrientName:
          group.nutrientName,

        unit:
          group.unit,

        recordsAnalyzed:
          group.recordsAnalyzed,

        belowTargetRecords:
          group.belowTargetRecords,

        gapRate:
          group.recordsAnalyzed > 0
            ? group.belowTargetRecords /
              group.recordsAnalyzed
            : 0,

        averageCoverage:
          group.recordsAnalyzed > 0
            ? group.coverageTotal /
              group.recordsAnalyzed
            : 0,

        averageShortfall:
          group.recordsAnalyzed > 0
            ? group.shortfallTotal /
              group.recordsAnalyzed
            : 0,
      }))
      .sort(
        (a, b) =>
          b.gapRate - a.gapRate,
      );

  const costs =
    Array.from(planCosts.values());

  const averagePlanCostEtb =
    costs.length > 0
      ? costs.reduce(
          (sum, cost) =>
            sum + cost,
          0,
        ) / costs.length
      : null;

  return {
    householdsAnalyzed:
      householdIds.size,

    optimizedPlans:
      planIds.size,

    modeledRecords:
      optimizedHistory.length,

    planDates:
      planDates.size,

    averagePlanCostEtb,

    nutrientGaps,

    generatedAt: new Date(),
  };
}