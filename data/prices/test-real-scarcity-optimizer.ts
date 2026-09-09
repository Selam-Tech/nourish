import { prisma } from "../../src/lib/db";

import { loadCandidateFoods } from "../../src/services/optimization/candidate-food-loader";

import {
  aggregateHouseholdNutrientTargets,
  toScarcityFoods,
} from "../../src/services/optimization/optimization-adapter";

import { optimizeScarcity } from "../../src/services/optimization/scarcity-optimizer";

import type { NutrientRequirement } from "../../src/types/optimization";

async function main() {
  console.log(
    "Testing Nourish Scarcity Optimizer with database food data...\n",
  );

  const region = await prisma.region.findUnique({
    where: {
      code: "ET-AA",
    },
  });

  if (!region) {
    throw new Error(
      "Addis Ababa region ET-AA was not found.",
    );
  }

  const candidateFoods = await loadCandidateFoods({
    regionId: region.id,
    currency: "ETB",
    asOfDate: new Date(
      "2026-09-08T23:59:59.999Z",
    ),
  });

  const scarcityFoods =
    toScarcityFoods(candidateFoods);

  /*
   * Temporary deterministic test requirements.
   *
   * These values are ONLY for exercising the optimizer
   * against the real EFCT foods and database prices.
   *
   * They are not being presented as a recommendation
   * for a real person.
   *
   * The next integration step will replace these with
   * requirements calculated from actual household members.
   */
  const testRequirements: NutrientRequirement[] = [
    {
      nutrientCode: "energy",
      targetAmount: 2000,
      unit: "kcal",
      memberId: "test-member",
    },
    {
      nutrientCode: "protein",
      targetAmount: 50,
      unit: "g",
      memberId: "test-member",
    },
    {
      nutrientCode: "iron",
      targetAmount: 10,
      unit: "mg",
      memberId: "test-member",
    },
    {
      nutrientCode: "calcium",
      targetAmount: 800,
      unit: "mg",
      memberId: "test-member",
    },
    {
      nutrientCode: "vitamin_a",
      targetAmount: 600,
      unit: "mcg RE",
      memberId: "test-member",
    },
    {
      nutrientCode: "folate",
      targetAmount: 400,
      unit: "mcg",
      memberId: "test-member",
    },
    {
      nutrientCode: "zinc",
      targetAmount: 10,
      unit: "mg",
      memberId: "test-member",
    },
  ];

  const nutrientTargets =
    aggregateHouseholdNutrientTargets(
      testRequirements,
    );

  const budgets = [50, 100, 200, 300];

  for (const budgetEtb of budgets) {
    console.log(
      "\n========================================",
    );

    console.log(`BUDGET: ${budgetEtb} ETB`);

    console.log(
      "========================================",
    );

    const result = optimizeScarcity({
      budgetEtb,
      foods: scarcityFoods,
      nutrientTargets,
    });

    console.log(`Status: ${result.status}`);

    console.log(
      `Total modeled cost: ${result.totalCostEtb.toFixed(
        2,
      )} ETB`,
    );

    console.log(
      `Objective score: ${result.objectiveScore.toFixed(
        6,
      )}`,
    );

    console.log("\nSelected foods:");

    if (result.selections.length === 0) {
      console.log("  None");
    }

    for (const selection of result.selections) {
      console.log(
        `  ${selection.name}: ` +
          `${selection.quantityGrams.toFixed(1)} g ` +
          `(${selection.totalCostEtb.toFixed(2)} ETB)`,
      );
    }

    console.log("\nNutrient coverage:");

    for (const nutrient of result.nutrients) {
      const percent =
        nutrient.coverageRatio * 100;

      console.log(
        `  ${nutrient.nutrientCode}: ` +
          `${percent.toFixed(1)}% ` +
          `(${nutrient.suppliedAmount.toFixed(2)} / ` +
          `${nutrient.targetAmount})`,
      );
    }
  }

  console.log(
    "\n========================================",
  );

  console.log(
    "\nReal-data scarcity optimizer test completed.",
  );

  console.log(
    "\nIMPORTANT: Prices used here are synthetic " +
      "Addis Ababa demo modeling prices, not live or " +
      "surveyed market prices.",
  );
}

main()
  .catch((error) => {
    console.error(
      "\nReal-data scarcity optimizer test FAILED:",
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });