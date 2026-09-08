import type { FoodPriceImportRecord } from "../../src/types/data-import";

/**
 * Nourish Hackathon Demo Price Dataset — Addis Ababa V1
 *
 * IMPORTANT:
 * These values are MODELING ASSUMPTIONS for development and demonstration.
 * They are NOT claimed to be current observed Addis Ababa retail prices.
 *
 * All prices use ETB per kilogram so that the Nourish optimizer can
 * consistently convert market prices to ETB per gram.
 *
 * Before production use, replace this dataset with dated, documented
 * market observations from a verified price source.
 */

export const ADDIS_ABABA_DEMO_PRICE_SOURCE =
  "Nourish Addis Ababa Demo Price Snapshot";

export const ADDIS_ABABA_DEMO_PRICE_VERSION = "v1";

export const ADDIS_ABABA_REGION_CODE = "ET-AA";

export const ADDIS_ABABA_DEMO_PRICE_DATE =
  new Date("2026-09-08T00:00:00.000Z");

const provenance = {
  sourceName: ADDIS_ABABA_DEMO_PRICE_SOURCE,
  sourceReference: "Nourish hackathon modeling dataset",
  publicationVersion: ADDIS_ABABA_DEMO_PRICE_VERSION,
  importedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
  unit: "ETB/kg",
  notes:
    "Synthetic modeling assumptions for the Nourish hackathon demo. Not observed, surveyed, live, or official Addis Ababa market prices.",
};

/**
 * Synthetic V1 modeling assumptions.
 *
 * The purpose of these values is to exercise the Scarcity Optimizer,
 * price normalization, +10 Birr analysis, price-shock simulation,
 * and intervention modeling before verified market observations
 * are integrated.
 */
export const addisAbabaDemoPrices: FoodPriceImportRecord[] = [
  {
    canonicalFoodId: "efct2025-010109",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 160,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-040003",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 80,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-040008",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 90,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-060007",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 300,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-050003",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 180,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-050005",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 100,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-080001",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 300,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-020011",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 70,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-030003",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 220,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-030006",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 170,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-030032",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 190,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-040004",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 90,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-060022",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 350,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-100009",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 100,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
  {
    canonicalFoodId: "efct2025-010090",
    regionCode: ADDIS_ABABA_REGION_CODE,
    price: 130,
    unit: "kg",
    currency: "ETB",
    observedAt: ADDIS_ABABA_DEMO_PRICE_DATE,
    provenance,
  },
];