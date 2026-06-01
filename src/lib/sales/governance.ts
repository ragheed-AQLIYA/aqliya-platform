import { randomUUID } from "crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import { SALES_EVIDENCE_TARGETS } from "./evidence-links";
import type { SalesActor, SalesOrgScope } from "./services";

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

/** Stages that require evidence or an audited operator override before entry. */
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
      id: typeof row.id === "string" ? row.id : randomUUID(),
      decision,
      actorId: row.actorId,
      actorName: typeof row.actorName === "string" ? row.actorName : null,
      reason: row.reason.trim(),
      createdAt:
        typeof row.createdAt === "string"
          ? row.createdAt
          : new Date().toISOString(),
      stageSlug:
        typeof row.stageSlug === "string" ? row.stageSlug : row.stageSlug ?? null,
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

export function canGovernanceOverride(actorRole: UserRole | undefined): boolean {
  return actorRole === "OPERATOR" || actorRole === "ADMIN";
}

export async function countDealEvidenceLinks(
  organizationId: string,
  dealId: string,
): Promise<number> {
  return prisma.salesEvidenceLink.count({
    where: {
      organizationId,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: dealId,
    },
  });
}

export interface AssertStageChangeGovernanceInput {
  dealId: string;
  toStageSlug: string;
  evidenceLinkCount: number;
  governanceOverrideReason?: string | null;
  actorRole?: UserRole;
}

/**
 * Blocks governed stage entry without linked evidence or OPERATOR+ override reason.
 */
export function assertStageChangeGovernance(
  input: AssertStageChangeGovernanceInput,
): { usedOverride: boolean; overrideReason: string | null } {
  if (!requiresApprovalForStageChange(input.toStageSlug)) {
    return { usedOverride: false, overrideReason: null };
  }

  if (input.evidenceLinkCount > 0) {
    return { usedOverride: false, overrideReason: null };
  }

  const overrideReason = input.governanceOverrideReason?.trim() || null;
  if (overrideReason && canGovernanceOverride(input.actorRole)) {
    return { usedOverride: true, overrideReason };
  }

  throw new Error(
    "SalesOS governance: moving to proposal/pilot/won requires at least one linked evidence on the deal, or an explicit override reason from OPERATOR or ADMIN (audited as sales.governance.override)",
  );
}

export async function recordReviewDecision(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    decision: ReviewDecision;
    actor: SalesActor;
    reason: string;
    stageSlug?: string | null;
  },
): Promise<ReviewDecisionRecord> {
  const reason = params.reason.trim();
  if (!reason) {
    throw new Error("SalesOS validation: review decision reason is required");
  }

  const deal = await prisma.salesDeal.findFirst({
    where: { id: params.dealId, organizationId: scope.organizationId },
    select: { id: true, title: true, metadata: true, stage: { select: { slug: true } } },
  });

  if (!deal) {
    throw new Error("SalesOS: deal not found");
  }

  const existingMetadata =
    deal.metadata && typeof deal.metadata === "object"
      ? (deal.metadata as Record<string, unknown>)
      : {};

  const record: ReviewDecisionRecord = {
    id: randomUUID(),
    decision: params.decision,
    actorId: params.actor.id,
    actorName: params.actor.name ?? null,
    reason,
    createdAt: new Date().toISOString(),
    stageSlug:
      params.stageSlug ?? deal.stage?.slug ?? null,
  };

  await prisma.salesDeal.update({
    where: { id: deal.id },
    data: {
      metadata: appendReviewDecisionMetadata(
        existingMetadata,
        record,
      ) as object,
      updatedById: params.actor.id,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: params.actor.id,
    actorName: params.actor.name,
    action: SalesAuditActions.GOVERNANCE_REVIEW_DECISION,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: {
      decision: record.decision,
      reason: record.reason,
      stageSlug: record.stageSlug,
      reviewDecisionId: record.id,
    },
  });

  return record;
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
