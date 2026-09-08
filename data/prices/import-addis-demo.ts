import { FoodPriceImporter } from "../../src/services/pricing/price-import";

import {
  ADDIS_ABABA_DEMO_PRICE_SOURCE,
  addisAbabaDemoPrices,
} from "./addis-ababa-demo-v1";

async function main() {
  console.log("Importing Nourish Addis Ababa demo prices...");

  const importer = new FoodPriceImporter(
    ADDIS_ABABA_DEMO_PRICE_SOURCE,
  );

  const result = await importer.import(addisAbabaDemoPrices);

  console.log("Price import result:");
  console.log({
    sourceName: result.sourceName,
    processed: result.recordsProcessed,
    created: result.recordsCreated,
    updated: result.recordsUpdated,
    skipped: result.recordsSkipped,
    errors: result.errors,
  });

  if (result.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    "Successfully imported Nourish demo price snapshot.",
  );
}

main().catch((error) => {
  console.error("Price import failed:", error);
  process.exit(1);
});