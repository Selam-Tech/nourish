/**
 * Food composition data import runner.
 *
 * Expected source: Ethiopian Food Composition Table (EFCT) and similar
 * authoritative datasets placed in data/foods/.
 *
 * Usage (future):
 *   npx tsx data/foods/import.ts --file efct.csv --source "EFCT 2019"
 */

import type {
  DatasetImporter,
  FoodImportRecord,
  FoodNutrientImportRecord,
  ImportResult,
} from "@/types/data-import";

export function validateFoodRecords(records: FoodImportRecord[]): {
  valid: FoodImportRecord[];
  invalid: Array<{ record: FoodImportRecord; reason: string }>;
} {
  const valid: FoodImportRecord[] = [];
  const invalid: Array<{ record: FoodImportRecord; reason: string }> = [];

  const seenIds = new Set<string>();

  for (const record of records) {
    if (!record.canonicalId?.trim()) {
      invalid.push({ record, reason: "Missing canonicalId" });
      continue;
    }

    if (!record.nameEn?.trim()) {
      invalid.push({ record, reason: "Missing nameEn" });
      continue;
    }

    if (!record.defaultUnit?.trim()) {
      invalid.push({ record, reason: "Missing defaultUnit" });
      continue;
    }

    if (!record.provenance?.sourceName) {
      invalid.push({ record, reason: "Missing provenance.sourceName" });
      continue;
    }

    if (seenIds.has(record.canonicalId)) {
      invalid.push({
        record,
        reason: `Duplicate canonicalId: ${record.canonicalId}`,
      });
      continue;
    }

    seenIds.add(record.canonicalId);
    valid.push(record);
  }

  return { valid, invalid };
}

export function validateNutrientRecords(
  records: FoodNutrientImportRecord[]
): {
  valid: FoodNutrientImportRecord[];
  invalid: Array<{ record: FoodNutrientImportRecord; reason: string }>;
} {
  const valid: FoodNutrientImportRecord[] = [];
  const invalid: Array<{
    record: FoodNutrientImportRecord;
    reason: string;
  }> = [];

  const seenPairs = new Set<string>();

  for (const record of records) {
    if (!record.canonicalFoodId?.trim()) {
      invalid.push({ record, reason: "Missing canonicalFoodId" });
      continue;
    }

    if (!record.nutrientCode?.trim()) {
      invalid.push({ record, reason: "Missing nutrientCode" });
      continue;
    }

    if (
      typeof record.amountPer100g !== "number" ||
      !Number.isFinite(record.amountPer100g) ||
      record.amountPer100g < 0
    ) {
      invalid.push({ record, reason: "Invalid amountPer100g" });
      continue;
    }

    if (!record.provenance?.sourceName) {
      invalid.push({ record, reason: "Missing provenance.sourceName" });
      continue;
    }

    const pairKey = `${record.canonicalFoodId}:${record.nutrientCode}`;

    if (seenPairs.has(pairKey)) {
      invalid.push({
        record,
        reason: `Duplicate food/nutrient pair: ${pairKey}`,
      });
      continue;
    }

    seenPairs.add(pairKey);
    valid.push(record);
  }

  return { valid, invalid };
}

/**
 * Imports food records from an authoritative composition dataset.
 */
export class FoodCompositionImporter
  implements DatasetImporter<FoodImportRecord>
{
  sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  validate(records: FoodImportRecord[]) {
    return validateFoodRecords(records);
  }

  async import(records: FoodImportRecord[]): Promise<ImportResult> {
    const { valid, invalid } = this.validate(records);
    const { prisma } = await import("@/lib/db");

    let created = 0;
    let updated = 0;

    const errors: ImportResult["errors"] = invalid.map(
      ({ record, reason }) => ({
        record,
        message: reason,
      })
    );

    for (const record of valid) {
      try {
        const existing = await prisma.food.findUnique({
          where: {
            canonicalId: record.canonicalId,
          },
        });

        const data = {
          nameEn: record.nameEn,
          nameAm: record.nameAm ?? null,
          foodGroup: record.foodGroup ?? null,
          defaultUnit: record.defaultUnit,
          ediblePortion: record.ediblePortion ?? null,
          sourceName: record.provenance.sourceName,
          sourceUrl: record.provenance.sourceUrl ?? null,
          sourceVersion:
            record.provenance.publicationVersion ?? null,
          importedAt: record.provenance.importedAt,
        };

        if (existing) {
          await prisma.food.update({
            where: {
              canonicalId: record.canonicalId,
            },
            data,
          });

          updated++;
        } else {
          await prisma.food.create({
            data: {
              canonicalId: record.canonicalId,
              ...data,
            },
          });

          created++;
        }
      } catch (err) {
        errors.push({
          record,
          message:
            err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return {
      sourceName: this.sourceName,
      recordsProcessed: records.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: invalid.length,
      errors,
      importedAt: new Date(),
    };
  }
}

/**
 * Imports nutrient values for foods already stored in the database.
 *
 * Each value represents the nutrient amount per 100 g edible portion.
 *
 * Source quality metadata is preserved when supplied by the dataset.
 */
export class FoodNutrientImporter
  implements DatasetImporter<FoodNutrientImportRecord>
{
  sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  validate(records: FoodNutrientImportRecord[]) {
    return validateNutrientRecords(records);
  }

  async import(
    records: FoodNutrientImportRecord[]
  ): Promise<ImportResult> {
    const { valid, invalid } = this.validate(records);
    const { prisma } = await import("@/lib/db");

    let created = 0;
    let updated = 0;

    const errors: ImportResult["errors"] = invalid.map(
      ({ record, reason }) => ({
        record,
        message: reason,
      })
    );

    for (const record of valid) {
      try {
        const food = await prisma.food.findUnique({
          where: {
            canonicalId: record.canonicalFoodId,
          },
        });

        if (!food) {
          errors.push({
            record,
            message: `Food not found: ${record.canonicalFoodId}`,
          });
          continue;
        }

        const nutrient =
          await prisma.nutrientDefinition.findUnique({
            where: {
              code: record.nutrientCode,
            },
          });

        if (!nutrient) {
          errors.push({
            record,
            message: `Nutrient not found: ${record.nutrientCode}`,
          });
          continue;
        }

        const existing = await prisma.foodNutrient.findUnique({
          where: {
            foodId_nutrientId: {
              foodId: food.id,
              nutrientId: nutrient.id,
            },
          },
        });

        const data = {
          amountPer100g: record.amountPer100g,
          sourceName: record.provenance.sourceName,
          sourceUrl: record.provenance.sourceUrl ?? null,
          sourceVersion:
            record.provenance.publicationVersion ?? null,
          importedAt: record.provenance.importedAt,

          // Preserve source-specific quality information.
          sourceFlag: record.quality?.sourceFlag ?? null,
          qualityNote: record.quality?.qualityNote ?? null,
        };

        if (existing) {
          await prisma.foodNutrient.update({
            where: {
              foodId_nutrientId: {
                foodId: food.id,
                nutrientId: nutrient.id,
              },
            },
            data,
          });

          updated++;
        } else {
          await prisma.foodNutrient.create({
            data: {
              foodId: food.id,
              nutrientId: nutrient.id,
              ...data,
            },
          });

          created++;
        }
      } catch (err) {
        errors.push({
          record,
          message:
            err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return {
      sourceName: this.sourceName,
      recordsProcessed: records.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: invalid.length,
      errors,
      importedAt: new Date(),
    };
  }
}