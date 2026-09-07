import Link from "next/link";
import { Card, EmptyState, Badge } from "@/components/ui";
import { PlanForm } from "@/components/plan/PlanForm";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const { t } = createI18n();

  let household = null;
  let dbError: string | null = null;

  try {
    household = await getDemoHousehold();
  } catch {
    dbError = "Database not connected.";
  }

  if (dbError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{t("plan.title")}</h1>
        <Card variant="warning"><p className="text-sm">{dbError}</p></Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("plan.title")}</h1>
        <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Meal planning uses your household profile, pantry, and daily food budget. Create a household
          first, then return here to prepare an optimization request.
        </p>
        <EmptyState
          title="Household required"
          description="A household must be created before you can prepare a meal plan."
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

  const pendingPlans = household.mealPlans.filter((p) => p.status === "PENDING_OPTIMIZATION");
  const optimizedPlans = household.mealPlans.filter((p) => p.status === "OPTIMIZED");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t("plan.title")}</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Enter your daily food budget. The optimization engine will use this with your pantry and household profile.
      </p>

      <Card title="Budget & optimization request" className="mb-6">
        <PlanForm householdId={household.id} defaultCurrency={household.currency} />
      </Card>

      {(pendingPlans.length > 0 || optimizedPlans.length > 0) && (
        <Card title="Recent plans">
          <ul className="space-y-3">
            {household.mealPlans.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
                <div>
                  <p className="font-medium">{new Date(plan.planDate).toLocaleDateString()}</p>
                  {plan.status === "PENDING_OPTIMIZATION" && (
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {t("plan.notCalculated")}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    plan.status === "OPTIMIZED" ? "success" : plan.status === "PENDING_OPTIMIZATION" ? "warning" : "muted"
                  }
                >
                  {plan.status === "PENDING_OPTIMIZATION" ? t("plan.pending") : plan.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
