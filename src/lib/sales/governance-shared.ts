/** Client-safe governance helpers (no prisma). */

export type ReviewDecision = "approved" | "rejected" | "pending";

export interface ReviewDecisionRecord {
  id: string;
  decision: ReviewDecision;
  actorId: string;
  actorName?: string | null;
  reason: string;
  createdAt: string;
  stageSlug?: string | null;
}

const GOVERNED_SLUG_MARKERS = ["proposal", "pilot", "won"] as const;

export function normalizeStageSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function requiresApprovalForStageChange(
  stageSlug: string | null | undefined,
): boolean {
  if (!stageSlug) return false;
  const normalized = normalizeStageSlug(stageSlug);
  return GOVERNED_SLUG_MARKERS.some((marker) => normalized.includes(marker));
}

export function readReviewDecisions(metadata: unknown): ReviewDecisionRecord[] {
  if (!metadata || typeof metadata !== "object") return [];
  const raw = (metadata as Record<string, unknown>).reviewDecisions;
  if (!Array.isArray(raw)) return [];
  const decisions: ReviewDecisionRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const decision = row.decision;
    if (
      decision !== "approved" &&
      decision !== "rejected" &&
      decision !== "pending"
    ) {
      continue;
    }
    if (typeof row.actorId !== "string" || typeof row.reason !== "string") {
      continue;
    }
    decisions.push({
      id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
      decision,
      actorId: row.actorId,
      actorName: typeof row.actorName === "string" ? row.actorName : null,
      reason: row.reason.trim(),
      createdAt:
        typeof row.createdAt === "string"
          ? row.createdAt
          : new Date().toISOString(),
      stageSlug:
        typeof row.stageSlug === "string" ? row.stageSlug : null,
    });
  }
  return decisions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function appendReviewDecisionMetadata(
  existing: Record<string, unknown>,
  record: ReviewDecisionRecord,
): Record<string, unknown> {
  const prior = readReviewDecisions(existing);
  return {
    ...existing,
    reviewDecisions: [...prior, record],
  };
}

export function latestReviewDecision(
  metadata: unknown,
): ReviewDecisionRecord | null {
  const decisions = readReviewDecisions(metadata);
  return decisions[0] ?? null;
}

export function dealNeedsGovernanceAttention(input: {
  stageSlug: string | null | undefined;
  evidenceLinkCount: number;
  metadata: unknown;
}): boolean {
  if (!requiresApprovalForStageChange(input.stageSlug)) return false;
  if (input.evidenceLinkCount > 0) return false;
  const latest = latestReviewDecision(input.metadata);
  return latest?.decision !== "approved";
}
