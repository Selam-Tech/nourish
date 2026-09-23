import Link from "next/link";

import {
  getImpactDashboardData,
} from "@/services/analytics/impact-service";

export const dynamic = "force-dynamic";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function amount(value: number) {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function coverageBar(value: number) {
  return Math.max(0, Math.min(value * 100, 100));
}

export default async function ImpactPage() {
  let data:
    | Awaited<ReturnType<typeof getImpactDashboardData>>
    | null = null;

  try {
    data = await getImpactDashboardData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a36b12]">
          Nourish Impact
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#183f2b] sm:text-4xl">
          Program Overview
        </h1>

        <div className="mt-7 rounded-2xl border border-[#e0b85b] bg-[#fff8e6] p-6 text-base text-[#654c12]">
          Nourish Impact could not connect to the analytics database.
        </div>
      </section>
    );
  }

  const totalGapRecords = data.nutrientGaps.reduce(
    (sum, nutrient) => sum + nutrient.belowTargetRecords,
    0,
  );

  const highestGap =
    data.nutrientGaps.find(
      (nutrient) => nutrient.belowTargetRecords > 0,
    ) ?? null;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a36b12]">
              Program Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#183f2b] sm:text-4xl">
              Nutrition support priorities
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5d695f] sm:text-lg">
              See recurring modeled nutrition gaps and identify where
              program support should be investigated.
            </p>
          </div>

          <div className="rounded-xl border border-[#e3d49e] bg-[#fff9e8] px-4 py-3 text-sm leading-6 text-[#725817]">
            <strong>Prototype dataset:</strong> Nourish-generated
            records, not national prevalence data.
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Households analyzed"
          value={String(data.householdsAnalyzed)}
          detail="Anonymous households"
        />

        <MetricCard
          label="Optimized plans"
          value={String(data.optimizedPlans)}
          detail="Plans included"
        />

        <MetricCard
          label="Below-target observations"
          value={String(totalGapRecords)}
          detail={`${data.modeledRecords} nutrient records analyzed`}
        />

        <MetricCard
          label="Average plan cost"
          value={
            data.averagePlanCostEtb !== null
              ? `${data.averagePlanCostEtb.toFixed(2)} ETB`
              : "—"
          }
          detail="Modeled ETB plans"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl bg-[#174c34] p-6 text-white shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#f0d47e]">
            Highest observed gap
          </p>

          {highestGap ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">
                {highestGap.nutrientName}
              </h2>

              <div className="mt-6 text-5xl font-bold text-[#f5d55f]">
                {percent(highestGap.gapRate)}
              </div>

              <p className="mt-2 text-base leading-7 text-[#e5eee8]">
                of analyzed modeled records for this nutrient were
                below the selected dietary target.
              </p>

              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-sm text-[#d9e6dc]">
                  Average modeled coverage
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {percent(highestGap.averageCoverage)}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-base leading-7 text-[#e5eee8]">
              No below-target observations are currently available.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#69776e]">
            Priority nutrients
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#183f2b]">
            Where are the recurring gaps?
          </h2>

          <div className="mt-6 space-y-6">
            {data.nutrientGaps.map((nutrient) => (
              <div key={nutrient.nutrientCode}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-[#243d30]">
                      {nutrient.nutrientName}
                    </p>

                    <p className="mt-1 text-sm text-[#68746b]">
                      {nutrient.belowTargetRecords} of{" "}
                      {nutrient.recordsAnalyzed} below target
                    </p>
                  </div>

                  <span
                    className={
                      nutrient.gapRate > 0
                        ? "rounded-full bg-[#fff1c9] px-3 py-1.5 text-sm font-bold text-[#76520b]"
                        : "rounded-full bg-[#eaf4eb] px-3 py-1.5 text-sm font-bold text-[#2c633c]"
                    }
                  >
                    {percent(nutrient.gapRate)} gap
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#e9ece6]">
                  <div
                    className="h-full rounded-full bg-[#b98518]"
                    style={{
                      width: `${coverageBar(
                        nutrient.averageCoverage,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-[#68746b]">
                  <span>
                    Avg. coverage:{" "}
                    {percent(nutrient.averageCoverage)}
                  </span>

                  <span>
                    Avg. shortfall:{" "}
                    {amount(nutrient.averageShortfall)}{" "}
                    {nutrient.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d8d3c3] bg-white shadow-sm">
        <div className="border-b border-[#e3dfd4] p-6 sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#69776e]">
            Detailed signals
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#183f2b]">
            Nutrient affordability gaps
          </h2>
        </div>

        <div className="overflow-x-auto p-6 sm:p-7">
          <table className="w-full min-w-[720px] text-left text-base">
            <thead>
              <tr className="border-b border-[#d8d3c3] text-sm text-[#5d695f]">
                <th className="pb-4 pr-5 font-semibold">Nutrient</th>
                <th className="pb-4 pr-5 font-semibold">Below target</th>
                <th className="pb-4 pr-5 font-semibold">Gap rate</th>
                <th className="pb-4 pr-5 font-semibold">Avg. coverage</th>
                <th className="pb-4 font-semibold">
                  Avg. modeled shortfall
                </th>
              </tr>
            </thead>

            <tbody>
              {data.nutrientGaps.map((nutrient) => (
                <tr
                  key={nutrient.nutrientCode}
                  className="border-b border-[#eeeae0] last:border-0"
                >
                  <td className="py-5 pr-5 font-bold text-[#253d30]">
                    {nutrient.nutrientName}
                  </td>

                  <td className="py-5 pr-5 text-[#59675e]">
                    {nutrient.belowTargetRecords}/
                    {nutrient.recordsAnalyzed}
                  </td>

                  <td className="py-5 pr-5">
                    <span
                      className={
                        nutrient.gapRate > 0
                          ? "rounded-full bg-[#fff1cf] px-3 py-1.5 font-bold text-[#7a5610]"
                          : "rounded-full bg-[#edf5ed] px-3 py-1.5 font-bold text-[#2f6640]"
                      }
                    >
                      {percent(nutrient.gapRate)}
                    </span>
                  </td>

                  <td className="py-5 pr-5 text-[#59675e]">
                    {percent(nutrient.averageCoverage)}
                  </td>

                  <td className="py-5 text-[#59675e]">
                    {amount(nutrient.averageShortfall)}{" "}
                    {nutrient.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#a36b12]">
            Program decision
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#183f2b]">
            What intervention gives the most nutrition improvement?
          </h2>

          <p className="mt-3 text-base leading-7 text-[#657168]">
            Compare additional food support, budget support, and price
            changes using Nourish&apos;s deterministic optimization
            engine.
          </p>

          <Link
            href="/impact/interventions"
            className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-[#b77916] px-5 py-3 text-base font-bold text-white no-underline hover:opacity-90 hover:no-underline"
          >
            Run an intervention
          </Link>
        </div>

        <div className="rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#69776e]">
            Reports
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#183f2b]">
            Share the evidence
          </h2>

          <p className="mt-3 text-base leading-7 text-[#657168]">
            Prepare transparent program summaries while keeping
            modeled prototype evidence separate from population
            prevalence claims.
          </p>

          <Link
            href="/impact/reports"
            className="mt-5 inline-flex min-h-12 items-center rounded-lg border border-[#b8b3a5] px-5 py-3 text-base font-bold text-[#183f2b] no-underline hover:bg-[#f5f5ef] hover:no-underline"
          >
            View reports
          </Link>
        </div>
      </section>

      <section className="rounded-xl bg-[#eef3ed] p-5 text-sm leading-6 text-[#58665d] sm:text-base">
        <strong className="text-[#183f2b]">Interpretation:</strong>{" "}
        These results describe modeled dietary affordability patterns
        from Nourish records. They are not clinical diagnoses, blood
        test results, or representative estimates for Ethiopia.
      </section>
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
    <div className="rounded-2xl border border-[#d8d3c3] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-base font-medium text-[#66736a]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#183f2b] sm:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-sm text-[#788179]">
        {detail}
      </p>
    </div>
  );
}