/**
 * Institutional reporting service boundary.
 * Future: PDF/CSV/Excel export for Nourish Impact.
 */

export interface ReportQuery {
  regionCode?: string;
  periodStart: Date;
  periodEnd: Date;
  format: "pdf" | "csv" | "xlsx";
}

export interface ReportResult {
  format: string;
  generatedAt: Date;
  recordCount: number;
  downloadUrl?: string;
}

export interface ReportsService {
  generateAggregateReport(query: ReportQuery): Promise<ReportResult>;
}

export class UnimplementedReportsService implements ReportsService {
  private notImplemented(): never {
    throw new Error(
      "Institutional reporting is not yet implemented. Planned for Nourish Impact phase.",
    );
  }

  async generateAggregateReport(query: ReportQuery): Promise<ReportResult> {
    void query;
    this.notImplemented();
  }
}

export const reportsService: ReportsService = new UnimplementedReportsService();
