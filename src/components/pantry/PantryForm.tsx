"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, inputClassName, selectClassName } from "@/components/ui";

interface PantryFormProps {
  householdId: string;
  foods: Array<{ id: string; nameEn: string; nameAm: string | null; defaultUnit: string }>;
}

export function PantryForm({ householdId, foods }: PantryFormProps) {
  const router = useRouter();
  const [foodId, setFoodId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFoodChange(id: string) {
    setFoodId(id);
    const food = foods.find((f) => f.id === id);
    if (food) setUnit(food.defaultUnit);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/household/${householdId}/pantry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId,
          quantity: parseFloat(quantity),
          unit,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to add item");
      }

      setFoodId("");
      setQuantity("");
      setUnit("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (foods.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Food" htmlFor="food">
        <select
          id="food"
          className={selectClassName}
          value={foodId}
          onChange={(e) => handleFoodChange(e.target.value)}
          required
        >
          <option value="">Select food</option>
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nameEn}{f.nameAm ? ` (${f.nameAm})` : ""}
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Quantity" htmlFor="quantity">
          <input
            id="quantity"
            type="number"
            step="any"
            min="0.01"
            className={inputClassName}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Unit" htmlFor="unit">
          <input
            id="unit"
            className={inputClassName}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </FormField>
      </div>
      <FormField label="Notes" htmlFor="notes">
        <input id="notes" className={inputClassName} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      {error && <p className="text-sm" style={{ color: "var(--color-critical)" }}>{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Adding…" : "Add to pantry"}</Button>
    </form>
  );
}

interface PantryListProps {
  householdId: string;
  items: Array<{
    id: string;
    quantity: number;
    unit: string;
    notes: string | null;
    food: { id: string; nameEn: string; nameAm: string | null };
  }>;
}

export function PantryList({ householdId, items }: PantryListProps) {
  const router = useRouter();

  async function handleRemove(itemId: string) {
    if (!confirm("Remove this pantry item?")) return;
    await fetch(`/api/household/${householdId}/pantry/${itemId}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">{item.food.nameEn}</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {item.quantity} {item.unit}
              {item.notes && ` · ${item.notes}`}
            </p>
          </div>
          <Button size="sm" variant="danger" onClick={() => handleRemove(item.id)}>
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
