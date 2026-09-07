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
      invalid.push({ record, reason: `Duplicate canonicalId: ${record.canonicalId}` });
      continue;
    }
    seenIds.add(record.canonicalId);
    valid.push(record);
  }

  return { valid, invalid };
}

export function validateNutrientRecords(records: FoodNutrientImportRecord[]): {
  valid: FoodNutrientImportRecord[];
  invalid: Array<{ record: FoodNutrientImportRecord; reason: string }>;
} {
  const valid: FoodNutrientImportRecord[] = [];
  const invalid: Array<{ record: FoodNutrientImportRecord; reason: string }> = [];

  for (const record of records) {
    if (!record.canonicalFoodId?.trim()) {
      invalid.push({ record, reason: "Missing canonicalFoodId" });
      continue;
    }
    if (!record.nutrientCode?.trim()) {
      invalid.push({ record, reason: "Missing nutrientCode" });
      continue;
    }
    if (typeof record.amountPer100g !== "number" || record.amountPer100g < 0) {
      invalid.push({ record, reason: "Invalid amountPer100g" });
      continue;
    }
    if (!record.provenance?.sourceName) {
      invalid.push({ record, reason: "Missing provenance.sourceName" });
      continue;
    }
    valid.push(record);
  }

  return { valid, invalid };
}

/** Placeholder importer — persists validated records when database is available */
export class FoodCompositionImporter implements DatasetImporter<FoodImportRecord> {
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
    const errors: ImportResult["errors"] = invalid.map(({ record, reason }) => ({
      record,
      message: reason,
    }));

    for (const record of valid) {
      try {
        const existing = await prisma.food.findUnique({
          where: { canonicalId: record.canonicalId },
        });

        if (existing) {
          await prisma.food.update({
            where: { canonicalId: record.canonicalId },
            data: {
              nameEn: record.nameEn,
              nameAm: record.nameAm ?? null,
              foodGroup: record.foodGroup ?? null,
              defaultUnit: record.defaultUnit,
              ediblePortion: record.ediblePortion ?? null,
              sourceName: record.provenance.sourceName,
              sourceUrl: record.provenance.sourceUrl ?? null,
              sourceVersion: record.provenance.publicationVersion ?? null,
              importedAt: record.provenance.importedAt,
            },
          });
          updated++;
        } else {
          await prisma.food.create({
            data: {
              canonicalId: record.canonicalId,
              nameEn: record.nameEn,
              nameAm: record.nameAm ?? null,
              foodGroup: record.foodGroup ?? null,
              defaultUnit: record.defaultUnit,
              ediblePortion: record.ediblePortion ?? null,
              sourceName: record.provenance.sourceName,
              sourceUrl: record.provenance.sourceUrl ?? null,
              sourceVersion: record.provenance.publicationVersion ?? null,
              importedAt: record.provenance.importedAt,
            },
          });
          created++;
        }
      } catch (err) {
        errors.push({
          record,
          message: err instanceof Error ? err.message : "Unknown error",
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
