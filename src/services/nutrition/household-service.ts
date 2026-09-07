import { prisma } from "@/lib/db";
import type {
  CreateDailyBudgetInput,
  CreateHouseholdInput,
  CreateMemberInput,
  CreatePantryItemInput,
} from "@/lib/validation/schemas";

const DEMO_USER_EMAIL = "demo@nourish.local";

/** Ensures a demo user exists for development without auth */
export async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });
}

export async function getDemoHousehold() {
  const user = await getOrCreateDemoUser();
  return prisma.household.findFirst({
    where: { userId: user.id },
    include: {
      members: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      region: true,
      pantryItems: { include: { food: true }, orderBy: { updatedAt: "desc" } },
      dailyBudgets: { orderBy: { date: "desc" }, take: 7 },
      mealPlans: { orderBy: { planDate: "desc" }, take: 5 },
    },
  });
}

export async function createHousehold(data: CreateHouseholdInput) {
  const user = await getOrCreateDemoUser();
  return prisma.household.create({
    data: {
      name: data.name,
      userId: user.id,
      regionId: data.regionId ?? null,
      currency: data.currency,
    },
    include: { members: true, region: true },
  });
}

export async function updateHousehold(
  householdId: string,
  data: Partial<CreateHouseholdInput>,
) {
  return prisma.household.update({
    where: { id: householdId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.regionId !== undefined && { regionId: data.regionId }),
      ...(data.currency !== undefined && { currency: data.currency }),
    },
    include: { members: true, region: true },
  });
}

export async function addHouseholdMember(householdId: string, data: CreateMemberInput) {
  return prisma.householdMember.create({
    data: {
      householdId,
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      sex: data.sex,
      pregnancyStatus: data.pregnancyStatus,
      allergies: data.allergies,
      dietaryRestrictions: data.dietaryRestrictions,
    },
  });
}

export async function updateHouseholdMember(
  memberId: string,
  data: Partial<CreateMemberInput>,
) {
  return prisma.householdMember.update({
    where: { id: memberId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
      ...(data.sex !== undefined && { sex: data.sex }),
      ...(data.pregnancyStatus !== undefined && { pregnancyStatus: data.pregnancyStatus }),
      ...(data.allergies !== undefined && { allergies: data.allergies }),
      ...(data.dietaryRestrictions !== undefined && {
        dietaryRestrictions: data.dietaryRestrictions,
      }),
    },
  });
}

export async function deactivateHouseholdMember(memberId: string) {
  return prisma.householdMember.update({
    where: { id: memberId },
    data: { isActive: false },
  });
}

export async function getPantryItems(householdId: string) {
  return prisma.pantryItem.findMany({
    where: { householdId },
    include: { food: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function addPantryItem(householdId: string, data: CreatePantryItemInput) {
  return prisma.pantryItem.create({
    data: {
      householdId,
      foodId: data.foodId,
      quantity: data.quantity,
      unit: data.unit,
      notes: data.notes ?? null,
    },
    include: { food: true },
  });
}

export async function updatePantryItem(
  itemId: string,
  data: Partial<CreatePantryItemInput>,
) {
  return prisma.pantryItem.update({
    where: { id: itemId },
    data: {
      ...(data.foodId !== undefined && { foodId: data.foodId }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { food: true },
  });
}

export async function removePantryItem(itemId: string) {
  return prisma.pantryItem.delete({ where: { id: itemId } });
}

export async function upsertDailyBudget(householdId: string, data: CreateDailyBudgetInput) {
  return prisma.dailyBudget.upsert({
    where: {
      householdId_date: {
        householdId,
        date: data.date,
      },
    },
    update: {
      amount: data.amount,
      currency: data.currency,
      notes: data.notes ?? null,
    },
    create: {
      householdId,
      date: data.date,
      amount: data.amount,
      currency: data.currency,
      notes: data.notes ?? null,
    },
  });
}

export async function getTodaysBudget(householdId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.dailyBudget.findUnique({
    where: {
      householdId_date: { householdId, date: today },
    },
  });
}

export async function getAvailableFoods() {
  return prisma.food.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });
}

export async function getRegions() {
  return prisma.region.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });
}

export async function getMealPlanHistory(householdId: string) {
  return prisma.mealPlan.findMany({
    where: { householdId },
    include: {
      items: { include: { food: true } },
      nutrientCoverage: { include: { nutrient: true } },
      dailyBudget: true,
    },
    orderBy: { planDate: "desc" },
    take: 30,
  });
}

export async function getNutrientHistory(householdId: string) {
  return prisma.nutrientHistory.findMany({
    where: { householdId },
    include: { nutrient: true, sourcePlan: true },
    orderBy: { recordDate: "desc" },
    take: 60,
  });
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export function formatMemberAge(dateOfBirth: Date): string {
  const age = calculateAge(dateOfBirth);
  if (age < 2) {
    const months =
      (new Date().getFullYear() - dateOfBirth.getFullYear()) * 12 +
      (new Date().getMonth() - dateOfBirth.getMonth());
    return `${months} mo`;
  }
  return `${age} yr`;
}
