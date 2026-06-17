/**
 * Phase 3D — Governed Firm Memory.
 *
 * Trusted memory requires:
 *   hitCount >= 5
 *   confirmed by >= 2 distinct reviewers
 *   lastUsed or lastConfirmed within 12 months
 *
 * Only TRUSTED patterns qualify for high-confidence auto-suggest.
 */

import type { TBMappingPatternStatus } from "@prisma/client";

export const MEMORY_TRUST_MIN_HIT_COUNT = 5;
export const MEMORY_TRUST_MIN_REVIEWERS = 2;
export const MEMORY_TRUST_MAX_AGE_MONTHS = 12;

export type MemoryGovernanceSnapshot = {
  status: TBMappingPatternStatus;
  hitCount: number;
  reviewerCount: number;
  lastConfirmedAt: Date | null;
  lastUsedAt: Date;
  trustedForAutoSuggest: boolean;
  trustReasons: string[];
  blockReasons: string[];
};

export type MemoryPatternGovernanceInput = {
  status: TBMappingPatternStatus;
  hitCount: number;
  confirmedReviewerIds: unknown;
  lastConfirmedAt: Date | null;
  lastUsedAt: Date;
  deprecatedAt?: Date | null;
};

export function parseReviewerIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((id) => String(id).trim()).filter(Boolean))];
}

export function mergeReviewerIds(existing: unknown, reviewerId: string): string[] {
  const ids = parseReviewerIds(existing);
  if (!reviewerId.trim()) return ids;
  if (!ids.includes(reviewerId)) ids.push(reviewerId);
  return ids;
}

function monthsSince(date: Date, now = new Date()): number {
  const ms = now.getTime() - date.getTime();
  return ms / (1000 * 60 * 60 * 24 * 30.4375);
}

function isWithinTrustWindow(
  lastConfirmedAt: Date | null,
  lastUsedAt: Date | null,
  now = new Date(),
): boolean {
  const anchor = lastConfirmedAt ?? lastUsedAt ?? now;
  return monthsSince(anchor, now) < MEMORY_TRUST_MAX_AGE_MONTHS;
}

/**
 * Pure evaluation — compute effective status and trust eligibility.
 */
export function evaluateMemoryGovernance(
  pattern: MemoryPatternGovernanceInput,
  now = new Date(),
): MemoryGovernanceSnapshot {
  const reviewerIds = parseReviewerIds(pattern.confirmedReviewerIds);
  const trustReasons: string[] = [];
  const blockReasons: string[] = [];

  if (pattern.status === "DEPRECATED" || pattern.deprecatedAt) {
    return {
      status: "DEPRECATED",
      hitCount: pattern.hitCount,
      reviewerCount: reviewerIds.length,
      lastConfirmedAt: pattern.lastConfirmedAt,
      lastUsedAt: pattern.lastUsedAt,
      trustedForAutoSuggest: false,
      trustReasons: [],
      blockReasons: ["Pattern is deprecated"],
    };
  }

  if (pattern.hitCount >= MEMORY_TRUST_MIN_HIT_COUNT) {
    trustReasons.push(`hitCount ${pattern.hitCount} ≥ ${MEMORY_TRUST_MIN_HIT_COUNT}`);
  } else {
    blockReasons.push(
      `hitCount ${pattern.hitCount} < ${MEMORY_TRUST_MIN_HIT_COUNT}`,
    );
  }

  if (reviewerIds.length >= MEMORY_TRUST_MIN_REVIEWERS) {
    trustReasons.push(
      `${reviewerIds.length} reviewers ≥ ${MEMORY_TRUST_MIN_REVIEWERS}`,
    );
  } else {
    blockReasons.push(
      `${reviewerIds.length} reviewer(s) < ${MEMORY_TRUST_MIN_REVIEWERS}`,
    );
  }

  if (isWithinTrustWindow(pattern.lastConfirmedAt, pattern.lastUsedAt, now)) {
    trustReasons.push(`active within ${MEMORY_TRUST_MAX_AGE_MONTHS} months`);
  } else {
    blockReasons.push(`stale (> ${MEMORY_TRUST_MAX_AGE_MONTHS} months since confirm/use)`);
  }

  const meetsTrustCriteria =
    pattern.hitCount >= MEMORY_TRUST_MIN_HIT_COUNT &&
    reviewerIds.length >= MEMORY_TRUST_MIN_REVIEWERS &&
    isWithinTrustWindow(pattern.lastConfirmedAt, pattern.lastUsedAt, now);

  let status: TBMappingPatternStatus = pattern.status;
  if (pattern.hitCount <= 0) {
    status = "DRAFT";
  } else if (meetsTrustCriteria) {
    status = "TRUSTED";
  } else if (pattern.hitCount >= 1) {
    status = "CONFIRMED";
  }

  return {
    status,
    hitCount: pattern.hitCount,
    reviewerCount: reviewerIds.length,
    lastConfirmedAt: pattern.lastConfirmedAt,
    lastUsedAt: pattern.lastUsedAt,
    trustedForAutoSuggest: status === "TRUSTED",
    trustReasons,
    blockReasons,
  };
}

export function resolveGovernanceStatusForWrite(
  pattern: MemoryPatternGovernanceInput,
  now = new Date(),
): TBMappingPatternStatus {
  return evaluateMemoryGovernance(pattern, now).status;
}
