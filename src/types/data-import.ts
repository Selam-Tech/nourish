/** Data provenance metadata for imported datasets */
export interface DataProvenance {
  sourceName: string;
  sourceUrl?: string;
  sourceReference?: string;
  publicationVersion?: string;
  importedAt: Date;
  unit: string;
  notes?: string;
}

/** Record for importing a food from an authoritative composition table */
export interface FoodImportRecord {
  canonicalId: string;
  nameEn: string;
  nameAm?: string;
  foodGroup?: string;
  defaultUnit: string;
  ediblePortion?: number;
  provenance: DataProvenance;
}

/** Nutrient value for a food import */
export interface FoodNutrientImportRecord {
  canonicalFoodId: string;
  nutrientCode: string;
  amountPer100g: number;
  provenance: DataProvenance;
}

/** Price record for import */
export interface FoodPriceImportRecord {
  canonicalFoodId: string;
  regionCode: string;
  price: number;
  unit: string;
  currency: string;
  observedAt: Date;
  provenance: DataProvenance;
}

/** Nutrient reference requirement import */
export interface NutrientRequirementImportRecord {
  nutrientCode: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  sex: string;
  pregnancyStatus: string;
  targetAmount: number;
  unit: string;
  provenance: DataProvenance;
}

/** Result of a data import operation */
export interface ImportResult {
  sourceName: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: Array<{ record: unknown; message: string }>;
  importedAt: Date;
}

/** Interface for dataset importers */
export interface DatasetImporter<T> {
  sourceName: string;
  validate(records: T[]): { valid: T[]; invalid: Array<{ record: T; reason: string }> };
  import(records: T[]): Promise<ImportResult>;
}
