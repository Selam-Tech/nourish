"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, inputClassName, selectClassName } from "@/components/ui";

interface MemberFormProps {
  householdId: string;
  member?: {
    id: string;
    name: string;
    dateOfBirth: string;
    sex: string;
    pregnancyStatus: string;
    allergies: string[];
    dietaryRestrictions: string[];
  };
  onDone?: () => void;
}

export function MemberForm({ householdId, member, onDone }: MemberFormProps) {
  const router = useRouter();
  const [name, setName] = useState(member?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(member?.dateOfBirth?.slice(0, 10) ?? "");
  const [sex, setSex] = useState(member?.sex ?? "UNSPECIFIED");
  const [pregnancyStatus, setPregnancyStatus] = useState(member?.pregnancyStatus ?? "NOT_APPLICABLE");
  const [allergies, setAllergies] = useState(member?.allergies.join(", ") ?? "");
  const [restrictions, setRestrictions] = useState(member?.dietaryRestrictions.join(", ") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      dateOfBirth,
      sex,
      pregnancyStatus,
      allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
      dietaryRestrictions: restrictions.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const url = member
        ? `/api/household/${householdId}/members/${member.id}`
        : `/api/household/${householdId}/members`;
      const res = await fetch(url, {
        method: member ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save member");
      }

      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name" htmlFor="member-name">
        <input
          id="member-name"
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </FormField>
      <FormField label="Date of birth" htmlFor="dob">
        <input
          id="dob"
          type="date"
          className={inputClassName}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </FormField>
      <FormField label="Sex" htmlFor="sex">
        <select id="sex" className={selectClassName} value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="UNSPECIFIED">Prefer not to say</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </FormField>
      <FormField label="Pregnancy / lactation" htmlFor="pregnancy">
        <select
          id="pregnancy"
          className={selectClassName}
          value={pregnancyStatus}
          onChange={(e) => setPregnancyStatus(e.target.value)}
        >
          <option value="NOT_APPLICABLE">Not applicable</option>
          <option value="NOT_PREGNANT">Not pregnant</option>
          <option value="PREGNANT">Pregnant</option>
          <option value="LACTATING">Lactating</option>
        </select>
      </FormField>
      <FormField label="Allergies" htmlFor="allergies" hint="Comma-separated">
        <input
          id="allergies"
          className={inputClassName}
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. peanuts, dairy"
        />
      </FormField>
      <FormField label="Dietary restrictions" htmlFor="restrictions" hint="Comma-separated">
        <input
          id="restrictions"
          className={inputClassName}
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="e.g. vegetarian, halal"
        />
      </FormField>
      {error && <p className="text-sm" style={{ color: "var(--color-critical)" }}>{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : member ? "Update member" : "Add member"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

interface MemberListProps {
  householdId: string;
  members: Array<{
    id: string;
    name: string;
    dateOfBirth: Date;
    sex: string;
    pregnancyStatus: string;
    allergies: string[];
    dietaryRestrictions: string[];
  }>;
}

export function MemberList({ householdId, members }: MemberListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/household/${householdId}/members/${memberId}`, { method: "DELETE" });
    router.refresh();
  }

  if (members.length === 0) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No members yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {members.map((member) => (
        <li key={member.id} className="rounded-lg border border-[var(--color-border)] p-4">
          {editingId === member.id ? (
            <MemberForm
              householdId={householdId}
              member={{
                ...member,
                dateOfBirth: new Date(member.dateOfBirth).toISOString(),
              }}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Born {new Date(member.dateOfBirth).toLocaleDateString()} · {member.sex.toLowerCase()}
                    {member.pregnancyStatus !== "NOT_APPLICABLE" &&
                      ` · ${member.pregnancyStatus.toLowerCase().replace("_", " ")}`}
                  </p>
                  {member.allergies.length > 0 && (
                    <p className="mt-1 text-xs">Allergies: {member.allergies.join(", ")}</p>
                  )}
                  {member.dietaryRestrictions.length > 0 && (
                    <p className="text-xs">Restrictions: {member.dietaryRestrictions.join(", ")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(member.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRemove(member.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
