import type { Currency, PregnancyStatus, Sex } from "@prisma/client";

/** Member profile used for nutrient requirement calculations */
export interface MemberRequirementProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  sex: Sex;
  pregnancyStatus: PregnancyStatus;
  allergies: string[];
  dietaryRestrictions: string[];
}

/** Household context for optimization */
export interface HouseholdOptimizationContext {
  householdId: string;
  regionId: string | null;
  currency: Currency;
  members: MemberRequirementProfile[];
}

/** A food available as a candidate for optimization */
export interface CandidateFood {
  foodId: string;
  canonicalId: string;
  nameEn: string;
  nameAm: string | null;
  foodGroup: string | null;
  defaultUnit: string;
  /** Nutrient amounts per 100g, keyed by nutrient code */
  nutrientsPer100g: Record<string, number>;
  /** Current price in household currency for the default purchasable unit */
  price: {
    amount: number;
    unit: string;
    currency: Currency;
    observedAt: Date;
    sourceName: string | null;
  } | null;
}

/** Pantry item available to the optimizer */
export interface PantrySnapshot {
  foodId: string;
  quantity: number;
  unit: string;
}

/** Budget constraint for a specific date */
export interface BudgetConstraint {
  date: Date;
  amount: number;
  currency: Currency;
}

/** Recent nutrient intake for Nutrient Memory */
export interface NutrientHistorySnapshot {
  nutrientCode: string;
  recordDate: Date;
  targetAmount: number;
  actualAmount: number;
  coverageRatio: number;
  unit: string;
}

/** Nutrient requirement target for a member */
export interface NutrientRequirement {
  nutrientCode: string;
  targetAmount: number;
  unit: string;
  memberId: string;
}

/** Complete input contract for the scarcity optimizer */
export interface OptimizationInput {
  context: HouseholdOptimizationContext;
  planDate: Date;
  budget: BudgetConstraint;
  pantry: PantrySnapshot[];
  candidateFoods: CandidateFood[];
  nutrientRequirements: NutrientRequirement[];
  recentNutrientHistory: NutrientHistorySnapshot[];
  excludedFoodIds: string[];
  optimizerVersion?: string;
}

/** A selected food item in an optimized plan */
export interface OptimizedFoodSelection {
  foodId: string;
  canonicalId: string;
  nameEn: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

/** Nutrient coverage result for one nutrient */
export interface NutrientCoverageResult {
  nutrientCode: string;
  targetAmount: number;
  actualAmount: number;
  coverageRatio: number;
  unit: string;
  isGap: boolean;
}

/** Unresolved gap that the optimizer could not close */
export interface NutrientGap {
  nutrientCode: string;
  targetAmount: number;
  actualAmount: number;
  shortfallAmount: number;
  unit: string;
  estimatedMarginalCost: number | null;
}

/** Metadata about the optimization calculation */
export interface OptimizationMetadata {
  optimizerVersion: string;
  calculatedAt: Date;
  durationMs: number;
  objectiveScore: number;
  constraintsApplied: string[];
  warnings: string[];
}

/** Complete output contract from the scarcity optimizer */
export interface OptimizationResult {
  status: "success" | "partial" | "infeasible";
  selections: OptimizedFoodSelection[];
  totalCost: number;
  currency: Currency;
  nutrientCoverage: NutrientCoverageResult[];
  unresolvedGaps: NutrientGap[];
  metadata: OptimizationMetadata;
}

/** Marginal nutrition value query (future: +10 ETB) */
export interface MarginalValueQuery {
  input: OptimizationInput;
  additionalBudget: number;
}

export interface MarginalValueResult {
  additionalBudget: number;
  improvedNutrients: Array<{
    nutrientCode: string;
    additionalAmount: number;
    unit: string;
  }>;
  recommendedFoodAdditions: OptimizedFoodSelection[];
}

/** Affordability gap analysis input (future) */
export interface AffordabilityGapInput {
  householdId: string;
  planHistory: OptimizationResult[];
  recurringGaps: NutrientGap[];
}

export interface AffordabilityGapResult {
  nutrientCode: string;
  gapFrequency: number;
  averageShortfall: number;
  unit: string;
  estimatedDailyCostToClose: number | null;
}

/** Price shock simulation input (future) */
export interface PriceShockInput {
  baseInput: OptimizationInput;
  priceChanges: Array<{
    foodId: string;
    percentChange: number;
  }>;
}

export interface PriceShockResult {
  baseline: OptimizationResult;
  shocked: OptimizationResult;
  nutrientImpact: Array<{
    nutrientCode: string;
    baselineCoverage: number;
    shockedCoverage: number;
  }>;
}
