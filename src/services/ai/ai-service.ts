import type { SupportedLocale } from "@/lib/constants";

/** AI service boundary — AI must NOT be authoritative for nutrition data */

export interface FoodMappingRequest {
  term: string;
  locale: SupportedLocale;
  regionCode?: string;
}

export interface FoodMappingResult {
  canonicalFoodId: string | null;
  confidence: number;
  matchedName: string | null;
  alternatives: Array<{ canonicalFoodId: string; name: string; confidence: number }>;
}

export interface HouseholdInputInterpretation {
  rawInput: string;
  locale: SupportedLocale;
}

export interface InterpretedHouseholdInput {
  suggestedMembers?: Array<{ name: string; approximateAge?: number }>;
  suggestedBudget?: { amount: number; currency: string };
  suggestedPantryItems?: Array<{ foodTerm: string; quantity?: number; unit?: string }>;
  confidence: number;
  requiresConfirmation: boolean;
}

export interface OptimizationExplanationRequest {
  resultId: string;
  locale: SupportedLocale;
  audienceLevel: "household" | "technical";
}

export interface OptimizationExplanation {
  summary: string;
  keyTradeoffs: string[];
  gapExplanations: string[];
  disclaimer: string;
}

export interface InstitutionalSummaryRequest {
  aggregateStats: Record<string, number>;
  locale: SupportedLocale;
  timeRange: { from: Date; to: Date };
}

export interface InstitutionalSummary {
  narrative: string;
  keyFindings: string[];
  methodologyNote: string;
}

/**
 * AI service contract.
 * Implementations must never generate nutrient values, prices,
 * requirements, optimization results, or medical diagnoses.
 */
export interface AIService {
  mapFoodTerm(request: FoodMappingRequest): Promise<FoodMappingResult>;
  interpretHouseholdInput(
    request: HouseholdInputInterpretation,
  ): Promise<InterpretedHouseholdInput>;
  explainOptimizationResult(
    request: OptimizationExplanationRequest,
  ): Promise<OptimizationExplanation>;
  summarizeInstitutionalStats(
    request: InstitutionalSummaryRequest,
  ): Promise<InstitutionalSummary>;
}

/** Stub implementation — no AI connected in this phase */
export class UnconfiguredAIService implements AIService {
  private notConfigured(): never {
    throw new Error(
      "AI service is not configured. AI integration is planned for a future phase.",
    );
  }

  async mapFoodTerm(request: FoodMappingRequest): Promise<FoodMappingResult> {
    void request;
    this.notConfigured();
  }

  async interpretHouseholdInput(
    request: HouseholdInputInterpretation,
  ): Promise<InterpretedHouseholdInput> {
    void request;
    this.notConfigured();
  }

  async explainOptimizationResult(
    request: OptimizationExplanationRequest,
  ): Promise<OptimizationExplanation> {
    void request;
    this.notConfigured();
  }

  async summarizeInstitutionalStats(
    request: InstitutionalSummaryRequest,
  ): Promise<InstitutionalSummary> {
    void request;
    this.notConfigured();
  }
}

export const aiService: AIService = new UnconfiguredAIService();
