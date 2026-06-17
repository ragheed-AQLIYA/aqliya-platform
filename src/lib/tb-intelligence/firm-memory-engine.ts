/**
 * Phase 3C/3D — Firm Memory Engine with governance (Phase 3D).
 */

import { prisma } from "@/lib/prisma";
import type { TBMappingPatternStatus } from "@prisma/client";
import { normaliseAccountText } from "./synonyms";
import type { ClassificationResult } from "./types";
import { confidenceFromHitCount } from "./firm-memory";
import {
  evaluateMemoryGovernance,
  mergeReviewerIds,
  resolveGovernanceStatusForWrite,
  type MemoryGovernanceSnapshot,
} from "./firm-memory-governance";

/** Minimum confidence for high-confidence auto-suggest (requires TRUSTED status). */
export const FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE = 0.85;

export type FirmMemoryMatchTier =
  | "gl_code"
  | "gl_code_and_name"
  | "erp_context";

export type FirmMemoryLookupInput = {
  organizationId: string;
  accountCode: string;
  accountName: string;
  classificationHints?: string[];
};

export type FirmMemoryRecordInput = {
  organizationId: string;
  engagementId?: string;
  clientAccountCode: string;
  clientAccountName: string;
  acceptedCanonicalId: string;
  classificationHints?: string[];
  reviewerId: string;
  suggestedCanonicalId?: string | null;
  wasAccepted?: boolean;
  auditClientId?: string | null;
  erpChartKey?: string | null;
};

export function buildNameFingerprint(accountName: string): string {
  return normaliseAccountText(accountName);
}

export function pickErpMapLabels(hints?: string[]): {
  map1: string | null;
  map2: string | null;
} {
  if (!hints?.length) return { map1: null, map2: null };
  return {
    map1: hints[0]?.trim() || null,
    map2: hints[1]?.trim() || null,
  };
}

export function isFirmMemoryAutoSuggestEligible(
  result: ClassificationResult,
): boolean {
  return (
    result.source === "firm_memory" &&
    result.memoryGovernance?.trustedForAutoSuggest === true &&
    result.confidence >= FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE
  );
}

type PatternRow = {
  id: string;
  hitCount: number;
  canonicalAccountId: string;
  nameFingerprint: string | null;
  erpMap1Label?: string | null;
  erpMap2Label?: string | null;
  status: TBMappingPatternStatus;
  confirmedReviewerIds: unknown;
  lastConfirmedAt: Date | null;
  lastUsedAt: Date;
  deprecatedAt: Date | null;
};

function governanceFromPattern(pattern: PatternRow): MemoryGovernanceSnapshot {
  return evaluateMemoryGovernance({
    status: pattern.status,
    hitCount: pattern.hitCount,
    confirmedReviewerIds: pattern.confirmedReviewerIds,
    lastConfirmedAt: pattern.lastConfirmedAt,
    lastUsedAt: pattern.lastUsedAt,
    deprecatedAt: pattern.deprecatedAt,
  });
}

function toClassificationResult(
  pattern: PatternRow,
  canonical: {
    id: string;
    code: string;
    name: string;
    category: string;
  },
  tier: FirmMemoryMatchTier,
  detail: string,
  governance: MemoryGovernanceSnapshot,
  hintMaps?: { map1: string | null; map2: string | null },
): ClassificationResult {
  const confidence = confidenceFromHitCount(pattern.hitCount);
  return {
    canonicalAccountId: canonical.id,
    canonicalCode: canonical.code,
    canonicalName: canonical.name,
    category: canonical.category,
    confidence,
    source: "firm_memory",
    evidence: `Firm memory [${tier}] [${governance.status}]: ${detail} (${pattern.hitCount} confirmations, ${governance.reviewerCount} reviewers)`,
    sourceDetail: { tier },
    evidenceDetail: {
      erpMap1: pattern.erpMap1Label ?? hintMaps?.map1 ?? undefined,
      erpMap2: pattern.erpMap2Label ?? hintMaps?.map2 ?? undefined,
      matchedPatternId: pattern.id,
      matchedBy: tier,
      detail,
    },
    memoryGovernance: {
      status: governance.status,
      trustedForAutoSuggest: governance.trustedForAutoSuggest,
      hitCount: pattern.hitCount,
      reviewerCount: governance.reviewerCount,
      lastUsedAt: pattern.lastUsedAt?.toISOString() ?? new Date(0).toISOString(),
      lastConfirmedAt: pattern.lastConfirmedAt?.toISOString(),
    },
  };
}

async function resolveEngagementContext(engagementId?: string): Promise<{
  auditClientId: string | null;
  erpChartKey: string | null;
}> {
  if (!engagementId) return { auditClientId: null, erpChartKey: null };
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { clientId: true, fiscalPeriod: true },
  });
  if (!engagement) return { auditClientId: null, erpChartKey: null };
  return {
    auditClientId: engagement.clientId,
    erpChartKey: `client-${engagement.clientId}`,
  };
}

/**
 * V2 — Lookup governed audit knowledge. Skips DEPRECATED patterns.
 */
export async function lookupAuditFirmMemory(
  input: FirmMemoryLookupInput,
): Promise<ClassificationResult | null> {
  const { map1, map2 } = pickErpMapLabels(input.classificationHints);
  const fingerprint = buildNameFingerprint(input.accountName);

  const tryPattern = async (
    pattern: PatternRow | null,
    tier: FirmMemoryMatchTier,
    detail: string,
  ): Promise<ClassificationResult | null> => {
    if (!pattern) return null;
    const governance = governanceFromPattern(pattern);
    if (governance.status === "DEPRECATED") return null;

    const canonical = await prisma.auditCanonicalAccount.findUnique({
      where: { id: pattern.canonicalAccountId },
    });
    if (!canonical) return null;

    await prisma.tBMappingPattern.update({
      where: { id: pattern.id },
      data: { lastUsedAt: new Date() },
    });

    return toClassificationResult(pattern, canonical, tier, detail, governance, {
      map1,
      map2,
    });
  };

  const byCode = await prisma.tBMappingPattern.findUnique({
    where: {
      organizationId_clientAccountCode: {
        organizationId: input.organizationId,
        clientAccountCode: input.accountCode,
      },
    },
  });

  if (byCode) {
    const nameMatches =
      !byCode.nameFingerprint ||
      byCode.nameFingerprint === fingerprint ||
      fingerprint.includes(byCode.nameFingerprint) ||
      byCode.nameFingerprint.includes(fingerprint);
    const tier: FirmMemoryMatchTier = nameMatches
      ? "gl_code"
      : "gl_code_and_name";
    const result = await tryPattern(
      byCode,
      tier,
      `GL ${input.accountCode}${nameMatches ? "" : " (name drift tolerated)"}`,
    );
    if (result) return result;
  }

  if (fingerprint && (map1 || map2)) {
    const byContext = await prisma.tBMappingPattern.findFirst({
      where: {
        organizationId: input.organizationId,
        nameFingerprint: fingerprint,
        status: { not: "DEPRECATED" },
        ...(map1 ? { erpMap1Label: map1 } : {}),
        ...(map2 ? { erpMap2Label: map2 } : {}),
      },
      orderBy: { hitCount: "desc" },
    });
    if (byContext) {
      return tryPattern(
        byContext,
        "erp_context",
        `name+Map1/Map2 (${map1 ?? "—"} / ${map2 ?? "—"})`,
      );
    }
  }

  return null;
}

/**
 * V1 — Persist human-confirmed mapping with Phase 3D governance fields.
 */
export async function recordAuditFirmMemoryFromConfirmation(
  params: FirmMemoryRecordInput,
): Promise<void> {
  const { map1, map2 } = pickErpMapLabels(params.classificationHints);
  const fingerprint = buildNameFingerprint(params.clientAccountName);
  const wasAccepted = params.wasAccepted !== false;
  const now = new Date();

  const engagementCtx = params.auditClientId
    ? {
        auditClientId: params.auditClientId,
        erpChartKey: params.erpChartKey ?? null,
      }
    : await resolveEngagementContext(params.engagementId);

  await prisma.tBMappingFeedback.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId,
      clientAccountCode: params.clientAccountCode,
      erpMap1Label: map1,
      erpMap2Label: map2,
      suggestedCanonicalId: params.suggestedCanonicalId,
      acceptedCanonicalId: params.acceptedCanonicalId,
      wasAccepted,
      reviewerId: params.reviewerId,
    },
  });

  if (!wasAccepted) return;

  const existing = await prisma.tBMappingPattern.findUnique({
    where: {
      organizationId_clientAccountCode: {
        organizationId: params.organizationId,
        clientAccountCode: params.clientAccountCode,
      },
    },
  });

  const newHitCount = (existing?.hitCount ?? 0) + 1;
  const confirmedReviewerIds = mergeReviewerIds(
    existing?.confirmedReviewerIds,
    params.reviewerId,
  );
  const confidence = confidenceFromHitCount(newHitCount);
  const governanceInput = {
    status: existing?.status ?? "CONFIRMED",
    hitCount: newHitCount,
    confirmedReviewerIds,
    lastConfirmedAt: now,
    lastUsedAt: now,
    deprecatedAt: existing?.deprecatedAt ?? null,
  };
  const status = resolveGovernanceStatusForWrite(governanceInput, now);

  await prisma.tBMappingPattern.upsert({
    where: {
      organizationId_clientAccountCode: {
        organizationId: params.organizationId,
        clientAccountCode: params.clientAccountCode,
      },
    },
    create: {
      organizationId: params.organizationId,
      clientAccountCode: params.clientAccountCode,
      clientAccountName: params.clientAccountName,
      nameFingerprint: fingerprint,
      erpMap1Label: map1,
      erpMap2Label: map2,
      canonicalAccountId: params.acceptedCanonicalId,
      hitCount: 1,
      lastConfidence: confidence,
      lastConfirmedById: params.reviewerId,
      lastConfirmedAt: now,
      lastEngagementId: params.engagementId,
      confirmedReviewerIds,
      status: resolveGovernanceStatusForWrite(
        { ...governanceInput, hitCount: 1 },
        now,
      ),
      auditClientId: engagementCtx.auditClientId,
      erpChartKey: engagementCtx.erpChartKey,
      memoryVersion: 1,
    },
    update: {
      clientAccountName: params.clientAccountName,
      nameFingerprint: fingerprint,
      erpMap1Label: map1 ?? existing?.erpMap1Label,
      erpMap2Label: map2 ?? existing?.erpMap2Label,
      canonicalAccountId: params.acceptedCanonicalId,
      hitCount: newHitCount,
      lastConfidence: confidence,
      lastConfirmedById: params.reviewerId,
      lastConfirmedAt: now,
      lastEngagementId: params.engagementId,
      lastUsedAt: now,
      confirmedReviewerIds,
      status,
      auditClientId: engagementCtx.auditClientId ?? existing?.auditClientId,
      erpChartKey: engagementCtx.erpChartKey ?? existing?.erpChartKey,
      memoryVersion: (existing?.memoryVersion ?? 1) + 1,
      deprecatedAt: null,
      deprecatedReason: null,
    },
  });
}

export async function deprecateFirmMemoryPattern(params: {
  organizationId: string;
  clientAccountCode: string;
  reason: string;
}): Promise<void> {
  await prisma.tBMappingPattern.updateMany({
    where: {
      organizationId: params.organizationId,
      clientAccountCode: params.clientAccountCode,
    },
    data: {
      status: "DEPRECATED",
      deprecatedAt: new Date(),
      deprecatedReason: params.reason,
    },
  });
}

export async function getClassificationHintsForAccount(
  engagementId: string,
  accountCode: string,
): Promise<string[]> {
  const row = await prisma.tBClassificationHistory.findFirst({
    where: { engagementId, accountCode },
    orderBy: { createdAt: "desc" },
    select: { mappingHints: true },
  });
  if (!Array.isArray(row?.mappingHints)) return [];
  return row.mappingHints
    .map((h) => (typeof h === "string" ? h.trim() : ""))
    .filter(Boolean);
}

export async function backfillFirmMemoryFromConfirmedMappings(params: {
  organizationId: string;
  engagementId: string;
  reviewerId: string;
  rows: Array<{
    accountCode: string;
    accountName: string;
    canonicalAccountId: string;
    classificationHints?: string[];
  }>;
}): Promise<{ written: number }> {
  const engagementCtx = await resolveEngagementContext(params.engagementId);
  let written = 0;
  for (const row of params.rows) {
    const { map1, map2 } = pickErpMapLabels(row.classificationHints);
    const fingerprint = buildNameFingerprint(row.accountName);
    const now = new Date();
    const hitCount = 1;
    const confirmedReviewerIds = [params.reviewerId];
    const status = resolveGovernanceStatusForWrite({
      status: "CONFIRMED",
      hitCount,
      confirmedReviewerIds,
      lastConfirmedAt: now,
      lastUsedAt: now,
      deprecatedAt: null,
    });

    await prisma.tBMappingPattern.upsert({
      where: {
        organizationId_clientAccountCode: {
          organizationId: params.organizationId,
          clientAccountCode: row.accountCode,
        },
      },
      create: {
        organizationId: params.organizationId,
        clientAccountCode: row.accountCode,
        clientAccountName: row.accountName,
        nameFingerprint: fingerprint,
        erpMap1Label: map1,
        erpMap2Label: map2,
        canonicalAccountId: row.canonicalAccountId,
        hitCount,
        lastConfidence: confidenceFromHitCount(hitCount),
        lastConfirmedById: params.reviewerId,
        lastConfirmedAt: now,
        lastEngagementId: params.engagementId,
        confirmedReviewerIds,
        status,
        auditClientId: engagementCtx.auditClientId,
        erpChartKey: engagementCtx.erpChartKey,
      },
      update: {
        clientAccountName: row.accountName,
        nameFingerprint: fingerprint,
        erpMap1Label: map1,
        erpMap2Label: map2,
        canonicalAccountId: row.canonicalAccountId,
        lastConfirmedById: params.reviewerId,
        lastConfirmedAt: now,
        lastEngagementId: params.engagementId,
        auditClientId: engagementCtx.auditClientId,
        erpChartKey: engagementCtx.erpChartKey,
      },
    });
    written++;
  }
  return { written };
}
