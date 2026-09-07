-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('NOT_APPLICABLE', 'NOT_PREGNANT', 'PREGNANT', 'LACTATING');

-- CreateEnum
CREATE TYPE "MealPlanStatus" AS ENUM ('DRAFT', 'PENDING_OPTIMIZATION', 'OPTIMIZED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ETB', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('FOOD_COMPOSITION', 'NUTRIENT_REFERENCE', 'PRICE_SURVEY', 'USER_REPORTED', 'IMPORTED', 'CALCULATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regionId" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL DEFAULT 'UNSPECIFIED',
    "pregnancyStatus" "PregnancyStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT,
    "countryCode" VARCHAR(3) NOT NULL,
    "parentRegionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "canonicalId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT,
    "foodGroup" TEXT,
    "defaultUnit" TEXT NOT NULL,
    "ediblePortion" DOUBLE PRECISION,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceVersion" TEXT,
    "importedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutrientDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT,
    "unit" TEXT NOT NULL,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutrientDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodNutrient" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "amountPer100g" DOUBLE PRECISION NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceVersion" TEXT,
    "importedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodPrice" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "price" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceType" "DataSourceType" NOT NULL DEFAULT 'IMPORTED',
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBudget" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "dailyBudgetId" TEXT,
    "planDate" DATE NOT NULL,
    "status" "MealPlanStatus" NOT NULL DEFAULT 'PENDING_OPTIMIZATION',
    "totalCost" DECIMAL(12,2),
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "optimizerVersion" TEXT,
    "calculationMeta" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanItem" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanNutrientCoverage" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION NOT NULL,
    "coverageRatio" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "isGap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlanNutrientCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutrientHistory" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "recordDate" DATE NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION NOT NULL,
    "coverageRatio" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "sourcePlanId" TEXT,
    "sourceType" "DataSourceType" NOT NULL DEFAULT 'CALCULATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutrientHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Household_userId_idx" ON "Household"("userId");

-- CreateIndex
CREATE INDEX "Household_regionId_idx" ON "Household"("regionId");

-- CreateIndex
CREATE INDEX "HouseholdMember_householdId_idx" ON "HouseholdMember"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE INDEX "Region_countryCode_idx" ON "Region"("countryCode");

-- CreateIndex
CREATE INDEX "Region_parentRegionId_idx" ON "Region"("parentRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "Food_canonicalId_key" ON "Food"("canonicalId");

-- CreateIndex
CREATE INDEX "Food_canonicalId_idx" ON "Food"("canonicalId");

-- CreateIndex
CREATE INDEX "Food_foodGroup_idx" ON "Food"("foodGroup");

-- CreateIndex
CREATE UNIQUE INDEX "NutrientDefinition_code_key" ON "NutrientDefinition"("code");

-- CreateIndex
CREATE INDEX "NutrientDefinition_code_idx" ON "NutrientDefinition"("code");

-- CreateIndex
CREATE INDEX "FoodNutrient_foodId_idx" ON "FoodNutrient"("foodId");

-- CreateIndex
CREATE INDEX "FoodNutrient_nutrientId_idx" ON "FoodNutrient"("nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodNutrient_foodId_nutrientId_key" ON "FoodNutrient"("foodId", "nutrientId");

-- CreateIndex
CREATE INDEX "FoodPrice_foodId_regionId_observedAt_idx" ON "FoodPrice"("foodId", "regionId", "observedAt");

-- CreateIndex
CREATE INDEX "FoodPrice_regionId_observedAt_idx" ON "FoodPrice"("regionId", "observedAt");

-- CreateIndex
CREATE INDEX "PantryItem_householdId_idx" ON "PantryItem"("householdId");

-- CreateIndex
CREATE INDEX "PantryItem_foodId_idx" ON "PantryItem"("foodId");

-- CreateIndex
CREATE INDEX "DailyBudget_householdId_date_idx" ON "DailyBudget"("householdId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBudget_householdId_date_key" ON "DailyBudget"("householdId", "date");

-- CreateIndex
CREATE INDEX "MealPlan_householdId_planDate_idx" ON "MealPlan"("householdId", "planDate");

-- CreateIndex
CREATE INDEX "MealPlan_status_idx" ON "MealPlan"("status");

-- CreateIndex
CREATE INDEX "MealPlanItem_mealPlanId_idx" ON "MealPlanItem"("mealPlanId");

-- CreateIndex
CREATE INDEX "MealPlanItem_foodId_idx" ON "MealPlanItem"("foodId");

-- CreateIndex
CREATE INDEX "MealPlanNutrientCoverage_mealPlanId_idx" ON "MealPlanNutrientCoverage"("mealPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanNutrientCoverage_mealPlanId_nutrientId_key" ON "MealPlanNutrientCoverage"("mealPlanId", "nutrientId");

-- CreateIndex
CREATE INDEX "NutrientHistory_householdId_recordDate_idx" ON "NutrientHistory"("householdId", "recordDate");

-- CreateIndex
CREATE INDEX "NutrientHistory_nutrientId_recordDate_idx" ON "NutrientHistory"("nutrientId", "recordDate");

-- CreateIndex
CREATE INDEX "NutrientHistory_sourcePlanId_idx" ON "NutrientHistory"("sourcePlanId");

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_parentRegionId_fkey" FOREIGN KEY ("parentRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "NutrientDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPrice" ADD CONSTRAINT "FoodPrice_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPrice" ADD CONSTRAINT "FoodPrice_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBudget" ADD CONSTRAINT "DailyBudget_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_dailyBudgetId_fkey" FOREIGN KEY ("dailyBudgetId") REFERENCES "DailyBudget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanNutrientCoverage" ADD CONSTRAINT "MealPlanNutrientCoverage_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanNutrientCoverage" ADD CONSTRAINT "MealPlanNutrientCoverage_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "NutrientDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutrientHistory" ADD CONSTRAINT "NutrientHistory_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutrientHistory" ADD CONSTRAINT "NutrientHistory_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "NutrientDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutrientHistory" ADD CONSTRAINT "NutrientHistory_sourcePlanId_fkey" FOREIGN KEY ("sourcePlanId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
