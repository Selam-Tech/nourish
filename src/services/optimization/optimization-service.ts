import type {
  OptimizationInput,
  OptimizationResult,
  MarginalValueQuery,
  MarginalValueResult,
  AffordabilityGapInput,
  AffordabilityGapResult,
  PriceShockInput,
  PriceShockResult,
} from "@/types/optimization";

/**
 * Scarcity Optimizer service contract.
 *
 * The deterministic mathematical optimizer will be implemented in a future phase.
 * This interface defines the boundary that all optimizer implementations must satisfy.
 */
export interface OptimizationService {
  optimize(input: OptimizationInput): Promise<OptimizationResult>;
  calculateMarginalValue(query: MarginalValueQuery): Promise<MarginalValueResult>;
  analyzeAffordabilityGaps(input: AffordabilityGapInput): Promise<AffordabilityGapResult[]>;
  simulatePriceShock(input: PriceShockInput): Promise<PriceShockResult>;
}

export class UnimplementedOptimizationService implements OptimizationService {
  private notImplemented(): never {
    throw new Error(
      "Nutrition optimization engine not yet implemented. " +
        "Deterministic mathematical optimization is planned for the next development phase.",
    );
  }

  async optimize(input: OptimizationInput): Promise<OptimizationResult> {
    void input;
    this.notImplemented();
  }

  async calculateMarginalValue(query: MarginalValueQuery): Promise<MarginalValueResult> {
    void query;
    this.notImplemented();
  }

  async analyzeAffordabilityGaps(
    input: AffordabilityGapInput,
  ): Promise<AffordabilityGapResult[]> {
    void input;
    this.notImplemented();
  }

  async simulatePriceShock(input: PriceShockInput): Promise<PriceShockResult> {
    void input;
    this.notImplemented();
  }
}

export const optimizationService: OptimizationService =
  new UnimplementedOptimizationService();
