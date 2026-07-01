/**
 * Phase 8 — Pattern Aggregator.
 *
 * Analyzes TBMappingFeedback + TBMappingPattern + TBClassificationHistory
 * to find repeated cross-org mapping patterns.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { normaliseAccountText } from "../synonyms";
import type { AggregatedPattern, AggregationInput } from "./types";

const DEFAULT_MIN_SUPPORT = 2;
const DEFAULT_MIN_ORGS = 1;
const DEFAULT_MIN_CONFIDENCE = 0.6;

function tokenisePhrase(name: string): string {
  return normaliseAccountText(name);
}

function buildPhraseKey(phrase: string, canonicalCode: string): string {
  return `${tokenisePhrase(phrase)}::${canonicalCode}`;
}

/**
 * Aggregate patterns from feedback records.
 * Finds account names that were consistently confirmed to the same canonical code.
 */
async function aggregateFromFeedback(
  input: AggregationInput,
): Promise<Map<string, AggregatedPattern>> {
  const where: Record<string, unknown> = {
    wasAccepted: true,
    acceptedCanonicalId: { not: null },
  };
  if (input.organizationId) {
    where.organizationId = input.organizationId;
  }

  const feedbacks = await prisma.tBMappingFeedback.findMany({
    where,
    select: {
      id: true,
      organizationId: true,
      clientAccountCode: true,
      acceptedCanonicalId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  if (feedbacks.length === 0) return new Map();

  // Resolve canonical codes in batch
  const canonicalIds = [...new Set(feedbacks.map((f) => f.acceptedCanonicalId))];
  const canonicals = await prisma.auditCanonicalAccount.findMany({
    where: { id: { in: canonicalIds } },
    select: { id: true, code: true, category: true },
  });
  const canonicalMap = new Map(canonicals.map((c) => [c.id, c]));

  // Group by clientAccountCode + canonicalCode
  const codeGroups = new Map<string, Array<typeof feedbacks[0]>>();
  for (const fb of feedbacks) {
    const canonical = canonicalMap.get(fb.acceptedCanonicalId);
    if (!canonical) continue;
    const key = `${fb.clientAccountCode}::${canonical.code}`;
    if (!codeGroups.has(key)) codeGroups.set(key, []);
    codeGroups.get(key)!.push(fb);
  }

  // Build patterns for groups with sufficient support
  const patterns = new Map<string, AggregatedPattern>();
  for (const [, group] of codeGroups) {
    if (group.length < (input.minSupportCount ?? DEFAULT_MIN_SUPPORT)) continue;

    const canonical = canonicalMap.get(group[0]!.acceptedCanonicalId)!;
    const orgs = new Set(group.map((g) => g.organizationId));
    if (orgs.size < (input.minOrganizationCount ?? DEFAULT_MIN_ORGS)) continue;

    const confidence = Math.min(0.99, 0.6 + (group.length - 1) * 0.03);
    if (confidence < (input.minConfidence ?? DEFAULT_MIN_CONFIDENCE)) continue;

    const phrase = `account:${group[0]!.clientAccountCode}`;
    const key = buildPhraseKey(phrase, canonical.code);
    if (patterns.has(key)) continue;

    patterns.set(key, {
      phrase,
      canonicalCode: canonical.code,
      category: canonical.category,
      supportCount: group.length,
      organizationCount: orgs.size,
      aggregateConfidence: confidence,
      evidenceSample: group.slice(0, 10).map((g) => ({
        evidenceType: "feedback",
        evidenceId: g.id,
        organizationId: g.organizationId,
        accountCode: g.clientAccountCode,
        accountName: null,
      })),
    });
  }

  return patterns;
}

/**
 * Aggregate patterns from firm memory patterns.
 * Finds account name → canonical mappings that appear across multiple orgs.
 */
async function aggregateFromPatterns(
  input: AggregationInput,
): Promise<Map<string, AggregatedPattern>> {
  const where: Record<string, unknown> = {
    status: { not: "DEPRECATED" },
    clientAccountName: { not: null },
  };
  if (input.organizationId) {
    where.organizationId = input.organizationId;
  }

  const patterns = await prisma.tBMappingPattern.findMany({
    where,
    select: {
      id: true,
      organizationId: true,
      clientAccountCode: true,
      clientAccountName: true,
      canonicalAccountId: true,
      hitCount: true,
      lastConfidence: true,
    },
    orderBy: { hitCount: "desc" },
    take: 5000,
  });

  if (patterns.length === 0) return new Map();

  const canonicalIds = [...new Set(patterns.map((p) => p.canonicalAccountId))];
  const canonicals = await prisma.auditCanonicalAccount.findMany({
    where: { id: { in: canonicalIds } },
    select: { id: true, code: true, category: true },
  });
  const canonicalMap = new Map(canonicals.map((c) => [c.id, c]));

  // Group by name fingerprint + canonical code
  const phraseGroups = new Map<string, Array<typeof patterns[0]>>();
  for (const p of patterns) {
    const canonical = canonicalMap.get(p.canonicalAccountId);
    if (!canonical) continue;
    const fingerprint = tokenisePhrase(p.clientAccountName ?? "");
    if (!fingerprint) continue;
    const key = buildPhraseKey(fingerprint, canonical.code);
    if (!phraseGroups.has(key)) phraseGroups.set(key, []);
    phraseGroups.get(key)!.push(p);
  }

  const result = new Map<string, AggregatedPattern>();
  for (const [key, group] of phraseGroups) {
    if (group.length < (input.minSupportCount ?? DEFAULT_MIN_SUPPORT)) continue;

    const canonical = canonicalMap.get(group[0]!.canonicalAccountId)!;
    const orgs = new Set(group.map((g) => g.organizationId));
    if (orgs.size < (input.minOrganizationCount ?? DEFAULT_MIN_ORGS)) continue;

    const avgConfidence =
      group.reduce((sum, p) => sum + (p.lastConfidence ?? 0.75), 0) / group.length;
    if (avgConfidence < (input.minConfidence ?? DEFAULT_MIN_CONFIDENCE)) continue;

    // Extract the common phrase from the first pattern's name
    const phrase = group[0]!.clientAccountName!;

    result.set(key, {
      phrase,
      canonicalCode: canonical.code,
      category: canonical.category,
      supportCount: group.length,
      organizationCount: orgs.size,
      aggregateConfidence: parseFloat(avgConfidence.toFixed(4)),
      evidenceSample: group.slice(0, 10).map((p) => ({
        evidenceType: "pattern",
        evidenceId: p.id,
        organizationId: p.organizationId,
        accountCode: p.clientAccountCode,
        accountName: p.clientAccountName,
      })),
    });
  }

  return result;
}

/**
 * Aggregate patterns from classification history.
 * Finds account names that were classified to the same canonical code repeatedly.
 */
async function aggregateFromHistory(
  input: AggregationInput,
): Promise<Map<string, AggregatedPattern>> {
  const where: Record<string, unknown> = {
    source: { not: "none" },
    canonicalCode: { not: null },
    accountName: { not: null },
  };
  if (input.organizationId) {
    where.organizationId = input.organizationId;
  }

  const history = await prisma.tBClassificationHistory.findMany({
    where,
    select: {
      id: true,
      organizationId: true,
      accountCode: true,
      accountName: true,
      canonicalCode: true,
      resultCategory: true,
      confidence: true,
      source: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const phraseGroups = new Map<string, Array<typeof history[0]>>();
  for (const h of history) {
    const fingerprint = tokenisePhrase(h.accountName ?? "");
    if (!fingerprint) continue;
    const key = buildPhraseKey(fingerprint, h.canonicalCode!);
    if (!phraseGroups.has(key)) phraseGroups.set(key, []);
    phraseGroups.get(key)!.push(h);
  }

  const result = new Map<string, AggregatedPattern>();
  for (const [key, group] of phraseGroups) {
    if (group.length < (input.minSupportCount ?? DEFAULT_MIN_SUPPORT)) continue;

    // Deduplicate by (orgId + accountCode) for uniqueness
    const uniqueKeys = new Set(group.map((h) => `${h.organizationId}:${h.accountCode}`));
    if (uniqueKeys.size < (input.minOrganizationCount ?? DEFAULT_MIN_ORGS)) continue;

    const avgConfidence =
      group.reduce((sum, h) => sum + h.confidence, 0) / group.length;
    if (avgConfidence < (input.minConfidence ?? DEFAULT_MIN_CONFIDENCE)) continue;

    const phrase = group[0]!.accountName!;
    const canonicalCode = group[0]!.canonicalCode!;
    const category = group[0]!.resultCategory;

    result.set(key, {
      phrase,
      canonicalCode,
      category,
      supportCount: group.length,
      organizationCount: uniqueKeys.size,
      aggregateConfidence: parseFloat(avgConfidence.toFixed(4)),
      evidenceSample: group.slice(0, 10).map((h) => ({
        evidenceType: "history",
        evidenceId: h.id,
        organizationId: h.organizationId,
        accountCode: h.accountCode,
        accountName: h.accountName,
      })),
    });
  }

  return result;
}

/**
 * Run full pattern aggregation across all sources.
 * Returns deduplicated aggregated patterns sorted by support count descending.
 */
export async function aggregatePatterns(
  input: AggregationInput = {},
): Promise<AggregatedPattern[]> {
  const [fromFeedback, fromPatterns, fromHistory] = await Promise.all([
    aggregateFromFeedback(input),
    aggregateFromPatterns(input),
    aggregateFromHistory(input),
  ]);

  // Merge all patterns, keeping the highest confidence variant
  const merged = new Map<string, AggregatedPattern>();
  const merge = (map: Map<string, AggregatedPattern>) => {
    for (const [key, pattern] of map) {
      const existing = merged.get(key);
      if (!existing || pattern.aggregateConfidence > existing.aggregateConfidence) {
        merged.set(key, pattern);
      } else if (existing) {
        // Merge evidence samples
        existing.evidenceSample = [
          ...existing.evidenceSample,
          ...pattern.evidenceSample,
        ].slice(0, 10);
        existing.supportCount = Math.max(existing.supportCount, pattern.supportCount);
        existing.organizationCount = Math.max(
          existing.organizationCount,
          pattern.organizationCount,
        );
      }
    }
  };

  merge(fromFeedback);
  merge(fromPatterns);
  merge(fromHistory);

  return [...merged.values()].sort(
    (a, b) => b.supportCount - a.supportCount || b.aggregateConfidence - a.aggregateConfidence,
  );
}
