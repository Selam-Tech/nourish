import Link from "next/link";
import { Card, EmptyState, Badge } from "@/components/ui";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold, getTodaysBudget, formatMemberAge } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { t } = createI18n();

  let household = null;
  let todaysBudget = null;
  let dbError: string | null = null;

  try {
    household = await getDemoHousehold();
    if (household) {
      todaysBudget = await getTodaysBudget(household.id);
    }
  } catch {
    dbError = "Database not connected. Configure DATABASE_URL and run migrations.";
  }

  if (dbError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{t("dashboard.title")}</h1>
        <Card variant="warning">
          <p className="text-sm">{dbError}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Copy .env.example to .env, set DATABASE_URL, then run: npm run db:push
          </p>
        </Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("dashboard.title")}</h1>
        <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Welcome to Nourish. Start by setting up your household profile so you can track members,
          pantry items, and daily food budgets.
        </p>
        <EmptyState
          title={t("dashboard.noHousehold")}
          description="Set up your household profile to begin tracking nutrition and budget."
          action={
            <Link
              href="/app/household"
              className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white no-underline hover:no-underline hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t("dashboard.createHousehold")}
            </Link>
          }
        />
      </div>
    );
  }

  const recentPlan = household.mealPlans[0];
  const pantryCount = household.pantryItems.length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t("dashboard.title")}</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {household.name}
        {household.region && ` · ${household.region.nameEn}`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title={t("dashboard.members")}>
          {household.members.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No members added yet.{" "}
              <Link href="/app/household">Add members</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {household.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between text-sm">
                  <span>{member.name}</span>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {formatMemberAge(member.dateOfBirth)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t("dashboard.todaysBudget")}>
          {todaysBudget ? (
            <p className="text-2xl font-semibold" style={{ color: "var(--color-primary)" }}>
              {Number(todaysBudget.amount).toLocaleString()} {todaysBudget.currency}
            </p>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("dashboard.noBudget")}.{" "}
              <Link href="/app/plan">Set budget</Link>
            </p>
          )}
        </Card>

        <Card title={t("dashboard.pantrySummary")}>
          {pantryCount === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("dashboard.emptyPantry")}.{" "}
              <Link href="/app/pantry">Add items</Link>
            </p>
          ) : (
            <>
              <p className="text-2xl font-semibold" style={{ color: "var(--color-primary)" }}>
                {t("dashboard.pantryItems", { count: pantryCount })}
              </p>
              <ul className="mt-2 space-y-1">
                {household.pantryItems.slice(0, 3).map((item) => (
                  <li key={item.id} className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {item.food.nameEn} — {item.quantity} {item.unit}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title={t("dashboard.recentPlan")}>
          {!recentPlan ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("dashboard.noPlan")}
            </p>
          ) : (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant={
                    recentPlan.status === "OPTIMIZED"
                      ? "success"
                      : recentPlan.status === "PENDING_OPTIMIZATION"
                        ? "warning"
                        : "muted"
                  }
                >
                  {recentPlan.status === "PENDING_OPTIMIZATION"
                    ? t("dashboard.planPending")
                    : recentPlan.status}
                </Badge>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(recentPlan.planDate).toLocaleDateString()}
                </span>
              </div>
              {recentPlan.status === "PENDING_OPTIMIZATION" && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("plan.notCalculated")}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
