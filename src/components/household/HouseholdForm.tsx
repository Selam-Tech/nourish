"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, inputClassName, selectClassName } from "@/components/ui";

interface HouseholdFormProps {
  initialName?: string;
  initialRegionId?: string | null;
  regions: Array<{ id: string; nameEn: string }>;
}

export function HouseholdForm({ initialName = "", initialRegionId, regions }: HouseholdFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [regionId, setRegionId] = useState(initialRegionId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/household", {
        method: initialName ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, regionId: regionId || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save household");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Household name" htmlFor="name">
        <input
          id="name"
          className={`${inputClassName} min-w-0`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </FormField>
      <FormField label="Region" htmlFor="region">
        <select
          id="region"
          className={`${selectClassName} min-w-0`}
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
        >
          <option value="">Select region (optional)</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameEn}
            </option>
          ))}
        </select>
      </FormField>
      {error && <p className="text-sm" style={{ color: "var(--color-critical)" }}>{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Saving…" : initialName ? "Update household" : "Create household"}
      </Button>
    </form>
  );
}
