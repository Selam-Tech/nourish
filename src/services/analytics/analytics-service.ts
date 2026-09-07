/**
 * Privacy-preserving analytics service boundary.
 *
 * Future Nourish Impact will aggregate anonymized statistics.
 * This service must NEVER expose:
 * - household names
 * - phone numbers
 * - identifiable histories
 * - individual medical data
 */

export interface AnonymizedHouseholdAggregate {
  regionCode: string;
  householdSizeBucket: string;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface NutrientGapAggregate {
  nutrientCode: string;
  regionCode: string;
  gapFrequency: number;
  averageCoverageRatio: number;
  sampleSize: number;
}

export interface AffordabilityAggregate {
  regionCode: string;
  nutrientCode: string;
  averageGapCost: number | null;
  currency: string;
  sampleSize: number;
}

export interface AnalyticsQuery {
  regionCode?: string;
  periodStart: Date;
  periodEnd: Date;
  minSampleSize?: number;
}

export interface AnalyticsService {
  getNutrientGapAggregates(query: AnalyticsQuery): Promise<NutrientGapAggregate[]>;
  getAffordabilityAggregates(query: AnalyticsQuery): Promise<AffordabilityAggregate[]>;
}

export class UnimplementedAnalyticsService implements AnalyticsService {
  private notImplemented(): never {
    throw new Error(
      "Nourish Impact analytics is not yet implemented. " +
        "Privacy-preserving institutional analytics is planned for a future phase.",
    );
  }

  async getNutrientGapAggregates(
    query: AnalyticsQuery,
  ): Promise<NutrientGapAggregate[]> {
    void query;
    this.notImplemented();
  }

  async getAffordabilityAggregates(
    query: AnalyticsQuery,
  ): Promise<AffordabilityAggregate[]> {
    void query;
    this.notImplemented();
  }
}

export const analyticsService: AnalyticsService = new UnimplementedAnalyticsService();
