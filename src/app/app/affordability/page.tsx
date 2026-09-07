import Link from "next/link";
import { Card, EmptyState, Badge } from "@/components/ui";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function AffordabilityPage() {
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
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("affordability.title")}</h1>
        <Card variant="warning">
          <p className="text-sm">{dbError}</p>
        </Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("affordability.title")}</h1>
        <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Affordability insights compare nutrition gaps with your budget and local food prices.
          They will appear after household, budget, and planning data exists.
        </p>
        <EmptyState
          title="No data yet"
          description="Create a household and prepare meal plans before affordability analysis can begin."
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

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("affordability.title")}</h1>
      <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
        Identify nutrition targets that repeatedly cannot be reached under your economic and food
        constraints for {household.name}.
      </p>

      <EmptyState
        title="Affordability analysis not yet available"
        description={t("affordability.empty")}
        action={<Badge variant="muted">{t("affordability.planned")}</Badge>}
      />

      <Card className="mt-6" title="What this will show">
        <ul
          className="list-inside list-disc space-y-2 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          <li>Nutrients that consistently fall short of requirements</li>
          <li>Estimated daily cost to close each gap</li>
          <li>Patterns across your meal plan history</li>
          <li>Marginal nutrition value — what another 10 ETB could achieve</li>
        </ul>
        <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Requires the scarcity optimizer and calculated meal plans. No percentages or gaps are
          shown until real data exists.
        </p>
      </Card>
    </div>
  );
}
