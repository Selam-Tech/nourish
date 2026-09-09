import { solve, type Model } from "yalps";

export interface ScarcityNutrientTarget {
  nutrientCode: string;
  targetAmount: number;
  weight?: number;
}

export interface ScarcityFood {
  foodId: string;
  name: string;

  /**
   * Purchase cost in ETB per gram.
   */
  pricePerGram: number;

  /**
   * Nutrient values per 100 g edible portion.
   */
  nutrientsPer100g: Record<string, number>;

  /**
   * Maximum amount the mathematical model may select.
   *
   * This is a modeling feasibility bound,
   * not a medical recommendation or serving guideline.
   */
  maxGrams: number;
}

export interface ScarcityOptimizerInput {
  budgetEtb: number;
  foods: ScarcityFood[];
  nutrientTargets: ScarcityNutrientTarget[];
}

export interface ScarcityFoodSelection {
  foodId: string;
  name: string;
  quantityGrams: number;
  totalCostEtb: number;
}

export interface ScarcityNutrientResult {
  nutrientCode: string;
  targetAmount: number;
  suppliedAmount: number;
  shortfallAmount: number;
  coverageRatio: number;
}

export interface ScarcityOptimizerResult {
  status: "optimal" | "infeasible";
  totalCostEtb: number;

  /**
   * Weighted normalized nutrient shortfall.
   *
   * 0 means all modeled minimum nutrient targets were met.
   * Larger values represent greater unresolved modeled shortfall.
   */
  objectiveScore: number;

  selections: ScarcityFoodSelection[];
  nutrients: ScarcityNutrientResult[];
}

/**
 * Tiny cost coefficient used only to break ties between
 * nutritionally equivalent solutions.
 *
 * Nutrient shortfall remains the dominant optimization goal.
 */
const COST_TIE_BREAK_WEIGHT = 0.000001;

const EPSILON = 0.000001;

function assertFiniteNonNegative(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `${fieldName} must be a finite number greater than or equal to zero`,
    );
  }
}

function validateInput(
  input: ScarcityOptimizerInput,
): void {
  assertFiniteNonNegative(
    input.budgetEtb,
    "budgetEtb",
  );

  if (input.foods.length === 0) {
    throw new Error(
      "Scarcity optimizer requires at least one candidate food",
    );
  }

  if (input.nutrientTargets.length === 0) {
    throw new Error(
      "Scarcity optimizer requires at least one nutrient target",
    );
  }

  const nutrientCodes = new Set<string>();

  for (const target of input.nutrientTargets) {
    if (!target.nutrientCode.trim()) {
      throw new Error(
        "Nutrient target has an empty code",
      );
    }

    if (
      nutrientCodes.has(target.nutrientCode)
    ) {
      throw new Error(
        `Duplicate nutrient target: ${target.nutrientCode}`,
      );
    }

    nutrientCodes.add(target.nutrientCode);

    if (
      !Number.isFinite(target.targetAmount) ||
      target.targetAmount <= 0
    ) {
      throw new Error(
        `Target for ${target.nutrientCode} must be greater than zero`,
      );
    }

    if (
      target.weight !== undefined &&
      (!Number.isFinite(target.weight) ||
        target.weight <= 0)
    ) {
      throw new Error(
        `Weight for ${target.nutrientCode} must be greater than zero`,
      );
    }
  }

  const foodIds = new Set<string>();

  for (const food of input.foods) {
    if (!food.foodId.trim()) {
      throw new Error(
        "Candidate food has an empty foodId",
      );
    }

    if (foodIds.has(food.foodId)) {
      throw new Error(
        `Duplicate candidate food: ${food.foodId}`,
      );
    }

    foodIds.add(food.foodId);

    if (!food.name.trim()) {
      throw new Error(
        `Candidate food ${food.foodId} has an empty name`,
      );
    }

    if (
      !Number.isFinite(food.pricePerGram) ||
      food.pricePerGram <= 0
    ) {
      throw new Error(
        `Candidate food ${food.foodId} has an invalid price`,
      );
    }

    if (
      !Number.isFinite(food.maxGrams) ||
      food.maxGrams <= 0
    ) {
      throw new Error(
        `Candidate food ${food.foodId} has an invalid maxGrams`,
      );
    }

    for (const [
      nutrientCode,
      amount,
    ] of Object.entries(
      food.nutrientsPer100g,
    )) {
      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {
        throw new Error(
          `Candidate food ${food.foodId} has an invalid ${nutrientCode} value`,
        );
      }
    }
  }
}

/**
 * Calculate weighted normalized nutrient shortfall
 * independently from the solver's tiny cost tie-breaker.
 *
 * This gives the public objectiveScore a clear meaning:
 *
 *   sum(
 *     nutrient weight
 *     × nutrient shortfall
 *     / nutrient target
 *   )
 *
 * Example:
 * a 20% energy shortfall with weight 1 contributes 0.20.
 */
function calculateNutrientShortfallScore(
  nutrients: ScarcityNutrientResult[],
  targets: ScarcityNutrientTarget[],
): number {
  const targetMap = new Map(
    targets.map((target) => [
      target.nutrientCode,
      target,
    ]),
  );

  let score = 0;

  for (const nutrient of nutrients) {
    const target = targetMap.get(
      nutrient.nutrientCode,
    );

    if (!target) {
      continue;
    }

    const weight = target.weight ?? 1;

    score +=
      weight *
      (nutrient.shortfallAmount /
        nutrient.targetAmount);
  }

  return score;
}

/**
 * Deterministic scarcity optimization core.
 *
 * PRIMARY OBJECTIVE:
 *
 * Minimize weighted normalized nutrient shortfall.
 *
 * SECONDARY OBJECTIVE:
 *
 * Among nutritionally equivalent solutions,
 * prefer lower modeled purchase cost.
 *
 * Each nutrient gets an explicit shortfall variable.
 * Therefore an inadequate budget does NOT make the
 * nutrition problem infeasible.
 *
 * Instead, Nourish returns the best achievable modeled
 * nutrient coverage under the supplied constraints.
 *
 * Important:
 *
 * Nutrient reference targets are treated as minimum
 * optimization targets. Exceeding a reference target is
 * NOT automatically treated as harmful and is NOT the
 * same as exceeding a medically established tolerable
 * upper intake level.
 *
 * Food variables represent grams of edible portion.
 */
export function optimizeScarcity(
  input: ScarcityOptimizerInput,
): ScarcityOptimizerResult {
  validateInput(input);

  const constraints: Record<
    string,
    {
      min?: number;
      max?: number;
    }
  > = {
    budget: {
      max: input.budgetEtb,
    },
  };

  const variables: Record<
    string,
    Record<string, number>
  > = {};

  for (const target of input.nutrientTargets) {
    constraints[
      `nutrient:${target.nutrientCode}`
    ] = {
      min: target.targetAmount,
    };
  }

  for (const food of input.foods) {
    const variableName =
      `food:${food.foodId}`;

    constraints[`max:${food.foodId}`] = {
      max: food.maxGrams,
    };

    const coefficients: Record<
      string,
      number
    > = {
      objective:
        food.pricePerGram *
        COST_TIE_BREAK_WEIGHT,

      budget: food.pricePerGram,

      [`max:${food.foodId}`]: 1,
    };

    for (const target of input.nutrientTargets) {
      coefficients[
        `nutrient:${target.nutrientCode}`
      ] =
        (food.nutrientsPer100g[
          target.nutrientCode
        ] ?? 0) / 100;
    }

    variables[variableName] =
      coefficients;
  }

  /**
   * Shortfall variables make every nutrient
   * minimum constraint soft.
   *
   * Example:
   *
   * iron from foods + iron shortfall
   * >= modeled iron target
   *
   * Dividing the objective coefficient by the
   * nutrient target normalizes nutrients that
   * otherwise use incomparable units such as
   * kcal, grams, milligrams, and micrograms.
   */
  for (const target of input.nutrientTargets) {
    const weight = target.weight ?? 1;

    variables[
      `shortfall:${target.nutrientCode}`
    ] = {
      objective:
        weight / target.targetAmount,

      [`nutrient:${target.nutrientCode}`]:
        1,
    };
  }

  const model: Model = {
    direction: "minimize",
    objective: "objective",
    constraints,
    variables,
  };

  const startedAt = performance.now();

  const solution = solve(model);

  const durationMs =
    performance.now() - startedAt;

  if (solution.status !== "optimal") {
    return {
      status: "infeasible",
      totalCostEtb: 0,
      objectiveScore:
        Number.POSITIVE_INFINITY,
      selections: [],
      nutrients: [],
    };
  }

  const solvedVariables = new Map(
    solution.variables,
  );

  const selections: ScarcityFoodSelection[] =
    [];

  let totalCostEtb = 0;

  for (const food of input.foods) {
    const quantityGrams =
      solvedVariables.get(
        `food:${food.foodId}`,
      ) ?? 0;

    if (quantityGrams <= EPSILON) {
      continue;
    }

    const totalCost =
      quantityGrams *
      food.pricePerGram;

    totalCostEtb += totalCost;

    selections.push({
      foodId: food.foodId,
      name: food.name,
      quantityGrams,
      totalCostEtb: totalCost,
    });
  }

  const nutrients: ScarcityNutrientResult[] =
    input.nutrientTargets.map(
      (target) => {
        let suppliedAmount = 0;

        for (const food of input.foods) {
          const quantityGrams =
            solvedVariables.get(
              `food:${food.foodId}`,
            ) ?? 0;

          suppliedAmount +=
            quantityGrams *
            ((food.nutrientsPer100g[
              target.nutrientCode
            ] ?? 0) /
              100);
        }

        const shortfallAmount = Math.max(
          0,
          target.targetAmount -
            suppliedAmount,
        );

        return {
          nutrientCode:
            target.nutrientCode,

          targetAmount:
            target.targetAmount,

          suppliedAmount,

          shortfallAmount,

          coverageRatio:
            suppliedAmount /
            target.targetAmount,
        };
      },
    );

  const nutrientShortfallScore =
    calculateNutrientShortfallScore(
      nutrients,
      input.nutrientTargets,
    );

  /**
   * Timing will be exposed later through
   * OptimizationService metadata.
   */
  void durationMs;

  return {
    status: "optimal",
    totalCostEtb,
    objectiveScore:
      nutrientShortfallScore,
    selections,
    nutrients,
  };
}