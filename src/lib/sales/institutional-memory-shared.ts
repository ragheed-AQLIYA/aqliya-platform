/** Client-safe institutional memory types + metadata helpers (no prisma). */

import { readAccountIcpScore } from "./icp-types";

export const MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT = 100;

export const INSTITUTIONAL_MEMORY_TYPES = [
  "audit",
  "review_decision",
  "icp_review",
] as const;

export type InstitutionalMemoryType =
  (typeof INSTITUTIONAL_MEMORY_TYPES)[number];

export interface InstitutionalMemoryEntry {
  type: InstitutionalMemoryType;
  summary: string;
  sourceRef: string;
  actorId: string;
  at: string;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseMemoryType(value: unknown): InstitutionalMemoryType | null {
  if (
    typeof value === "string" &&
    INSTITUTIONAL_MEMORY_TYPES.includes(value as InstitutionalMemoryType)
  ) {
    return value as InstitutionalMemoryType;
  }
  return null;
}

export function readInstitutionalMemory(
  metadata: unknown,
): InstitutionalMemoryEntry[] {
  const raw = parseMetadata(metadata).institutionalMemory;
  if (!Array.isArray(raw)) return [];

  const entries: InstitutionalMemoryEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const type = parseMemoryType(row.type);
    const summary =
      typeof row.summary === "string" && row.summary.trim()
        ? row.summary.trim()
        : null;
    const sourceRef =
      typeof row.sourceRef === "string" && row.sourceRef.trim()
        ? row.sourceRef.trim()
        : null;
    const actorId =
      typeof row.actorId === "string" && row.actorId.trim()
        ? row.actorId.trim()
        : null;
    const at =
      typeof row.at === "string" && row.at.trim() ? row.at.trim() : null;

    if (!type || !summary || !sourceRef || !actorId || !at) continue;

    entries.push({ type, summary, sourceRef, actorId, at });
  }

  return entries.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export function appendInstitutionalMemoryMetadata(
  existing: Record<string, unknown>,
  incoming: InstitutionalMemoryEntry[],
): Record<string, unknown> {
  const prior = readInstitutionalMemory(existing);
  const knownRefs = new Set(prior.map((e) => e.sourceRef));
  const merged = [...prior];

  for (const entry of incoming) {
    if (knownRefs.has(entry.sourceRef)) continue;
    knownRefs.add(entry.sourceRef);
    merged.push(entry);
  }

  merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    ...existing,
    institutionalMemory: merged.slice(0, MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT),
  };
}

export function listInstitutionalMemoryFromMetadata(
  metadata: unknown,
): InstitutionalMemoryEntry[] {
  return readInstitutionalMemory(metadata);
}

const TYPE_LABELS_AR: Record<InstitutionalMemoryType, string> = {
  audit: "تدقيق",
  review_decision: "قرار مراجعة",
  icp_review: "مراجعة ICP",
};

export function institutionalMemoryTypeLabelAr(
  type: InstitutionalMemoryType,
): string {
  return TYPE_LABELS_AR[type] ?? type;
}

function icpReviewSummary(score: {
  fitScore: number;
  band: string;
  reviewedAt?: string | null;
}): string {
  return `مراجعة بشرية لملاءمة ICP — النتيجة ${score.fitScore} (${score.band})`;
}

export function buildIcpReviewEntry(
  accountId: string,
  metadata: unknown,
): InstitutionalMemoryEntry | null {
  const assessment = readAccountIcpScore(metadata);
  const score = assessment.score;
  if (!score?.reviewed || !score.reviewedAt) return null;

  const actorId = score.reviewedById?.trim() || "system";
  const at = score.reviewedAt;

  return {
    type: "icp_review",
    summary: icpReviewSummary({
      fitScore: score.fitScore,
      band: score.band,
      reviewedAt: score.reviewedAt,
    }),
    sourceRef: `icp-review:${accountId}:${at}`,
    actorId,
    at,
  };
}
