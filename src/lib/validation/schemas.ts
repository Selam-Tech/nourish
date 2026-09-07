import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Household name is required").max(100),
  regionId: z.string().cuid().optional().nullable(),
  currency: z.enum(["ETB", "USD", "EUR"]).default("ETB"),
});

export const updateHouseholdSchema = createHouseholdSchema.partial();

export const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dateOfBirth: z.coerce.date().max(new Date(), "Date of birth cannot be in the future"),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]).default("UNSPECIFIED"),
  pregnancyStatus: z
    .enum(["NOT_APPLICABLE", "NOT_PREGNANT", "PREGNANT", "LACTATING"])
    .default("NOT_APPLICABLE"),
  allergies: z.array(z.string().max(100)).default([]),
  dietaryRestrictions: z.array(z.string().max(100)).default([]),
});

export const updateMemberSchema = createMemberSchema.partial();

export const createPantryItemSchema = z.object({
  foodId: z.string().cuid(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1).max(50),
  notes: z.string().max(500).optional().nullable(),
});

export const updatePantryItemSchema = createPantryItemSchema.partial();

export const createDailyBudgetSchema = z.object({
  date: z.coerce.date(),
  amount: z.number().positive("Budget must be positive"),
  currency: z.enum(["ETB", "USD", "EUR"]).default("ETB"),
  notes: z.string().max(500).optional().nullable(),
});

export const createMealPlanRequestSchema = z.object({
  planDate: z.coerce.date(),
  dailyBudgetId: z.string().cuid().optional(),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>;
export type CreateDailyBudgetInput = z.infer<typeof createDailyBudgetSchema>;
export type CreateMealPlanRequestInput = z.infer<typeof createMealPlanRequestSchema>;
