import type {
  DatasetImporter,
  FoodPriceImportRecord,
  ImportResult,
} from "@/types/data-import";

export function validateFoodPriceRecords(
  records: FoodPriceImportRecord[],
): {
  valid: FoodPriceImportRecord[];
  invalid: Array<{
    record: FoodPriceImportRecord;
    reason: string;
  }>;
} {
  const valid: FoodPriceImportRecord[] = [];
  const invalid: Array<{
    record: FoodPriceImportRecord;
    reason: string;
  }> = [];

  const seenRecords = new Set<string>();

  for (const record of records) {
    if (!record.canonicalFoodId?.trim()) {
      invalid.push({
        record,
        reason: "Missing canonicalFoodId",
      });
      continue;
    }

    if (!record.regionCode?.trim()) {
      invalid.push({
        record,
        reason: "Missing regionCode",
      });
      continue;
    }

    if (
      typeof record.price !== "number" ||
      !Number.isFinite(record.price) ||
      record.price <= 0
    ) {
      invalid.push({
        record,
        reason: "Invalid price",
      });
      continue;
    }

    if (!record.unit?.trim()) {
      invalid.push({
        record,
        reason: "Missing unit",
      });
      continue;
    }

    if (record.currency !== "ETB") {
      invalid.push({
        record,
        reason: "Nourish V1 price imports currently support ETB only",
      });
      continue;
    }

    if (
      !(record.observedAt instanceof Date) ||
      Number.isNaN(record.observedAt.getTime())
    ) {
      invalid.push({
        record,
        reason: "Invalid observedAt",
      });
      continue;
    }

    if (!record.provenance?.sourceName?.trim()) {
      invalid.push({
        record,
        reason: "Missing provenance.sourceName",
      });
      continue;
    }

    const duplicateKey = [
      record.canonicalFoodId,
      record.regionCode,
      record.unit,
      record.currency,
      record.observedAt.toISOString(),
      record.provenance.sourceName,
    ].join("|");

    if (seenRecords.has(duplicateKey)) {
      invalid.push({
        record,
        reason: `Duplicate price record: ${duplicateKey}`,
      });
      continue;
    }

    seenRecords.add(duplicateKey);
    valid.push(record);
  }

  return {
    valid,
    invalid,
  };
}

export class FoodPriceImporter
  implements DatasetImporter<FoodPriceImportRecord>
{
  sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  validate(records: FoodPriceImportRecord[]) {
    return validateFoodPriceRecords(records);
  }

  async import(
    records: FoodPriceImportRecord[],
  ): Promise<ImportResult> {
    const { valid, invalid } = this.validate(records);
    const { prisma } = await import("@/lib/db");

    let created = 0;
    let updated = 0;

    const errors: ImportResult["errors"] = invalid.map(
      ({ record, reason }) => ({
        record,
        message: reason,
      }),
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

        const region = await prisma.region.findUnique({
          where: {
            code: record.regionCode,
          },
        });

        if (!region) {
          errors.push({
            record,
            message: `Region not found: ${record.regionCode}`,
          });
          continue;
        }

        const existing = await prisma.foodPrice.findFirst({
          where: {
            foodId: food.id,
            regionId: region.id,
            unit: record.unit,
            currency: "ETB",
            observedAt: record.observedAt,
            sourceName: record.provenance.sourceName,
          },
        });

        const data = {
          price: record.price,
          unit: record.unit,
          currency: "ETB" as const,
          sourceName: record.provenance.sourceName,
          sourceUrl: record.provenance.sourceUrl ?? null,

          // This importer is for externally prepared/imported
          // price snapshots. Genuine market surveys can later
          // use PRICE_SURVEY through a separate verified pipeline.
          sourceType: "IMPORTED" as const,

          observedAt: record.observedAt,
        };

        if (existing) {
          await prisma.foodPrice.update({
            where: {
              id: existing.id,
            },
            data,
          });

          updated++;
        } else {
          await prisma.foodPrice.create({
            data: {
              foodId: food.id,
              regionId: region.id,
              ...data,
            },
          });

          created++;
        }
      } catch (error) {
        errors.push({
          record,
          message:
            error instanceof Error
              ? error.message
              : "Unknown error",
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