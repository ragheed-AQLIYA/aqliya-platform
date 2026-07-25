// ─── Tier A intelligence (signals, objections, mentions, insights, etc.) ───

import { getPrismaAny } from "./common";

const TIER_A_DELEGATES = [
  "salesSignal",
  "salesObjection",
  "salesCompetitorMention",
  "salesWinLossInsight",
  "salesICPInsight",
  "salesNextAction",
  "salesProofAsset",
] as const;

export function isTierAPrismaIntelligenceReady(): boolean {
  const db = getPrismaAny();
  return TIER_A_DELEGATES.every((name) => !!db[name]?.findMany);
}

export async function prismaLoadTierAIntelligence(
  organizationId: string,
): Promise<Record<string, Map<string, unknown>> | null> {
  try {
    const db = getPrismaAny();
    const [signals, objections, mentions, winLoss, icp, actions, proofs] =
      await Promise.all([
        db.salesSignal.findMany({ where: { organizationId }, take: 10000 }),
        db.salesObjection.findMany({ where: { organizationId }, take: 10000 }),
        db.salesCompetitorMention.findMany({ where: { organizationId }, take: 10000 }),
        db.salesWinLossInsight.findMany({ where: { organizationId }, take: 10000 }),
        db.salesICPInsight.findMany({ where: { organizationId }, take: 10000 }),
        db.salesNextAction.findMany({ where: { organizationId }, take: 10000 }),
        db.salesProofAsset.findMany({ where: { organizationId }, take: 10000 }),
      ]);
    return {
      signals: new Map(signals.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      objections: new Map(objections.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      competitorMentions: new Map(mentions.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      winLossInsights: new Map(winLoss.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      icpInsights: new Map(icp.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      nextActions: new Map(actions.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      proofAssets: new Map(proofs.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateSignal(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesSignal.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateSignal(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesSignal.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteSignal(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesSignal.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateObjection(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesObjection.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateCompetitorMention(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesCompetitorMention.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateWinLossInsight(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesWinLossInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateICPInsight(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesICPInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateNextAction(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesNextAction.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateProofAsset(data: Record<string, unknown>): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesProofAsset.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteProofAsset(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesProofAsset.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}
