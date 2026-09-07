import { Card } from "@/components/ui";
import { HouseholdForm } from "@/components/household/HouseholdForm";
import { MemberForm, MemberList } from "@/components/household/MemberForm";
import { createI18n } from "@/lib/i18n/server";
import { getDemoHousehold, getRegions } from "@/services/nutrition/household-service";

export const dynamic = "force-dynamic";

export default async function HouseholdPage() {
  const { t } = createI18n();

  let household = null;
  let regions: Awaited<ReturnType<typeof getRegions>> = [];
  let dbError: string | null = null;

  try {
    [household, regions] = await Promise.all([getDemoHousehold(), getRegions()]);
  } catch {
    dbError = "Database not connected.";
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("household.title")}</h1>

      {dbError ? (
        <Card variant="warning"><p className="text-sm">{dbError}</p></Card>
      ) : (
        <>
          <Card title={household ? "Household settings" : t("household.create")} className="mb-6">
            <HouseholdForm
              initialName={household?.name}
              initialRegionId={household?.regionId}
              regions={regions}
            />
          </Card>

          {household && (
            <>
              <Card title={t("household.members")} className="mb-6">
                <MemberList householdId={household.id} members={household.members} />
              </Card>
              <Card title={t("household.addMember")}>
                <MemberForm householdId={household.id} />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
