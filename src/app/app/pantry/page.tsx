import Link from "next/link";
import { Card, EmptyState } from "@/components/ui";
import { PantryForm, PantryList } from "@/components/pantry/PantryForm";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold, getAvailableFoods, getPantryItems } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const { t } = createI18n();

  let household = null;
  let foods: Awaited<ReturnType<typeof getAvailableFoods>> = [];
  let pantryItems: Awaited<ReturnType<typeof getPantryItems>> = [];
  let dbError: string | null = null;

  try {
    household = await getDemoHousehold();
    foods = await getAvailableFoods();
    if (household) {
      pantryItems = await getPantryItems(household.id);
    }
  } catch {
    dbError = "Database not connected.";
  }

  if (dbError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{t("pantry.title")}</h1>
        <Card variant="warning"><p className="text-sm">{dbError}</p></Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{t("pantry.title")}</h1>
        <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
          Track foods already available at home. Pantry items feed into meal planning once your
          household profile is set up.
        </p>
        <EmptyState
          title="No household yet"
          description="Create a household before adding pantry foods."
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
      <h1 className="mb-6 text-2xl font-bold">{t("pantry.title")}</h1>

      {foods.length === 0 ? (
        <EmptyState
          title={t("pantry.noFoods")}
          description={t("pantry.empty")}
        />
      ) : (
        <>
          <Card title="Current items" className="mb-6">
            {pantryItems.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{t("pantry.empty")}</p>
            ) : (
              <PantryList householdId={household.id} items={pantryItems} />
            )}
          </Card>
          <Card title={t("pantry.addItem")}>
            <PantryForm householdId={household.id} foods={foods} />
          </Card>
        </>
      )}
    </div>
  );
}
