/**
 * Phase 8 — Candidate Rule Generator.
 *
 * Transforms aggregated patterns into KnowledgeCandidate records.
 * NEVER touches production rules (synonyms.ts, coa-loader.ts, etc.).
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { normaliseAccountText } from "../synonyms";
import type { AggregatedPattern } from "./types";

const DEFAULT_CANDIDATE_MIN_SUPPORT = 3;
const DEFAULT_CANDIDATE_MIN_ORGS = 2;
const DEFAULT_CANDIDATE_MIN_CONFIDENCE = 0.7;

export type GenerateCandidatesInput = {
  /** Override minimum support threshold for candidate generation. */
  minSupportCount?: number;
  /** Override minimum organization threshold. */
  minOrganizationCount?: number;
  /** Override minimum confidence threshold. */
  minConfidence?: number;
  /** User ID who triggered the pipeline (null for automated runs). */
  createdById?: string | null;
};

export type GenerateCandidatesResult = {
  candidatesCreated: number;
  candidatesSkippedExisting: number;
  totalPatternsProcessed: number;
};

/**
 * Generate knowledge candidates from aggregated patterns.
 * Skips patterns that already have an existing candidate for the same phrase + canonical code.
 */
export async function generateCandidatesFromPatterns(
  patterns: AggregatedPattern[],
  input: GenerateCandidatesInput = {},
): Promise<GenerateCandidatesResult> {
  const minSupport = input.minSupportCount ?? DEFAULT_CANDIDATE_MIN_SUPPORT;
  const minOrgs = input.minOrganizationCount ?? DEFAULT_CANDIDATE_MIN_ORGS;
  const minConfidence = input.minConfidence ?? DEFAULT_CANDIDATE_MIN_CONFIDENCE;

  // Filter to qualifying patterns
  const qualifying = patterns.filter(
    (p) =>
      p.supportCount >= minSupport &&
      p.organizationCount >= minOrgs &&
      p.aggregateConfidence >= minConfidence,
  );

  // Resolve canonical account IDs from codes
  const codes = [...new Set(qualifying.map((p) => p.canonicalCode))];
    // Bounded by in(codes) — codes derived from qualifying patterns, naturally limited
    const canonicals = await prisma.auditCanonicalAccount.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true },
    take: 100,
  });
  const codeToId = new Map(canonicals.map((c) => [c.code, c.id]));

  // Check for existing candidates to avoid duplicates
  const existingPhrases = new Set<string>();
  if (qualifying.length > 0) {
    // Bounded by in(codes) + status filter — existing candidates for current pattern set
    const existing = await prisma.knowledgeCandidate.findMany({
      where: {
        canonicalCode: { in: codes },
        status: { not: "REJECTED" },
      },
      select: { candidatePhrase: true, canonicalCode: true },
      take: 100,
    });
    for (const e of existing) {
      existingPhrases.add(
        `${normaliseAccountText(e.candidatePhrase)}::${e.canonicalCode}`,
      );
    }
  }

  let created = 0;
  let skipped = 0;

  for (const pattern of qualifying) {
    const canonicalId = codeToId.get(pattern.canonicalCode);
    if (!canonicalId) continue;

    const phraseKey = `${normaliseAccountText(pattern.phrase)}::${pattern.canonicalCode}`;
    if (existingPhrases.has(phraseKey)) {
      skipped++;
      continue;
    }

    // Create candidate
    const candidate = await prisma.knowledgeCandidate.create({
      data: {
        organizationId: null, // Cross-org institutional knowledge
        candidatePhrase: pattern.phrase,
        canonicalAccountId: canonicalId,
        canonicalCode: pattern.canonicalCode,
        category: pattern.category,
        supportCount: pattern.supportCount,
        organizationCount: pattern.organizationCount,
        confidence: pattern.aggregateConfidence,
        status: "CANDIDATE",
        source: "pattern_mining",
        createdById: input.createdById ?? null,
      },
    });

    // Create evidence records
    if (pattern.evidenceSample.length > 0) {
      await prisma.knowledgeCandidateEvidence.createMany({
        data: pattern.evidenceSample.map((ev) => ({
          candidateId: candidate.id,
          evidenceType: ev.evidenceType,
          evidenceId: ev.evidenceId,
          organizationId: ev.organizationId,
          accountCode: ev.accountCode,
          accountName: ev.accountName,
        })),
      });
    }

    created++;
    existingPhrases.add(phraseKey);
  }

  return {
    candidatesCreated: created,
    candidatesSkippedExisting: skipped,
    totalPatternsProcessed: patterns.length,
  };
}

/**
 * Runs the full mining pipeline: aggregate → generate candidates.
 * One-shot convenience for scheduled jobs.
 */
export async function runFullMiningPipeline(
  aggregationInput?: GenerateCandidatesInput,
): Promise<GenerateCandidatesResult & { patternsFound: number }> {
  const { aggregatePatterns } = await import("./pattern-aggregator");
  const patterns = await aggregatePatterns({
    minSupportCount: aggregationInput?.minSupportCount ?? 2,
    minOrganizationCount: aggregationInput?.minOrganizationCount ?? 1,
    minConfidence: aggregationInput?.minConfidence ?? 0.6,
  });

  const result = await generateCandidatesFromPatterns(patterns, {
    ...aggregationInput,
    createdById: aggregationInput?.createdById ?? null,
  });
  return { ...result, patternsFound: patterns.length };
}
