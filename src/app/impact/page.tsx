import Link from "next/link";

import {
  getImpactDashboardData,
} from "@/services/analytics/impact-service";

export const dynamic = "force-dynamic";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function amount(value: number) {
  if (value >= 100) {
    return value.toFixed(0);
  }

  if (value >= 10) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}

export default async function ImpactPage() {
  let data:
    | Awaited<
        ReturnType<
          typeof getImpactDashboardData
        >
      >
    | null = null;

  let error: string | null = null;

  try {
    data =
      await getImpactDashboardData();
  } catch {
    error =
      "Nourish Impact could not connect to the analytics database.";
  }

  if (error || !data) {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6b18]">
          Nourish Impact
        </p>

        <h1 className="text-3xl font-bold text-[#183f2b]">
          Population nutrition intelligence
        </h1>

        <div className="mt-6 rounded-xl border border-[#e0b85b] bg-[#fff8e6] p-5">
          <p className="font-medium text-[#654c12]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const gapRecords =
    data.nutrientGaps.reduce(
      (sum, nutrient) =>
        sum +
        nutrient.belowTargetRecords,
      0,
    );

  const highestGap =
    data.nutrientGaps.find(
      (nutrient) =>
        nutrient.belowTargetRecords > 0,
    ) ?? null;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a36b12]">
              Nourish Impact
            </p>

            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[#183f2b] sm:text-4xl">
              Where should our next aid birr go?
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5d695f]">
              Nourish converts anonymous,
              modeled household nutrition
              affordability patterns into
              decision support for NGOs and
              public-health teams.
            </p>

            <div className="mt-5 rounded-xl bg-[#f4f7f2] p-4 text-sm leading-6 text-[#526057]">
              The household experience asks:
              <strong className="text-[#183f2b]">
                {" "}
                Where should my next birr go?
              </strong>
              <br />
              Nourish Impact asks:
              <strong className="text-[#183f2b]">
                {" "}
                Where should our next aid
                birr go?
              </strong>
              <br />
              Both are designed around the
              same nutrition-affordability
              logic.
            </div>
          </div>

          <div className="rounded-xl border border-[#ead9aa] bg-[#fff9e9] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b6b18]">
              Current dataset
            </p>

            <p className="mt-2 text-lg font-bold text-[#4d3a0d]">
              Nourish calculated records
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6e5c30]">
              This prototype currently
              summarizes records generated
              inside Nourish. It is not a
              national Ethiopia estimate and
              should not be interpreted as
              population prevalence.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#69776e]">
            Aggregate snapshot
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#183f2b]">
            What Nourish is seeing
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Households analyzed"
            value={String(
              data.householdsAnalyzed,
            )}
            detail="Anonymous aggregate count"
          />

          <MetricCard
            label="Optimized plans"
            value={String(
              data.optimizedPlans,
            )}
            detail="Plans included in analysis"
          />

          <MetricCard
            label="Modeled nutrient records"
            value={String(
              data.modeledRecords,
            )}
            detail={`${gapRecords} below-target observations`}
          />

          <MetricCard
            label="Average modeled plan cost"
            value={
              data.averagePlanCostEtb !==
              null
                ? `${data.averagePlanCostEtb.toFixed(
                    2,
                  )} ETB`
                : "—"
            }
            detail="ETB plans only"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#69776e]">
              Affordability gaps
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#183f2b]">
              Modeled nutrient coverage
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657168]">
              A below-target record means
              the modeled plan did not reach
              the selected dietary target
              under its recorded constraints.
            </p>
          </div>

          {data.nutrientGaps.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-[#c9c4b5] p-6 text-sm text-[#68746b]">
              No calculated Nutrient Memory
              records are available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#ddd8ca] text-[#5d695f]">
                    <th className="pb-3 pr-4 font-medium">
                      Nutrient
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Below target
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Gap rate
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Avg. coverage
                    </th>

                    <th className="pb-3 font-medium">
                      Avg. modeled shortfall
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.nutrientGaps.map(
                    (nutrient) => (
                      <tr
                        key={
                          nutrient.nutrientCode
                        }
                        className="border-b border-[#eeeae0] last:border-0"
                      >
                        <td className="py-4 pr-4 font-semibold text-[#253d30]">
                          {
                            nutrient.nutrientName
                          }
                        </td>

                        <td className="py-4 pr-4 text-[#59675e]">
                          {
                            nutrient.belowTargetRecords
                          }
                          /
                          {
                            nutrient.recordsAnalyzed
                          }
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={
                              nutrient.gapRate >
                              0
                                ? "rounded-full bg-[#fff1cf] px-2.5 py-1 font-semibold text-[#7a5610]"
                                : "rounded-full bg-[#edf5ed] px-2.5 py-1 font-semibold text-[#2f6640]"
                            }
                          >
                            {percent(
                              nutrient.gapRate,
                            )}
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-[#59675e]">
                          {percent(
                            nutrient.averageCoverage,
                          )}
                        </td>

                        <td className="py-4 text-[#59675e]">
                          {amount(
                            nutrient.averageShortfall,
                          )}{" "}
                          {nutrient.unit}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#d8d3c3] bg-[#183f2b] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d9c78f]">
              Priority signal
            </p>

            {highestGap ? (
              <>
                <p className="mt-3 text-2xl font-bold">
                  {highestGap.nutrientName}
                </p>

                <p className="mt-3 text-sm leading-6 text-[#e4ebe5]">
                  {
                    highestGap.belowTargetRecords
                  }{" "}
                  of{" "}
                  {
                    highestGap.recordsAnalyzed
                  }{" "}
                  modeled records were below
                  the selected target.
                </p>

                <p className="mt-3 text-sm font-semibold text-[#f1d98e]">
                  {percent(
                    highestGap.gapRate,
                  )}{" "}
                  observed gap rate
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#e4ebe5]">
                No below-target modeled
                records are currently
                available.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm">
            <p className="font-bold text-[#183f2b]">
              Next question
            </p>

            <p className="mt-2 text-sm leading-6 text-[#647068]">
              A gap tells an organization
              where pressure exists. The
              Intervention Lab will test
              what happens when support is
              changed.
            </p>

            <Link
              href="/impact/interventions"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#b77916] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90 hover:no-underline"
            >
              Open Intervention Lab
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="font-bold text-[#183f2b]">
              Privacy by aggregation
            </p>

            <p className="mt-2 text-sm leading-6 text-[#657168]">
              This dashboard uses aggregate
              calculated records and does not
              display household or member
              identities.
            </p>
          </div>

          <div>
            <p className="font-bold text-[#183f2b]">
              Decision support, not diagnosis
            </p>

            <p className="mt-2 text-sm leading-6 text-[#657168]">
              Modeled dietary gaps are not
              blood-test results and do not
              diagnose micronutrient
              deficiency or malnutrition.
            </p>
          </div>

          <div>
            <p className="font-bold text-[#183f2b]">
              Transparent prototype scope
            </p>

            <p className="mt-2 text-sm leading-6 text-[#657168]">
              Current results come from
              Nourish prototype records.
              Wider deployment would require
              representative data and
              validated local price inputs.
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs text-[#7a837c]">
        Generated{" "}
        {data.generatedAt.toLocaleString()}.
        Aggregate modeled dietary data only.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#d8d3c3] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#68746b]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#183f2b]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#7b857e]">
        {detail}
      </p>
    </div>
  );
}