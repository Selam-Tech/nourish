"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, inputClassName, selectClassName, Card } from "@/components/ui";

interface PlanFormProps {
  householdId: string;
  defaultCurrency: string;
}

export function PlanForm({ householdId, defaultCurrency }: PlanFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<{
    mealPlanId: string;
    readiness: { isReady: boolean; blockers: string[]; warnings: string[] };
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlanResult(null);

    try {
      const budgetRes = await fetch(`/api/household/${householdId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: parseFloat(amount), currency }),
      });

      if (!budgetRes.ok) {
        const data = await budgetRes.json();
        throw new Error(data.error ?? "Failed to save budget");
      }

      const budget = await budgetRes.json();

      const planRes = await fetch(`/api/household/${householdId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planDate: date, dailyBudgetId: budget.id }),
      });

      if (!planRes.ok) {
        const data = await planRes.json();
        throw new Error(data.error ?? "Failed to prepare plan");
      }

      const plan = await planRes.json();
      setPlanResult(plan);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Date" htmlFor="plan-date">
          <input
            id="plan-date"
            type="date"
            className={inputClassName}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Available budget" htmlFor="amount">
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className={inputClassName}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Currency" htmlFor="currency">
            <select
              id="currency"
              className={selectClassName}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="ETB">ETB (Birr)</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </FormField>
        </div>
        {error && <p className="text-sm" style={{ color: "var(--color-critical)" }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Preparing…" : "Save budget & prepare optimization request"}
        </Button>
      </form>

      {planResult && (
        <Card variant="warning" title="Optimization status">
          <p className="mb-3 font-medium">Nutrition optimization engine not yet calculated</p>
          <p className="mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Your budget and constraints have been saved. Plan ID: {planResult.mealPlanId}
          </p>
          {!planResult.readiness.isReady && planResult.readiness.blockers.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium">Blockers:</p>
              <ul className="list-inside list-disc text-sm" style={{ color: "var(--color-text-muted)" }}>
                {planResult.readiness.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {planResult.readiness.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium">Warnings:</p>
              <ul className="list-inside list-disc text-sm" style={{ color: "var(--color-text-muted)" }}>
                {planResult.readiness.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
