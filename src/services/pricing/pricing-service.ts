/**
 * Pricing service boundary.
 * Future: regional price lookups, price shock simulation inputs.
 */

export interface PriceLookupQuery {
  foodId: string;
  regionId: string;
  asOfDate?: Date;
}

export interface PriceLookupResult {
  foodId: string;
  regionId: string;
  price: number;
  unit: string;
  currency: string;
  observedAt: Date;
  sourceName: string | null;
}

export interface PricingService {
  getLatestPrice(query: PriceLookupQuery): Promise<PriceLookupResult | null>;
  getPricesForRegion(regionId: string, asOfDate?: Date): Promise<PriceLookupResult[]>;
}

export class UnimplementedPricingService implements PricingService {
  async getLatestPrice(_query: PriceLookupQuery): Promise<PriceLookupResult | null> {
    const { prisma } = await import("@/lib/db");
    const price = await prisma.foodPrice.findFirst({
      where: {
        foodId: _query.foodId,
        regionId: _query.regionId,
        ...(_query.asOfDate && { observedAt: { lte: _query.asOfDate } }),
      },
      orderBy: { observedAt: "desc" },
    });

    if (!price) return null;

    return {
      foodId: price.foodId,
      regionId: price.regionId,
      price: Number(price.price),
      unit: price.unit,
      currency: price.currency,
      observedAt: price.observedAt,
      sourceName: price.sourceName,
    };
  }

  async getPricesForRegion(regionId: string, asOfDate?: Date): Promise<PriceLookupResult[]> {
    const { prisma } = await import("@/lib/db");
    const prices = await prisma.foodPrice.findMany({
      where: {
        regionId,
        ...(asOfDate && { observedAt: { lte: asOfDate } }),
      },
      orderBy: { observedAt: "desc" },
      distinct: ["foodId"],
    });

    return prices.map((price) => ({
      foodId: price.foodId,
      regionId: price.regionId,
      price: Number(price.price),
      unit: price.unit,
      currency: price.currency,
      observedAt: price.observedAt,
      sourceName: price.sourceName,
    }));
  }
}

export const pricingService: PricingService = new UnimplementedPricingService();
