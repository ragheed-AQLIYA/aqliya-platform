// ─── SalesOS Tier A intelligence persistence (Prisma hydrate + file overlay) ───
// Tier A: Signal, Objection, CompetitorMention, WinLoss, ICP, NextAction, ProofAsset
// Tier B (market signals, recommendations, graph) stays runtime-only until approved.

import "server-only";
import type {
  SalesCompetitorMention,
  SalesICPInsight,
  SalesNextAction,
  SalesObjection,
  SalesProofAsset,
  SalesSignal,
  SalesWinLossInsight,
} from "./types";
import { loadSalesOrgSnapshot } from "./persistence";

/** Tier A entity maps merged on Prisma load so intelligence is not wiped. */
export interface TierAIntelligenceMaps {
  signals: Map<string, SalesSignal>;
  objections: Map<string, SalesObjection>;
  competitorMentions: Map<string, SalesCompetitorMention>;
  proofAssets: Map<string, SalesProofAsset>;
  icpInsights: Map<string, SalesICPInsight>;
  nextActions: Map<string, SalesNextAction>;
  winLossInsights: Map<string, SalesWinLossInsight>;
}

/** Optional array snapshot shape returned by prisma-repository hydrate. */
export interface TierAIntelligenceArrays {
  signals?: SalesSignal[];
  objections?: SalesObjection[];
  competitorMentions?: SalesCompetitorMention[];
  proofAssets?: SalesProofAsset[];
  icpInsights?: SalesICPInsight[];
  nextActions?: SalesNextAction[];
  winLossInsights?: SalesWinLossInsight[];
}

/** Read-only repository surface wired by Agent 2 (optional until migrate). */
interface PrismaTierARepository {
  prismaLoadTierAIntelligence?(
    organizationId: string,
  ): Promise<TierAIntelligenceMaps | TierAIntelligenceArrays | null>;
}

const PRISMA_PERSISTENCE_ENABLED =
  process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
  process.env.SALESOS_PRISMA_PERSISTENCE === "true";

export function emptyTierAMaps(): TierAIntelligenceMaps {
  return {
    signals: new Map(),
    objections: new Map(),
    competitorMentions: new Map(),
    proofAssets: new Map(),
    icpInsights: new Map(),
    nextActions: new Map(),
    winLossInsights: new Map(),
  };
}

function assertTenant<T extends { organizationId: string }>(
  organizationId: string,
  items: T[] | undefined,
): T[] {
  if (!items?.length) return [];
  return items.filter((item) => item.organizationId === organizationId);
}

function mapFromTenantArray<T extends { id: string; organizationId: string }>(
  organizationId: string,
  items: T[] | undefined,
): Map<string, T> {
  return new Map(
    assertTenant(organizationId, items).map((item) => [item.id, item]),
  );
}

function isTierAMapPayload(
  payload: TierAIntelligenceMaps | TierAIntelligenceArrays,
): payload is TierAIntelligenceMaps {
  return payload.signals instanceof Map;
}

/** Normalize repository hydrate output (maps or arrays) into tenant-scoped Tier A maps. */
export function tierAMapsFromPayload(
  organizationId: string,
  payload: TierAIntelligenceMaps | TierAIntelligenceArrays,
): TierAIntelligenceMaps {
  if (isTierAMapPayload(payload)) {
    return {
      signals: mapFromTenantArray(organizationId, [...payload.signals.values()]),
      objections: mapFromTenantArray(
        organizationId,
        [...payload.objections.values()],
      ),
      competitorMentions: mapFromTenantArray(
        organizationId,
        [...payload.competitorMentions.values()],
      ),
      proofAssets: mapFromTenantArray(
        organizationId,
        [...payload.proofAssets.values()],
      ),
      icpInsights: mapFromTenantArray(
        organizationId,
        [...payload.icpInsights.values()],
      ),
      nextActions: mapFromTenantArray(
        organizationId,
        [...payload.nextActions.values()],
      ),
      winLossInsights: mapFromTenantArray(
        organizationId,
        [...payload.winLossInsights.values()],
      ),
    };
  }

  return {
    signals: mapFromTenantArray(organizationId, payload.signals),
    objections: mapFromTenantArray(organizationId, payload.objections),
    competitorMentions: mapFromTenantArray(
      organizationId,
      payload.competitorMentions,
    ),
    proofAssets: mapFromTenantArray(organizationId, payload.proofAssets),
    icpInsights: mapFromTenantArray(organizationId, payload.icpInsights),
    nextActions: mapFromTenantArray(organizationId, payload.nextActions),
    winLossInsights: mapFromTenantArray(
      organizationId,
      payload.winLossInsights,
    ),
  };
}

function tierAHasRows(maps: TierAIntelligenceMaps): boolean {
  return (
    maps.signals.size > 0 ||
    maps.objections.size > 0 ||
    maps.competitorMentions.size > 0 ||
    maps.proofAssets.size > 0 ||
    maps.icpInsights.size > 0 ||
    maps.nextActions.size > 0 ||
    maps.winLossInsights.size > 0
  );
}

/**
 * Load Tier A intelligence from Prisma repository (fail-soft when tables or loader absent).
 */
export async function loadTierAIntelligenceFromPrisma(
  organizationId: string,
): Promise<TierAIntelligenceMaps | null> {
  if (!PRISMA_PERSISTENCE_ENABLED) return null;

  try {
    const repo = (await import(
      "./prisma-repository"
    )) as PrismaTierARepository;
    const loader = repo.prismaLoadTierAIntelligence;
    if (typeof loader !== "function") return null;

    const loaded = await loader(organizationId);
    if (!loaded) return null;

    const maps = tierAMapsFromPayload(organizationId, loaded);
    return tierAHasRows(maps) ? maps : null;
  } catch {
    return null;
  }
}

/**
 * Load Tier A intelligence from the org file snapshot (fallback authority until Prisma Tier A migrate).
 * Safe when file is missing — returns null.
 */
export async function loadTierAIntelligenceOverlay(
  organizationId: string,
): Promise<TierAIntelligenceMaps | null> {
  const snapshot = await loadSalesOrgSnapshot(organizationId);
  if (!snapshot) return null;

  const maps = tierAMapsFromPayload(organizationId, {
    signals: snapshot.signals,
    objections: snapshot.objections,
    competitorMentions: snapshot.competitorMentions,
    proofAssets: snapshot.proofAssets,
    icpInsights: snapshot.icpInsights,
    nextActions: snapshot.nextActions,
    winLossInsights: snapshot.winLossInsights,
  });

  return tierAHasRows(maps) ? maps : null;
}

/** Merge Tier A maps into a target without dropping existing rows (overlay wins on id). */
export function mergeTierAIntelligenceIntoStore(
  target: TierAIntelligenceMaps,
  overlay: TierAIntelligenceMaps,
): void {
  for (const [id, row] of overlay.signals) target.signals.set(id, row);
  for (const [id, row] of overlay.objections) target.objections.set(id, row);
  for (const [id, row] of overlay.competitorMentions) {
    target.competitorMentions.set(id, row);
  }
  for (const [id, row] of overlay.proofAssets) target.proofAssets.set(id, row);
  for (const [id, row] of overlay.icpInsights) target.icpInsights.set(id, row);
  for (const [id, row] of overlay.nextActions) target.nextActions.set(id, row);
  for (const [id, row] of overlay.winLossInsights) {
    target.winLossInsights.set(id, row);
  }
}

/**
 * Hydrate Tier A maps after Prisma core load: repository base + file overlay parity.
 * Does not touch activities/meetings/outreach (non-Tier-A intelligence maps).
 */
export async function hydrateTierAIntelligenceMaps(
  organizationId: string,
  target: TierAIntelligenceMaps,
): Promise<void> {
  const fromPrisma = await loadTierAIntelligenceFromPrisma(organizationId);
  if (fromPrisma) mergeTierAIntelligenceIntoStore(target, fromPrisma);

  const fromFile = await loadTierAIntelligenceOverlay(organizationId);
  if (fromFile) mergeTierAIntelligenceIntoStore(target, fromFile);
}
