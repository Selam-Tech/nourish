import Link from "next/link";

import {
  Badge,
  Card,
  EmptyState,
} from "@/components/ui";
import { createI18n } from "@/lib/i18n/server";
import {
  getDemoHousehold,
  getMealPlanHistory,
  getNutrientHistory,
} from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatAmount(value: number) {
  if (value >= 100) {
    return value.toFixed(0);
  }

  if (value >= 10) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}

export default async function HistoryPage() {
  const { t } = createI18n();

  let household = null;

  let plans: Awaited<
    ReturnType<typeof getMealPlanHistory>
  > = [];

  let nutrientHistory: Awaited<
    ReturnType<typeof getNutrientHistory>
  > = [];

  let dbError: string | null = null;

  try {
    household = await getDemoHousehold();

    if (household) {
      [plans, nutrientHistory] =
        await Promise.all([
          getMealPlanHistory(
            household.id,
          ),
          getNutrientHistory(
            household.id,
          ),
        ]);
    }
  } catch {
    dbError = "Database not connected.";
  }

  if (dbError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">
          {t("history.title")}
        </h1>

        <Card variant="warning">
          <p className="text-sm">
            {dbError}
          </p>
        </Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          {t("history.title")}
        </h1>

        <p
          className="mb-6 text-sm sm:text-base"
          style={{
            color:
              "var(--color-text-muted)",
          }}
        >
          Nutrient Memory tracks modeled
          dietary patterns from optimized
          household plans.
        </p>

        <EmptyState
          title="No household yet"
          description="Create a household to start building meal plan and nutrient history."
          action={
            <Link
              href="/app/household"
              className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white no-underline hover:no-underline hover:opacity-90"
              style={{
                backgroundColor:
                  "var(--color-primary)",
              }}
            >
              Go to Household
            </Link>
          }
        />
      </div>
    );
  }

  const hasData =
    plans.length > 0 ||
    nutrientHistory.length > 0;

  /*
   * Group Nutrient Memory by nutrient so we can
   * identify recurring modeled dietary gaps.
   *
   * This is descriptive only. We do not use these
   * records to diagnose nutrient deficiency.
   */
  const nutrientGroups = new Map<
    string,
    {
      name: string;
      unit: string;
      records: typeof nutrientHistory;
    }
  >();

  for (const record of nutrientHistory) {
    const existing =
      nutrientGroups.get(
        record.nutrientId,
      );

    if (existing) {
      existing.records.push(record);
    } else {
      nutrientGroups.set(
        record.nutrientId,
        {
          name: record.nutrient.nameEn,
          unit: record.unit,
          records: [record],
        },
      );
    }
  }

  const patternSummaries =
    Array.from(
      nutrientGroups.values(),
    )
      .map((group) => {
        const total =
          group.records.length;

        const belowTarget =
          group.records.filter(
            (record) =>
              record.coverageRatio < 1,
          ).length;

        const averageCoverage =
          total > 0
            ? group.records.reduce(
                (sum, record) =>
                  sum +
                  record.coverageRatio,
                0,
              ) / total
            : 0;

        return {
          name: group.name,
          unit: group.unit,
          total,
          belowTarget,
          averageCoverage,
        };
      })
      .sort(
        (a, b) =>
          b.belowTarget -
          a.belowTarget,
      );

  const recurringGaps =
    patternSummaries.filter(
      (pattern) =>
        pattern.belowTarget > 0,
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          {t("history.title")}
        </h1>

        <p
          className="max-w-3xl text-sm sm:text-base"
          style={{
            color:
              "var(--color-text-muted)",
          }}
        >
          Nutrient Memory remembers
          modeled dietary coverage from
          your optimized plans so you can
          see patterns over time.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          title="No history yet"
          description={t(
            "history.empty",
          )}
        />
      ) : (
        <div className="space-y-6">
          {nutrientHistory.length >
            0 && (
            <Card title="Recent nutrition pattern">
              <div className="space-y-4">
                <p
                  className="text-sm"
                  style={{
                    color:
                      "var(--color-text-muted)",
                  }}
                >
                  Based on{" "}
                  {
                    new Set(
                      nutrientHistory.map(
                        (record) =>
                          new Date(
                            record.recordDate,
                          )
                            .toISOString()
                            .slice(0, 10),
                      ),
                    ).size
                  }{" "}
                  recorded plan date
                  {new Set(
                    nutrientHistory.map(
                      (record) =>
                        new Date(
                          record.recordDate,
                        )
                          .toISOString()
                          .slice(0, 10),
                    ),
                  ).size === 1
                    ? ""
                    : "s"}
                  .
                </p>

                {recurringGaps.length >
                0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recurringGaps.map(
                      (pattern) => (
                        <div
                          key={
                            pattern.name
                          }
                          className="rounded-lg border border-[var(--color-border)] p-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-medium">
                              {
                                pattern.name
                              }
                            </span>

                            <Badge variant="warning">
                              {
                                pattern.belowTarget
                              }
                              /
                              {
                                pattern.total
                              }{" "}
                              below
                              target
                            </Badge>
                          </div>

                          <p
                            className="text-sm"
                            style={{
                              color:
                                "var(--color-text-muted)",
                            }}
                          >
                            Average modeled
                            coverage:{" "}
                            {formatPercent(
                              pattern.averageCoverage,
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[var(--color-border)] p-4">
                    <p className="font-medium">
                      No recurring modeled
                      gaps in the recorded
                      plans.
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          "var(--color-text-muted)",
                      }}
                    >
                      All currently recorded
                      nutrient targets reached
                      at least 100% modeled
                      coverage.
                    </p>
                  </div>
                )}

                <p
                  className="text-xs"
                  style={{
                    color:
                      "var(--color-text-muted)",
                  }}
                >
                  These are modeled dietary
                  patterns from Nourish meal
                  plans. They are not blood
                  test results, medical
                  diagnoses, or treatment
                  recommendations.
                </p>
              </div>
            </Card>
          )}

          {nutrientHistory.length >
            0 && (
            <Card title="Nutrient Memory">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="pb-3 pr-4 font-medium">
                        Date
                      </th>

                      <th className="pb-3 pr-4 font-medium">
                        Nutrient
                      </th>

                      <th className="pb-3 pr-4 font-medium">
                        Modeled amount
                      </th>

                      <th className="pb-3 pr-4 font-medium">
                        Target
                      </th>

                      <th className="pb-3 font-medium">
                        Coverage
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {nutrientHistory.map(
                      (record) => {
                        const reached =
                          record.coverageRatio >=
                          1;

                        return (
                          <tr
                            key={
                              record.id
                            }
                            className="border-b border-[var(--color-border)] last:border-0"
                          >
                            <td className="py-3 pr-4">
                              {new Date(
                                record.recordDate,
                              ).toLocaleDateString()}
                            </td>

                            <td className="py-3 pr-4 font-medium">
                              {
                                record
                                  .nutrient
                                  .nameEn
                              }
                            </td>

                            <td className="py-3 pr-4">
                              {formatAmount(
                                record.actualAmount,
                              )}{" "}
                              {
                                record.unit
                              }
                            </td>

                            <td className="py-3 pr-4">
                              {formatAmount(
                                record.targetAmount,
                              )}{" "}
                              {
                                record.unit
                              }
                            </td>

                            <td className="py-3">
                              <Badge
                                variant={
                                  reached
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {formatPercent(
                                  record.coverageRatio,
                                )}
                              </Badge>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {plans.length > 0 && (
            <Card title="Meal plan history">
              <ul className="space-y-3">
                {plans.map(
                  (plan) => (
                    <li
                      key={plan.id}
                      className="rounded-lg border border-[var(--color-border)] p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">
                          {new Date(
                            plan.planDate,
                          ).toLocaleDateString()}
                        </span>

                        <Badge
                          variant={
                            plan.status ===
                            "OPTIMIZED"
                              ? "success"
                              : "warning"
                          }
                        >
                          {
                            plan.status
                          }
                        </Badge>
                      </div>

                      {plan.items
                        .length >
                        0 && (
                        <ul
                          className="mt-2 space-y-1 text-sm"
                          style={{
                            color:
                              "var(--color-text-muted)",
                          }}
                        >
                          {plan.items.map(
                            (item) => (
                              <li
                                key={
                                  item.id
                                }
                              >
                                {
                                  item
                                    .food
                                    .nameEn
                                }{" "}
                                —{" "}
                                {formatAmount(
                                  item.quantity,
                                )}{" "}
                                {
                                  item.unit
                                }
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/plan"
              className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white no-underline hover:no-underline hover:opacity-90"
              style={{
                backgroundColor:
                  "var(--color-primary)",
              }}
            >
              Create another plan
            </Link>

            <Link
              href="/app/pantry"
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium no-underline hover:no-underline"
            >
              Update pantry
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}