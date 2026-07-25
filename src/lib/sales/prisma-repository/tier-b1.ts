// ─── Tier B1 intelligence (market signals, commercial recommendations) ───

import { getPrismaAny } from "./common";

export function isTierB1PrismaReady(): boolean {
  const db = getPrismaAny();
  return !!(db.salesMarketSignal?.findMany && db.salesCommercialRecommendation?.findMany);
}

export async function prismaLoadTierB1Intelligence(
  organizationId: string,
): Promise<{
  marketSignals: Map<string, unknown>;
  commercialRecommendations: Map<string, unknown>;
} | null> {
  try {
    const db = getPrismaAny();
    const [signals, recs] = await Promise.all([
      db.salesMarketSignal.findMany({ where: { organizationId }, take: 10000 }),
      db.salesCommercialRecommendation.findMany({ where: { organizationId }, take: 10000 }),
    ]);
    return {
      marketSignals: new Map(signals.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      commercialRecommendations: new Map(recs.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateMarketSignal(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesMarketSignal.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateMarketSignal(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesMarketSignal.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteMarketSignal(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesMarketSignal.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateCommercialRecommendation(
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesCommercialRecommendation.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateCommercialRecommendation(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesCommercialRecommendation.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteCommercialRecommendation(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesCommercialRecommendation.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}
