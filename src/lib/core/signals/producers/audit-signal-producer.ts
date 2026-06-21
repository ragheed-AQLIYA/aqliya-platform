import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProductMetricSignals, RuntimeSignal } from "@/lib/core/signals/types";

const REVIEW_STATUSES = new Set(["under_review", "awaiting_client"]);
const APPROVAL_STATUSES = new Set(["ready_for_approval"]);
const OPEN_ENGAGEMENT_STATUSES = new Set([
  "draft",
  "setup",
  "in_progress",
  "under_review",
  "awaiting_client",
  "ready_for_approval",
]);

export async function collectAuditActivitySignals(
  organizationId: string,
  limit = 50,
): Promise<RuntimeSignal[]> {
  const events = await prisma.auditEvent.findMany({
    where: { engagement: { organizationId } },
    orderBy: { timestamp: "desc" },
    take: limit,
    select: {
      id: true,
      eventType: true,
      actorId: true,
      actorName: true,
      targetType: true,
      targetId: true,
      description: true,
      timestamp: true,
      engagementId: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    organizationId,
    productSlug: "audit" as const,
    kind: "activity" as const,
    action: e.eventType,
    resourceType: e.targetType,
    resourceId: e.targetId,
    timestamp: e.timestamp.toISOString(),
    actorId: e.actorId,
    actorName: e.actorName,
    summaryAr: e.description || `تدقيق: ${e.eventType}`,
    summaryEn: e.description || `Audit: ${e.eventType}`,
    metadata: { engagementId: e.engagementId },
  }));
}

export async function collectAuditTaskSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const engagements = await prisma.auditEngagement.findMany({
    where: {
      organizationId,
      status: { in: [...OPEN_ENGAGEMENT_STATUSES] },
    },
    select: {
      id: true,
      status: true,
      fiscalPeriod: true,
      client: { select: { name: true } },
      updatedAt: true,
    },
  });

  return engagements.map((e) => ({
    id: `eng-${e.id}`,
    organizationId,
    productSlug: "audit" as const,
    kind: "task" as const,
    action: `engagement.${e.status}`,
    resourceType: "AuditEngagement",
    resourceId: e.id,
    timestamp: e.updatedAt.toISOString(),
    summaryAr: `مهمة مراجعة: ${e.client.name} — ${e.fiscalPeriod}`,
    summaryEn: `Engagement: ${e.client.name} — ${e.fiscalPeriod}`,
    metadata: { status: e.status },
    severity:
      e.status === "ready_for_approval"
        ? "warning"
        : e.status === "under_review"
          ? "warning"
          : "info",
  }));
}

export async function collectAuditReviewSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const [engagements, openComments] = await Promise.all([
    prisma.auditEngagement.findMany({
      where: { organizationId, status: { in: [...REVIEW_STATUSES] } },
      select: {
        id: true,
        fiscalPeriod: true,
        status: true,
        updatedAt: true,
        client: { select: { name: true } },
      },
    }),
    prisma.auditReviewComment.findMany({
      where: {
        status: "open",
        engagement: { organizationId },
      },
      select: {
        id: true,
        engagementId: true,
        targetType: true,
        targetId: true,
        createdAt: true,
      },
      take: 30,
    }),
  ]);

  const fromEngagements = engagements.map((e) => ({
    id: `review-eng-${e.id}`,
    organizationId,
    productSlug: "audit" as const,
    kind: "review" as const,
    action: "review.pending",
    resourceType: "AuditEngagement",
    resourceId: e.id,
    timestamp: e.updatedAt.toISOString(),
    summaryAr: `مراجعة معلقة: ${e.client.name}`,
    summaryEn: `Pending review: ${e.client.name}`,
    severity: "warning" as const,
  }));

  const fromComments = openComments.map((c) => ({
    id: `review-comment-${c.id}`,
    organizationId,
    productSlug: "audit" as const,
    kind: "review" as const,
    action: "review.comment.open",
    resourceType: c.targetType,
    resourceId: c.targetId,
    timestamp: c.createdAt.toISOString(),
    summaryAr: "تعليق مراجعة مفتوح",
    summaryEn: "Open review comment",
    metadata: { engagementId: c.engagementId },
    severity: "info" as const,
  }));

  return [...fromEngagements, ...fromComments];
}

export async function collectAuditApprovalSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const engagements = await prisma.auditEngagement.findMany({
    where: { organizationId, status: { in: [...APPROVAL_STATUSES] } },
    select: {
      id: true,
      fiscalPeriod: true,
      updatedAt: true,
      client: { select: { name: true } },
    },
  });

  return engagements.map((e) => ({
    id: `approval-eng-${e.id}`,
    organizationId,
    productSlug: "audit" as const,
    kind: "approval" as const,
    action: "approval.pending",
    resourceType: "AuditEngagement",
    resourceId: e.id,
    timestamp: e.updatedAt.toISOString(),
    summaryAr: `اعتماد معلق: ${e.client.name}`,
    summaryEn: `Pending approval: ${e.client.name}`,
    severity: "warning" as const,
  }));
}

export async function collectAuditEvidenceSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const [missing, unlinked] = await Promise.all([
    prisma.auditEvidence.findMany({
      where: { state: "missing", engagement: { organizationId } },
      select: {
        id: true,
        filename: true,
        engagementId: true,
        updatedAt: true,
      },
      take: 30,
    }),
    prisma.auditEvidence.findMany({
      where: {
        engagement: { organizationId },
        state: { notIn: ["verified", "archived"] },
        links: { none: {} },
      },
      select: {
        id: true,
        filename: true,
        state: true,
        engagementId: true,
        updatedAt: true,
      },
      take: 30,
    }),
  ]);

  const missingSignals = missing.map((e) => ({
    id: `ev-missing-${e.id}`,
    organizationId,
    productSlug: "audit" as const,
    kind: "evidence" as const,
    action: "evidence.missing",
    resourceType: "AuditEvidence",
    resourceId: e.id,
    timestamp: e.updatedAt.toISOString(),
    summaryAr: `دليل مفقود: ${e.filename}`,
    summaryEn: `Missing evidence: ${e.filename}`,
    metadata: { engagementId: e.engagementId },
    severity: "critical" as const,
  }));

  const unlinkedSignals = unlinked
    .filter((e) => e.state !== "missing")
    .map((e) => ({
      id: `ev-unlinked-${e.id}`,
      organizationId,
      productSlug: "audit" as const,
      kind: "evidence" as const,
      action: "evidence.unlinked",
      resourceType: "AuditEvidence",
      resourceId: e.id,
      timestamp: e.updatedAt.toISOString(),
      summaryAr: `دليل غير مرتبط: ${e.filename}`,
      summaryEn: `Unlinked evidence: ${e.filename}`,
      metadata: { engagementId: e.engagementId, state: e.state },
      severity: "warning" as const,
    }));

  return [...missingSignals, ...unlinkedSignals];
}

export async function collectAuditMetricSignals(
  organizationId: string,
): Promise<ProductMetricSignals> {
  const [engagements, pendingReviews, pendingApprovals, evidenceAlerts] =
    await Promise.all([
      prisma.auditEngagement.count({ where: { organizationId } }),
      prisma.auditEngagement.count({
        where: { organizationId, status: { in: [...REVIEW_STATUSES] } },
      }),
      prisma.auditEngagement.count({
        where: { organizationId, status: { in: [...APPROVAL_STATUSES] } },
      }),
      prisma.auditEvidence.count({
        where: {
          engagement: { organizationId },
          OR: [{ state: "missing" }, { state: { notIn: ["verified"] } }],
        },
      }),
    ]);

  return {
    productSlug: "audit",
    organizationId,
    signals: [],
    generatedAt: new Date().toISOString(),
    engagements,
    pendingReviews,
    pendingApprovals,
    evidenceAlerts,
  };
}

/** Pilot stubs — export/finding/output signal facets ship in v0.2 */
export const collectAuditExportSignals = collectAuditActivitySignals;
export const collectAuditFindingSignals = collectAuditEvidenceSignals;
export const collectAuditOutputSignals = collectAuditReviewSignals;

