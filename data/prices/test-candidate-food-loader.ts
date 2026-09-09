import { prisma } from "../../src/lib/db";
import { loadCandidateFoods } from "../../src/services/optimization/candidate-food-loader";

async function main() {
  console.log("Testing Nourish candidate food loader...\n");

  const region = await prisma.region.findUnique({
    where: {
      code: "ET-AA",
    },
  });

  if (!region) {
    throw new Error(
      "Addis Ababa region ET-AA was not found. Run the database seed first.",
    );
  }

  console.log(`Region: ${region.nameEn} (${region.code})`);

  const foods = await loadCandidateFoods({
    regionId: region.id,
    currency: "ETB",
    asOfDate: new Date("2026-09-08T23:59:59.999Z"),
  });

  const foodsWithPrices = foods.filter(
    (food) => food.price !== null,
  );

  const foodsWithoutPrices = foods.filter(
    (food) => food.price === null,
  );

  console.log(`Total candidate foods: ${foods.length}`);
  console.log(`Foods with prices: ${foodsWithPrices.length}`);
  console.log(`Foods without prices: ${foodsWithoutPrices.length}`);

  console.log("\nCandidate foods:\n");

  for (const food of foods) {
    console.log("----------------------------------------");
    console.log(`${food.nameEn}`);
    console.log(`Canonical ID: ${food.canonicalId}`);

    console.log(
      `Nutrients: ${Object.keys(food.nutrientsPer100g).join(", ")}`,
    );

    if (food.price) {
      console.log(
        `Price: ${food.price.amount} ${food.price.currency}/${food.price.unit}`,
      );

      console.log(
        `Price source: ${food.price.sourceName ?? "Unknown"}`,
      );

      console.log(
        `Observed: ${food.price.observedAt.toISOString()}`,
      );
    } else {
      console.log("Price: NOT AVAILABLE");
    }
  }

  console.log("\n----------------------------------------");

  if (foods.length !== 15) {
    console.warn(
      `WARNING: Expected 15 Phase 2 foods but loaded ${foods.length}.`,
    );
  }

  if (foodsWithPrices.length !== 15) {
    console.warn(
      `WARNING: Expected 15 foods with demo prices but found ${foodsWithPrices.length}.`,
    );
  }

  console.log("\nCandidate food loader test completed.");
}

main()
  .catch((error) => {
    console.error("\nCandidate food loader test FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });