// ─── SalesOS Tier B intelligence persistence (Prisma hydrate + file overlay) ───
// B1: SalesMarketSignal, SalesCommercialRecommendation (market signals + commercial recs)
// B2: SalesInstitutionalLearningInsight (institutional learning insight snapshots)

import "server-only";
import type {
  SalesCommercialRecommendation,
  SalesInstitutionalLearningInsight,
  SalesMarketSignal,
} from "./types";
import { loadSalesOrgSnapshot } from "./persistence";

/** Tier B1 entity maps merged on Prisma load after Tier A hydrate. */
export interface TierB1IntelligenceMaps {
  marketSignals: Map<string, SalesMarketSignal>;
  commercialRecommendations: Map<string, SalesCommercialRecommendation>;
}

/** Optional array snapshot shape returned by prisma-repository hydrate. */
export interface TierB1IntelligenceArrays {
  marketSignals?: SalesMarketSignal[];
  commercialRecommendations?: SalesCommercialRecommendation[];
}

/** Read-only repository surface wired by Wave 1 B1 (optional until migrate). */
interface PrismaTierB1Repository {
  prismaLoadTierB1Intelligence?(
    organizationId: string,
  ): Promise<TierB1IntelligenceMaps | TierB1IntelligenceArrays | null>;
}

function isPrismaPersistenceEnabled(): boolean {
  return (
    process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
    process.env.SALESOS_PRISMA_PERSISTENCE === "true"
  );
}

export function emptyTierB1Maps(): TierB1IntelligenceMaps {
  return {
    marketSignals: new Map(),
    commercialRecommendations: new Map(),
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

function isTierB1MapPayload(
  payload: TierB1IntelligenceMaps | TierB1IntelligenceArrays,
): payload is TierB1IntelligenceMaps {
  return payload.marketSignals instanceof Map;
}

/** Normalize repository hydrate output (maps or arrays) into tenant-scoped Tier B1 maps. */
export function tierB1MapsFromPayload(
  organizationId: string,
  payload: TierB1IntelligenceMaps | TierB1IntelligenceArrays,
): TierB1IntelligenceMaps {
  if (isTierB1MapPayload(payload)) {
    return {
      marketSignals: mapFromTenantArray(organizationId, [
        ...payload.marketSignals.values(),
      ]),
      commercialRecommendations: mapFromTenantArray(organizationId, [
        ...payload.commercialRecommendations.values(),
      ]),
    };
  }

  return {
    marketSignals: mapFromTenantArray(organizationId, payload.marketSignals),
    commercialRecommendations: mapFromTenantArray(
      organizationId,
      payload.commercialRecommendations,
    ),
  };
}

function tierB1HasRows(maps: TierB1IntelligenceMaps): boolean {
  return maps.marketSignals.size > 0 || maps.commercialRecommendations.size > 0;
}

/**
 * Load Tier B1 intelligence from Prisma repository (fail-soft when tables or loader absent).
 */
export async function loadTierB1IntelligenceFromPrisma(
  organizationId: string,
): Promise<TierB1IntelligenceMaps | null> {
  if (!isPrismaPersistenceEnabled()) return null;

  try {
    const repo =
      (await import("./prisma-repository")) as PrismaTierB1Repository;
    const loader = repo.prismaLoadTierB1Intelligence;
    if (typeof loader !== "function") return null;

    const loaded = await loader(organizationId);
    if (!loaded) return null;

    const maps = tierB1MapsFromPayload(organizationId, loaded);
    return tierB1HasRows(maps) ? maps : null;
  } catch {
    return null;
  }
}

/**
 * Load Tier B1 intelligence from the org file snapshot (fallback authority until Prisma B1 migrate).
 * Safe when file is missing — returns null.
 */
export async function loadTierB1IntelligenceOverlay(
  organizationId: string,
): Promise<TierB1IntelligenceMaps | null> {
  const snapshot = await loadSalesOrgSnapshot(organizationId);
  if (!snapshot) return null;

  const maps = tierB1MapsFromPayload(organizationId, {
    marketSignals: snapshot.marketSignals,
    commercialRecommendations: snapshot.commercialRecommendations,
  });

  return tierB1HasRows(maps) ? maps : null;
}

/** Merge Tier B1 maps into a target without dropping existing rows (overlay wins on id). */
export function mergeTierB1IntelligenceIntoStore(
  target: TierB1IntelligenceMaps,
  overlay: TierB1IntelligenceMaps,
): void {
  for (const [id, row] of overlay.marketSignals) {
    target.marketSignals.set(id, row);
  }
  for (const [id, row] of overlay.commercialRecommendations) {
    target.commercialRecommendations.set(id, row);
  }
}

/**
 * Hydrate Tier B1 maps after Tier A: repository base + file overlay parity.
 */
export async function hydrateTierB1IntelligenceMaps(
  organizationId: string,
  target: TierB1IntelligenceMaps,
): Promise<void> {
  const fromPrisma = await loadTierB1IntelligenceFromPrisma(organizationId);
  if (fromPrisma) mergeTierB1IntelligenceIntoStore(target, fromPrisma);

  const fromFile = await loadTierB1IntelligenceOverlay(organizationId);
  if (fromFile) mergeTierB1IntelligenceIntoStore(target, fromFile);
}

/** Tier B2 entity maps merged on Prisma load after Tier B1 hydrate. */
export interface TierB2IntelligenceMaps {
  institutionalLearningInsights: Map<string, SalesInstitutionalLearningInsight>;
}

/** Optional array snapshot shape returned by prisma-repository hydrate. */
export interface TierB2IntelligenceArrays {
  institutionalLearningInsights?: SalesInstitutionalLearningInsight[];
}

/** Read-only repository surface wired by Wave 1 B2 (optional until migrate). */
interface PrismaTierB2Repository {
  prismaLoadTierB2Intelligence?(
    organizationId: string,
  ): Promise<TierB2IntelligenceMaps | TierB2IntelligenceArrays | null>;
}

export function emptyTierB2Maps(): TierB2IntelligenceMaps {
  return {
    institutionalLearningInsights: new Map(),
  };
}

function isTierB2MapPayload(
  payload: TierB2IntelligenceMaps | TierB2IntelligenceArrays,
): payload is TierB2IntelligenceMaps {
  return payload.institutionalLearningInsights instanceof Map;
}

/** Normalize repository hydrate output (maps or arrays) into tenant-scoped Tier B2 maps. */
export function tierB2MapsFromPayload(
  organizationId: string,
  payload: TierB2IntelligenceMaps | TierB2IntelligenceArrays,
): TierB2IntelligenceMaps {
  if (isTierB2MapPayload(payload)) {
    return {
      institutionalLearningInsights: mapFromTenantArray(organizationId, [
        ...payload.institutionalLearningInsights.values(),
      ]),
    };
  }

  return {
    institutionalLearningInsights: mapFromTenantArray(
      organizationId,
      payload.institutionalLearningInsights,
    ),
  };
}

function tierB2HasRows(maps: TierB2IntelligenceMaps): boolean {
  return maps.institutionalLearningInsights.size > 0;
}

/**
 * Load Tier B2 intelligence from Prisma repository (fail-soft when tables or loader absent).
 */
export async function loadTierB2IntelligenceFromPrisma(
  organizationId: string,
): Promise<TierB2IntelligenceMaps | null> {
  if (!isPrismaPersistenceEnabled()) return null;

  try {
    const repo =
      (await import("./prisma-repository")) as PrismaTierB2Repository;
    const loader = repo.prismaLoadTierB2Intelligence;
    if (typeof loader !== "function") return null;

    const loaded = await loader(organizationId);
    if (!loaded) return null;

    const maps = tierB2MapsFromPayload(organizationId, loaded);
    return tierB2HasRows(maps) ? maps : null;
  } catch {
    return null;
  }
}

/**
 * Load Tier B2 intelligence from the org file snapshot (fallback authority until Prisma B2 migrate).
 * Safe when file is missing — returns null.
 */
export async function loadTierB2IntelligenceOverlay(
  organizationId: string,
): Promise<TierB2IntelligenceMaps | null> {
  const snapshot = await loadSalesOrgSnapshot(organizationId);
  if (!snapshot) return null;

  const maps = tierB2MapsFromPayload(organizationId, {
    institutionalLearningInsights: snapshot.institutionalLearningInsights,
  });

  return tierB2HasRows(maps) ? maps : null;
}

/** Merge Tier B2 maps into a target without dropping existing rows (overlay wins on id). */
export function mergeTierB2IntelligenceIntoStore(
  target: TierB2IntelligenceMaps,
  overlay: TierB2IntelligenceMaps,
): void {
  for (const [id, row] of overlay.institutionalLearningInsights) {
    target.institutionalLearningInsights.set(id, row);
  }
}

/**
 * Hydrate Tier B2 maps after Tier B1: repository base + file overlay parity.
 */
export async function hydrateTierB2IntelligenceMaps(
  organizationId: string,
  target: TierB2IntelligenceMaps,
): Promise<void> {
  const fromPrisma = await loadTierB2IntelligenceFromPrisma(organizationId);
  if (fromPrisma) mergeTierB2IntelligenceIntoStore(target, fromPrisma);

  const fromFile = await loadTierB2IntelligenceOverlay(organizationId);
  if (fromFile) mergeTierB2IntelligenceIntoStore(target, fromFile);
}
