import Link from "next/link";
import { Card, EmptyState, Badge } from "@/components/ui";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold, getMealPlanHistory, getNutrientHistory } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { t } = createI18n();

  let household = null;
  let plans: Awaited<ReturnType<typeof getMealPlanHistory>> = [];
  let nutrientHistory: Awaited<ReturnType<typeof getNutrientHistory>> = [];
  let dbError: string | null = null;

  try {
    household = await getDemoHousehold();
    if (household) {
      [plans, nutrientHistory] = await Promise.all([
        getMealPlanHistory(household.id),
        getNutrientHistory(household.id),
      ]);
    }
  } catch {
    dbError = "Database not connected.";
  }

  if (dbError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{t("history.title")}</h1>
        <Card variant="warning"><p className="text-sm">{dbError}</p></Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("history.title")}</h1>
        <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Nutrient Memory will track dietary patterns over time. History appears after a household
          exists and optimized meal plans are calculated.
        </p>
        <EmptyState
          title="No household yet"
          description="Create a household to start building meal plan and nutrient history."
          action={
            <Link
              href="/app/household"
              className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white no-underline hover:no-underline hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Go to Household
            </Link>
          }
        />
      </div>
    );
  }

  const hasData = plans.length > 0 || nutrientHistory.length > 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t("history.title")}</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Nutrient Memory will track dietary patterns over time. Only real calculated data appears here.
      </p>

      {!hasData ? (
        <EmptyState title="No history yet" description={t("history.empty")} />
      ) : (
        <div className="space-y-6">
          {plans.length > 0 && (
            <Card title="Meal plans">
              <ul className="space-y-3">
                {plans.map((plan) => (
                  <li key={plan.id} className="rounded-lg border border-[var(--color-border)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(plan.planDate).toLocaleDateString()}</span>
                      <Badge variant={plan.status === "OPTIMIZED" ? "success" : "warning"}>
                        {plan.status}
                      </Badge>
                    </div>
                    {plan.items.length > 0 && (
                      <ul className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        {plan.items.map((item) => (
                          <li key={item.id}>
                            {item.food.nameEn} — {item.quantity} {item.unit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {nutrientHistory.length > 0 && (
            <Card title="Nutrient coverage history">
              <ul className="space-y-2">
                {nutrientHistory.map((record) => (
                  <li key={record.id} className="flex justify-between text-sm">
                    <span>
                      {record.nutrient.nameEn} — {new Date(record.recordDate).toLocaleDateString()}
                    </span>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {(record.coverageRatio * 100).toFixed(0)}% coverage
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
