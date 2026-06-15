/**
 * Explainable mapping classification — Trust + Evidence (not confidence-first).
 */

import type { ClassificationSource, ClassificationResult } from "./types";
import type { AccountMapping } from "@/types/audit";
import { evaluateMemoryGovernance } from "./firm-memory-governance";

export type MappingSourceType =
  | "firm_memory"
  | "erp_rule"
  | "local_ai"
  | "human";

export type MappingTrustStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "TRUSTED"
  | "DEPRECATED";

export interface MappingClassificationExplanation {
  suggestedCanonicalCode?: string;
  source: {
    type: MappingSourceType;
    tier?: string;
  };
  memoryGovernance?: {
    status: MappingTrustStatus;
    hitCount: number;
    reviewerCount: number;
    lastUsedAt?: string;
    lastConfirmedAt?: string;
    trusted: boolean;
  };
  evidence?: {
    erpMap1?: string;
    erpMap2?: string;
    matchedPatternId?: string;
    matchedBy?: string;
    detail?: string;
  };
  /** True only when memory governance status is TRUSTED (not confidence-based). */
  autoSuggestEligible: boolean;
}

export function mapClassificationSourceToUiType(
  source: ClassificationSource | undefined,
  mappingType?: AccountMapping["mappingType"],
): MappingSourceType | null {
  if (mappingType === "human_mapped") return "human";
  switch (source) {
    case "firm_memory":
      return "firm_memory";
    case "rule":
    case "pattern":
      return "erp_rule";
    case "local":
    case "cloud":
      return "local_ai";
    default:
      return null;
  }
}

export function pickErpHints(hints?: unknown): {
  erpMap1?: string;
  erpMap2?: string;
} {
  if (!Array.isArray(hints)) return {};
  const strings = hints
    .filter((h) => typeof h === "string")
    .map((h) => String(h).trim())
    .filter(Boolean);
  return {
    erpMap1: strings[0],
    erpMap2: strings[1],
  };
}

export function buildExplanationFromResult(
  result: ClassificationResult,
  hints?: string[],
): MappingClassificationExplanation {
  const erpHints = pickErpHints(hints);
  const sourceType =
    result.source === "firm_memory"
      ? "firm_memory"
      : result.source === "rule" || result.source === "pattern"
        ? "erp_rule"
        : result.source === "local" || result.source === "cloud"
          ? "local_ai"
          : "erp_rule";

  const tier = result.sourceDetail?.tier;
  const trusted = result.memoryGovernance?.status === "TRUSTED";

  return {
    suggestedCanonicalCode: result.canonicalCode,
    source: { type: sourceType, tier },
    memoryGovernance: result.memoryGovernance
      ? {
          status: result.memoryGovernance.status,
          hitCount: result.memoryGovernance.hitCount,
          reviewerCount: result.memoryGovernance.reviewerCount,
          lastUsedAt: result.memoryGovernance.lastUsedAt,
          lastConfirmedAt: result.memoryGovernance.lastConfirmedAt,
          trusted,
        }
      : undefined,
    evidence: {
      erpMap1: result.evidenceDetail?.erpMap1 ?? erpHints.erpMap1,
      erpMap2: result.evidenceDetail?.erpMap2 ?? erpHints.erpMap2,
      matchedPatternId: result.evidenceDetail?.matchedPatternId,
      matchedBy: result.evidenceDetail?.matchedBy ?? tier,
      detail: result.evidenceDetail?.detail ?? result.evidence,
    },
    autoSuggestEligible: trusted,
  };
}

export function parseStoredExplanation(
  raw: unknown,
): MappingClassificationExplanation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as MappingClassificationExplanation;
  if (!o.source?.type) return null;
  return o;
}

type PatternGovernanceRow = {
  id: string;
  clientAccountCode: string;
  hitCount: number;
  erpMap1Label: string | null;
  erpMap2Label: string | null;
  status: string;
  confirmedReviewerIds: unknown;
  lastConfirmedAt: Date | null;
  lastUsedAt: Date;
  deprecatedAt: Date | null;
};

export function buildExplanationFromPatternFallback(
  pattern: PatternGovernanceRow,
  canonicalCode?: string,
  tier = "gl_code",
): MappingClassificationExplanation {
  const governance = evaluateMemoryGovernance({
    status: pattern.status as "DRAFT" | "CONFIRMED" | "TRUSTED" | "DEPRECATED",
    hitCount: pattern.hitCount,
    confirmedReviewerIds: pattern.confirmedReviewerIds,
    lastConfirmedAt: pattern.lastConfirmedAt,
    lastUsedAt: pattern.lastUsedAt,
    deprecatedAt: pattern.deprecatedAt,
  });
  const trusted = governance.status === "TRUSTED";

  return {
    suggestedCanonicalCode: canonicalCode,
    source: { type: "firm_memory", tier },
    memoryGovernance: {
      status: governance.status,
      hitCount: pattern.hitCount,
      reviewerCount: governance.reviewerCount,
      lastUsedAt: pattern.lastUsedAt.toISOString(),
      lastConfirmedAt: pattern.lastConfirmedAt?.toISOString(),
      trusted,
    },
    evidence: {
      erpMap1: pattern.erpMap1Label ?? undefined,
      erpMap2: pattern.erpMap2Label ?? undefined,
      matchedPatternId: pattern.id,
      matchedBy: tier,
    },
    autoSuggestEligible: trusted,
  };
}

export function buildHumanExplanation(
  canonicalCode?: string,
): MappingClassificationExplanation {
  return {
    suggestedCanonicalCode: canonicalCode,
    source: { type: "human" },
    autoSuggestEligible: false,
  };
}

type HistoryRow = {
  accountCode: string;
  canonicalCode: string | null;
  source: string;
  mappingHints: unknown;
  classificationDetail: unknown;
};

export function buildExplanationFromHistoryRow(
  row: HistoryRow,
  pattern?: PatternGovernanceRow | null,
  mappingType?: AccountMapping["mappingType"],
): MappingClassificationExplanation | null {
  const stored = parseStoredExplanation(row.classificationDetail);
  if (stored) {
    if (stored.memoryGovernance && pattern) {
      const fromPattern = buildExplanationFromPatternFallback(
        pattern,
        stored.suggestedCanonicalCode ?? row.canonicalCode ?? undefined,
        stored.source.tier,
      );
      return {
        ...stored,
        suggestedCanonicalCode:
          stored.suggestedCanonicalCode ?? row.canonicalCode ?? undefined,
        memoryGovernance: fromPattern.memoryGovernance,
        evidence: {
          ...stored.evidence,
          matchedPatternId:
            stored.evidence?.matchedPatternId ?? pattern.id,
          erpMap1: stored.evidence?.erpMap1 ?? pattern.erpMap1Label ?? undefined,
          erpMap2: stored.evidence?.erpMap2 ?? pattern.erpMap2Label ?? undefined,
        },
        autoSuggestEligible: fromPattern.autoSuggestEligible,
      };
    }
    return {
      ...stored,
      suggestedCanonicalCode:
        stored.suggestedCanonicalCode ?? row.canonicalCode ?? undefined,
    };
  }

  const uiType = mapClassificationSourceToUiType(
    row.source as ClassificationSource,
    mappingType,
  );
  if (!uiType) return null;

  if (uiType === "firm_memory" && pattern) {
    return buildExplanationFromPatternFallback(
      pattern,
      row.canonicalCode ?? undefined,
    );
  }

  const erpHints = pickErpHints(row.mappingHints);
  return {
    suggestedCanonicalCode: row.canonicalCode ?? undefined,
    source: {
      type: uiType,
      tier:
        uiType === "erp_rule"
          ? row.source === "pattern"
            ? "pattern"
            : "rule"
          : uiType === "local_ai"
            ? row.source
            : undefined,
    },
    evidence: {
      erpMap1: erpHints.erpMap1,
      erpMap2: erpHints.erpMap2,
      matchedBy:
        uiType === "erp_rule"
          ? row.source === "pattern"
            ? "pattern"
            : "rule"
          : row.source,
    },
    autoSuggestEligible: false,
  };
}

export async function getMappingClassificationExplanations(
  engagementId: string,
  mappings: Pick<
    AccountMapping,
    "sourceAccountCode" | "canonicalAccountCode" | "mappingType"
  >[],
): Promise<Record<string, MappingClassificationExplanation>> {
  const { prisma } = await import("@/lib/prisma");
  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "./org-resolver"
  );

  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(engagementId);
  const accountCodes = mappings.map((m) => m.sourceAccountCode);

  const historyRows = await prisma.tBClassificationHistory.findMany({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
    select: {
      accountCode: true,
      canonicalCode: true,
      source: true,
      mappingHints: true,
      classificationDetail: true,
    },
  });

  const latestHistory = new Map<string, HistoryRow>();
  for (const row of historyRows) {
    if (!latestHistory.has(row.accountCode)) {
      latestHistory.set(row.accountCode, row);
    }
  }

  const patternsByCode = new Map<string, PatternGovernanceRow>();
  if (orgId && accountCodes.length > 0) {
    const patterns = await prisma.tBMappingPattern.findMany({
      where: {
        organizationId: orgId,
        clientAccountCode: { in: accountCodes },
      },
      select: {
        id: true,
        clientAccountCode: true,
        hitCount: true,
        erpMap1Label: true,
        erpMap2Label: true,
        status: true,
        confirmedReviewerIds: true,
        lastConfirmedAt: true,
        lastUsedAt: true,
        deprecatedAt: true,
      },
    });
    for (const p of patterns) {
      patternsByCode.set(p.clientAccountCode, p);
    }
  }

  const out: Record<string, MappingClassificationExplanation> = {};

  for (const mapping of mappings) {
    const code = mapping.sourceAccountCode;
    const history = latestHistory.get(code);
    const pattern = patternsByCode.get(code) ?? null;

    if (mapping.mappingType === "human_mapped" && !history) {
      out[code] = buildHumanExplanation(mapping.canonicalAccountCode);
      continue;
    }

    if (history) {
      const explanation = buildExplanationFromHistoryRow(
        history,
        pattern,
        mapping.mappingType,
      );
      if (explanation) {
        out[code] = explanation;
        continue;
      }
    }

    if (pattern) {
      out[code] = buildExplanationFromPatternFallback(
        pattern,
        mapping.canonicalAccountCode,
      );
    } else if (mapping.mappingType === "human_mapped") {
      out[code] = buildHumanExplanation(mapping.canonicalAccountCode);
    }
  }

  return out;
}
