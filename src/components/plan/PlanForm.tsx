"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/ui";

interface Readiness {
  isReady: boolean;
  blockers: string[];
  warnings: string[];
}

interface FoodSelection {
  foodId: string;
  canonicalId: string;
  nameEn: string;
  nameAm: string | null;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

interface NutrientCoverage {
  nutrientCode: string;
  targetAmount: number;
  actualAmount: number;
  coverageRatio: number;
  unit: string;
  isGap: boolean;
}

interface UnresolvedGap {
  nutrientCode: string;
  targetAmount: number;
  actualAmount: number;
  shortfallAmount: number;
  unit: string;
  estimatedMarginalCost: number | null;
}

interface OptimizedPlanResult {
  mealPlanId: string;
  status: "OPTIMIZED";
  optimizerStatus: "success" | "partial" | "infeasible";
  totalCost: number;
  currency: string;
  selections: FoodSelection[];
  nutrientCoverage: NutrientCoverage[];
  unresolvedGaps: UnresolvedGap[];
  readiness: Readiness;
}

interface PendingPlanResult {
  mealPlanId: string;
  status: "PENDING_OPTIMIZATION";
  message?: string;
  readiness: Readiness;
}

type PlanResult =
  | OptimizedPlanResult
  | PendingPlanResult;

interface PlanFormProps {
  householdId: string;
  defaultCurrency: string;
}

const NUTRIENT_NAMES: Record<string, string> = {
  energy: "Energy",
  protein: "Protein",
  iron: "Iron",
  calcium: "Calcium",
  vitamin_a: "Vitamin A",
  folate: "Folate",
  zinc: "Zinc",
};

function nutrientName(code: string) {
  return (
    NUTRIENT_NAMES[code] ??
    code
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
  );
}

function formatNumber(
  value: number,
  digits = 1,
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}

function formatPercent(ratio: number) {
  if (!Number.isFinite(ratio)) {
    return "—";
  }

  return `${formatNumber(ratio * 100, 0)}%`;
}

/*
 * Requirement-service warnings can contain internal member
 * identifiers. They are useful for developers, but household
 * users should receive plain-language explanations.
 */
function cleanModelWarning(warning: string) {
  const lower = warning.toLowerCase();

  if (
    lower.includes("energy") &&
    lower.includes("physical activity")
  ) {
    return "Energy was not modeled because physical activity level has not been selected.";
  }

  if (
    lower.includes("iron") &&
    lower.includes("bioavailability")
  ) {
    return "Iron was not modeled because the diet iron absorption assumption has not been selected.";
  }

  if (
    lower.includes("zinc") &&
    lower.includes("bioavailability")
  ) {
    return "Zinc was not modeled because the diet zinc absorption assumption has not been selected.";
  }

  if (
    lower.includes("protein") &&
    lower.includes("weight")
  ) {
    return "Protein was not modeled because a valid body weight is not available.";
  }

  if (
    lower.includes("calcium") &&
    lower.includes("pregnancy")
  ) {
    return "A pregnancy-specific calcium target was not modeled because the required pregnancy information is incomplete.";
  }

  /*
   * Do not expose raw developer warnings that may contain
   * database/member IDs.
   */
  return null;
}

export function PlanForm({
  householdId,
  defaultCurrency,
}: PlanFormProps) {
  const router = useRouter();

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] =
    useState(defaultCurrency);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [planResult, setPlanResult] =
    useState<PlanResult | null>(null);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setPlanResult(null);

    try {
      const budgetAmount = Number(amount);

      if (
        !Number.isFinite(budgetAmount) ||
        budgetAmount <= 0
      ) {
        throw new Error(
          "Available budget must be greater than 0.",
        );
      }

      const budgetRes = await fetch(
        `/api/household/${householdId}/budget`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            date,
            amount: budgetAmount,
            currency,
          }),
        },
      );

      const budgetData =
        await budgetRes.json();

      if (!budgetRes.ok) {
        throw new Error(
          budgetData.error ??
            "Failed to save budget",
        );
      }

      const planRes = await fetch(
        `/api/household/${householdId}/plan`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            planDate: date,
            dailyBudgetId: budgetData.id,
          }),
        },
      );

      const planData =
        await planRes.json();

      if (planRes.status === 422) {
        setPlanResult(
          planData as PendingPlanResult,
        );

        router.refresh();
        return;
      }

      if (!planRes.ok) {
        throw new Error(
          planData.error ??
            "Failed to optimize plan",
        );
      }

      setPlanResult(
        planData as OptimizedPlanResult,
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  const optimized =
    planResult?.status === "OPTIMIZED"
      ? planResult
      : null;

  const cleanWarnings: string[] = optimized
  ? Array.from(
      new Set(
        optimized.readiness.warnings
          .map(cleanModelWarning)
          .filter((warning) => warning !== null),
      ),
    )
  : [];

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <FormField
          label="Date"
          htmlFor="plan-date"
        >
          <input
            id="plan-date"
            type="date"
            className={inputClassName}
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Available budget"
            htmlFor="amount"
          >
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className={inputClassName}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="e.g. 300"
              required
            />
          </FormField>

          <FormField
            label="Currency"
            htmlFor="currency"
          >
            <select
              id="currency"
              className={selectClassName}
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value)
              }
            >
              <option value="ETB">
                ETB (Birr)
              </option>
              <option value="USD">
                USD
              </option>
              <option value="EUR">
                EUR
              </option>
            </select>
          </FormField>
        </div>

        <p
          className="text-xs"
          style={{
            color:
              "var(--color-text-muted)",
          }}
        >
          Nourish uses your household
          profile, verified nutrition data,
          available food prices, and budget
          to find the best achievable
          nutrition plan.
        </p>

        {error && (
          <p
            className="text-sm"
            style={{
              color:
                "var(--color-critical)",
            }}
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Optimizing…"
            : "Find best nutrition for my budget"}
        </Button>
      </form>

      {planResult?.status ===
        "PENDING_OPTIMIZATION" && (
        <Card
          variant="warning"
          title="More information needed"
        >
          <p className="mb-4 text-sm">
            Nourish does not yet have
            enough verified information to
            calculate this plan safely.
          </p>

          {planResult.readiness.blockers
            .length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">
                What is needed
              </p>

              <ul
                className="list-inside list-disc space-y-1 text-sm"
                style={{
                  color:
                    "var(--color-text-muted)",
                }}
              >
                {planResult.readiness.blockers.map(
                  (blocker) => (
                    <li key={blocker}>
                      {blocker}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </Card>
      )}

      {optimized && (
        <div className="space-y-6">
          <Card title="Your optimized plan">
            <div className="mb-5">
              <Badge
                variant={
                  optimized.optimizerStatus ===
                  "success"
                    ? "success"
                    : "warning"
                }
              >
                {optimized.optimizerStatus ===
                "success"
                  ? "Best achievable plan found"
                  : "Partial nutrition coverage"}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--color-border)] p-4">
                <p
                  className="text-xs"
                  style={{
                    color:
                      "var(--color-text-muted)",
                  }}
                >
                  Available budget
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatNumber(
                    Number(amount),
                    2,
                  )}{" "}
                  {optimized.currency}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] p-4">
                <p
                  className="text-xs"
                  style={{
                    color:
                      "var(--color-text-muted)",
                  }}
                >
                  Estimated plan cost
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatNumber(
                    optimized.totalCost,
                    2,
                  )}{" "}
                  {optimized.currency}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Foods to use or buy">
            {optimized.selections.length ===
            0 ? (
              <p
                className="text-sm"
                style={{
                  color:
                    "var(--color-text-muted)",
                }}
              >
                No food quantities were
                selected.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="pb-3 pr-4 font-medium">
                        Food
                      </th>
                      <th className="pb-3 pr-4 font-medium">
                        Amount
                      </th>
                      <th className="pb-3 text-right font-medium">
                        Cost
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {optimized.selections.map(
                      (selection) => (
                        <tr
                          key={
                            selection.foodId
                          }
                          className="border-b border-[var(--color-border)] last:border-0"
                        >
                          <td className="py-3 pr-4">
  <p className="font-medium">
    {selection.nameEn}
  </p>

  {selection.nameAm && (
    <p
      className="mt-1 text-sm"
      style={{ color: "var(--color-text-muted)" }}
    >
      {selection.nameAm}
    </p>
  )}
</td>

                          <td className="py-3 pr-4">
                            {formatNumber(
                              selection.quantity,
                              1,
                            )}{" "}
                            {selection.unit}
                          </td>

                          <td className="py-3 text-right">
                            {formatNumber(
                              selection.totalCost,
                              2,
                            )}{" "}
                            {
                              optimized.currency
                            }
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Modeled nutrient coverage">
            <p
              className="mb-4 text-xs"
              style={{
                color:
                  "var(--color-text-muted)",
              }}
            >
              These values are modeled
              dietary coverage, not a medical
              diagnosis.
            </p>

            <div className="space-y-3">
              {optimized.nutrientCoverage.map(
                (nutrient) => (
                  <div
                    key={
                      nutrient.nutrientCode
                    }
                    className="rounded-lg border border-[var(--color-border)] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {nutrientName(
                            nutrient.nutrientCode,
                          )}
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color:
                              "var(--color-text-muted)",
                          }}
                        >
                          {formatNumber(
                            nutrient.actualAmount,
                            1,
                          )}{" "}
                          /{" "}
                          {formatNumber(
                            nutrient.targetAmount,
                            1,
                          )}{" "}
                          {nutrient.unit}
                        </p>
                      </div>

                      <Badge
                        variant={
                          nutrient.isGap
                            ? "warning"
                            : "success"
                        }
                      >
                        {formatPercent(
                          nutrient.coverageRatio,
                        )}
                      </Badge>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)]"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              nutrient.coverageRatio *
                                100,
                              0,
                            ),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </Card>

          {optimized.unresolvedGaps.length >
            0 && (
            <Card
              variant="warning"
              title="Remaining nutrition gaps"
            >
              <p className="mb-3 text-sm">
                With the current budget and
                modeled food constraints,
                these calculated targets were
                not fully reached.
              </p>

              <ul className="space-y-2">
                {optimized.unresolvedGaps.map(
                  (gap) => (
                    <li
                      key={
                        gap.nutrientCode
                      }
                      className="text-sm"
                    >
                      <span className="font-medium">
                        {nutrientName(
                          gap.nutrientCode,
                        )}
                        :
                      </span>{" "}
                      {formatNumber(
                        gap.shortfallAmount,
                        1,
                      )}{" "}
                      {gap.unit} below the
                      modeled target
                    </li>
                  ),
                )}
              </ul>
            </Card>
          )}

          {cleanWarnings.length > 0 && (
            <Card title="Information still needed">
              <p
                className="mb-3 text-sm"
                style={{
                  color:
                    "var(--color-text-muted)",
                }}
              >
                These nutrients were not
                included in this calculation
                because Nourish still needs
                additional information.
              </p>

              <ul className="list-inside list-disc space-y-2 text-sm">
                {cleanWarnings.map(
                  (warning) => (
                    <li key={warning}>
                      {warning}
                    </li>
                  ),
                )}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}