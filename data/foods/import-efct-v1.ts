import {
  FoodCompositionImporter,
  FoodNutrientImporter,
} from "../../src/services/nutrition/food-import";

import {
  efctFoods,
  efctNutrients,
} from "./efct-2025-v1";

async function main() {
  console.log("Importing EFCT 2025 V1 data...");

  const foodImporter = new FoodCompositionImporter(
    "Ethiopian Food Composition Table 2025"
  );

  const foodResult = await foodImporter.import(efctFoods);

  console.log("Food import:");
  console.log({
    processed: foodResult.recordsProcessed,
    created: foodResult.recordsCreated,
    updated: foodResult.recordsUpdated,
    skipped: foodResult.recordsSkipped,
    errors: foodResult.errors,
  });

  if (foodResult.errors.length > 0) {
    throw new Error("Food import contains errors.");
  }

  const nutrientImporter = new FoodNutrientImporter(
    "Ethiopian Food Composition Table 2025"
  );

  const nutrientResult = await nutrientImporter.import(efctNutrients);

  console.log("Nutrient import:");
  console.log({
    processed: nutrientResult.recordsProcessed,
    created: nutrientResult.recordsCreated,
    updated: nutrientResult.recordsUpdated,
    skipped: nutrientResult.recordsSkipped,
    errors: nutrientResult.errors,
  });

  if (nutrientResult.errors.length > 0) {
    throw new Error("Nutrient import contains errors.");
  }

  console.log("EFCT 2025 V1 import completed successfully.");
}

main().catch((error) => {
  console.error("EFCT import failed:", error);
  process.exit(1);
});