"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/ui";

interface PantryFormProps {
  householdId: string;
  foods: Array<{
    id: string;
    nameEn: string;
    nameAm: string | null;
    defaultUnit: string;
  }>;
}

export function PantryForm({
  householdId,
  foods,
}: PantryFormProps) {
  const router = useRouter();

  const [foodId, setFoodId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    const parsedQuantity =
      Number.parseFloat(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Enter a pantry quantity greater than 0 grams.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/household/${householdId}/pantry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foodId,
            quantity: parsedQuantity,
            unit: "g",
            notes: notes.trim() || null,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();

        throw new Error(
          data.error ?? "Failed to add item",
        );
      }

      setFoodId("");
      setQuantity("");
      setNotes("");

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

  if (foods.length === 0) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <FormField
        label="Food"
        htmlFor="food"
      >
        <select
          id="food"
          className={selectClassName}
          value={foodId}
          onChange={(e) =>
            setFoodId(e.target.value)
          }
          required
        >
          <option value="">
            Select food
          </option>

          {foods.map((food) => (
            <option
              key={food.id}
              value={food.id}
            >
              {food.nameEn}
              {food.nameAm
                ? ` (${food.nameAm})`
                : ""}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Quantity available (grams)"
        htmlFor="quantity"
      >
        <div className="flex items-center gap-3">
          <input
            id="quantity"
            type="number"
            step="1"
            min="1"
            className={inputClassName}
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            placeholder="Example: 500"
            required
          />

          <span
            className="shrink-0 text-sm font-medium"
            style={{
              color:
                "var(--color-text-muted)",
            }}
          >
            g
          </span>
        </div>
      </FormField>

      <p
        className="text-sm"
        style={{
          color: "var(--color-text-muted)",
        }}
      >
        For this Nourish prototype, pantry
        quantities are recorded in grams so
        they can be used consistently by the
        nutrition optimizer.
      </p>

      <FormField
        label="Notes"
        htmlFor="notes"
      >
        <input
          id="notes"
          className={inputClassName}
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Optional"
        />
      </FormField>

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
          ? "Adding…"
          : "Add to pantry"}
      </Button>
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

    food: {
      id: string;
      nameEn: string;
      nameAm: string | null;
    };
  }>;
}

export function PantryList({
  householdId,
  items,
}: PantryListProps) {
  const router = useRouter();

  async function handleRemove(
    itemId: string,
  ) {
    if (
      !confirm(
        "Remove this pantry item?",
      )
    ) {
      return;
    }

    await fetch(
      `/api/household/${householdId}/pantry/${itemId}`,
      {
        method: "DELETE",
      },
    );

    router.refresh();
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div>
            <p className="font-medium">
              {item.food.nameEn}
            </p>

            {item.food.nameAm && (
              <p
                className="text-sm"
                style={{
                  color:
                    "var(--color-text-muted)",
                }}
              >
                {item.food.nameAm}
              </p>
            )}

            <p
              className="text-sm"
              style={{
                color:
                  "var(--color-text-muted)",
              }}
            >
              {item.quantity} {item.unit}
              {item.notes
                ? ` · ${item.notes}`
                : ""}
            </p>
          </div>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              handleRemove(item.id)
            }
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}