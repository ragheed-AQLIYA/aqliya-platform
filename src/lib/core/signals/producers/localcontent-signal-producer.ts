// @ts-nocheck
import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProductMetricSignals, RuntimeSignal } from "@/lib/core/signals/types";

const REVIEW_PROJECT_STATUSES = new Set(["InReview", "EvidenceReview"]);
const APPROVAL_PROJECT_STATUSES = new Set(["ReportReady"]);
const OPEN_PROJECT_STATUSES = new Set([
  "Draft",
  "DataCollection",
  "ClassificationInProgress",
  "EvidenceReview",
  "FindingsDrafted",
  "InReview",
  "Returned",
]);

export async function collectLocalContentActivitySignals(
  organizationId: string,
  limit = 50,
): Promise<RuntimeSignal[]> {
  const events = await prisma.localContentAuditEvent.findMany({
    where: { project: { organizationId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      projectId: true,
      actorId: true,
      actorName: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    organizationId,
    productSlug: "local_content" as const,
    kind: "activity" as const,
    action: e.action,
    resourceType: e.entityType,
    resourceId: e.entityId,
    timestamp: e.createdAt.toISOString(),
    actorId: e.actorId,
    actorName: e.actorName ?? undefined,
    summaryAr: `محتوى محلي: ${e.action}`,
    summaryEn: `Local content: ${e.action}`,
    metadata: { projectId: e.projectId },
  }));
}

export async function collectLocalContentTaskSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const projects = await prisma.localContentProject.findMany({
    where: {
      organizationId,
      status: { in: [...OPEN_PROJECT_STATUSES] },
    },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
      createdById: true,
    },
  });

  return projects.map((p) => ({
    id: `proj-${p.id}`,
    organizationId,
    productSlug: "local_content" as const,
    kind: "task" as const,
    action: `project.${p.status}`,
    resourceType: "LocalContentProject",
    resourceId: p.id,
    timestamp: p.updatedAt.toISOString(),
    summaryAr: `مشروع محتوى محلي: ${p.name}`,
    summaryEn: `LC project: ${p.name}`,
    metadata: { status: p.status, ownerId: p.createdById },
    severity: p.status === "InReview" ? "warning" : "info",
  }));
}

export async function collectLocalContentReviewSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const [projects, pendingReviews] = await Promise.all([
    prisma.localContentProject.findMany({
      where: {
        organizationId,
        status: { in: [...REVIEW_PROJECT_STATUSES] },
      },
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.localContentReview.findMany({
      where: {
        status: { in: ["pending", "in_review"] },
        project: { organizationId },
      },
      select: {
        id: true,
        projectId: true,
        reviewerId: true,
        status: true,
        createdAt: true,
      },
      take: 30,
    }),
  ]);

  const fromProjects = projects.map((p) => ({
    id: `lc-review-proj-${p.id}`,
    organizationId,
    productSlug: "local_content" as const,
    kind: "review" as const,
    action: "review.pending",
    resourceType: "LocalContentProject",
    resourceId: p.id,
    timestamp: p.updatedAt.toISOString(),
    summaryAr: `مراجعة مشروع: ${p.name}`,
    summaryEn: `Project review: ${p.name}`,
    severity: "warning" as const,
  }));

  const fromReviews = pendingReviews.map((r) => ({
    id: `lc-review-${r.id}`,
    organizationId,
    productSlug: "local_content" as const,
    kind: "review" as const,
    action: "review.record.pending",
    resourceType: "LocalContentReview",
    resourceId: r.id,
    timestamp: r.createdAt.toISOString(),
    summaryAr: "سجل مراجعة معلق",
    summaryEn: "Pending review record",
    metadata: { projectId: r.projectId, reviewerId: r.reviewerId },
    severity: "info" as const,
  }));

  return [...fromProjects, ...fromReviews];
}

export async function collectLocalContentApprovalSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const projects = await prisma.localContentProject.findMany({
    where: {
      organizationId,
      status: { in: [...APPROVAL_PROJECT_STATUSES] },
    },
    select: { id: true, name: true, updatedAt: true },
  });

  return projects.map((p) => ({
    id: `lc-approval-${p.id}`,
    organizationId,
    productSlug: "local_content" as const,
    kind: "approval" as const,
    action: "approval.pending",
    resourceType: "LocalContentProject",
    resourceId: p.id,
    timestamp: p.updatedAt.toISOString(),
    summaryAr: `اعتماد مشروع: ${p.name}`,
    summaryEn: `Project approval: ${p.name}`,
    severity: "warning" as const,
  }));
}

export async function collectLocalContentEvidenceSignals(
  organizationId: string,
): Promise<RuntimeSignal[]> {
  const [missing, rejected, stale] = await Promise.all([
    prisma.localContentEvidence.findMany({
      where: { status: "missing", project: { organizationId } },
      select: {
        id: true,
        filename: true,
        projectId: true,
        updatedAt: true,
      },
      take: 20,
    }),
    prisma.localContentEvidence.findMany({
      where: { status: "rejected", project: { organizationId } },
      select: {
        id: true,
        filename: true,
        projectId: true,
        updatedAt: true,
      },
      take: 20,
    }),
    prisma.localContentEvidence.findMany({
      where: {
        status: { in: ["uploaded", "linked"] },
        project: { organizationId },
        reviewedAt: null,
        createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        filename: true,
        projectId: true,
        createdAt: true,
      },
      take: 20,
    }),
  ]);

  const mapEvidence = (
    items: typeof missing,
    action: string,
    severity: "critical" | "warning" | "info",
    labelAr: string,
    labelEn: string,
  ): RuntimeSignal[] =>
    items.map((e) => ({
      id: `lc-ev-${action}-${e.id}`,
      organizationId,
      productSlug: "local_content" as const,
      kind: "evidence" as const,
      action,
      resourceType: "LocalContentEvidence",
      resourceId: e.id,
      timestamp: ("updatedAt" in e ? e.updatedAt : e.createdAt).toISOString(),
      summaryAr: `${labelAr}: ${e.filename}`,
      summaryEn: `${labelEn}: ${e.filename}`,
      metadata: { projectId: e.projectId },
      severity,
    }));

  return [
    ...mapEvidence(
      missing,
      "evidence.missing",
      "critical",
      "دليل مفقود",
      "Missing evidence",
    ),
    ...mapEvidence(
      rejected,
      "evidence.rejected",
      "warning",
      "دليل مرفوض",
      "Rejected evidence",
    ),
    ...mapEvidence(
      stale,
      "evidence.stale",
      "warning",
      "دليل غير مراجع",
      "Unreviewed evidence",
    ),
  ];
}

export async function collectLocalContentMetricSignals(
  organizationId: string,
): Promise<ProductMetricSignals> {
  const [projects, pendingReviews, pendingApprovals, evidenceAlerts] =
    await Promise.all([
      prisma.localContentProject.count({ where: { organizationId } }),
      prisma.localContentProject.count({
        where: {
          organizationId,
          status: { in: [...REVIEW_PROJECT_STATUSES] },
        },
      }),
      prisma.localContentProject.count({
        where: {
          organizationId,
          status: { in: [...APPROVAL_PROJECT_STATUSES] },
        },
      }),
      prisma.localContentEvidence.count({
        where: {
          project: { organizationId },
          status: { in: ["missing", "rejected", "uploaded", "linked"] },
        },
      }),
    ]);

  return {
    projects,
    pendingReviews,
    pendingApprovals,
    evidenceAlerts,
  };
}

/** Pilot stubs — export/output/publishing/source facets ship in v0.2 */
export const collectLocalContentExportSignals =
  collectLocalContentActivitySignals;
export const collectLocalContentOutputSignals =
  collectLocalContentReviewSignals;
export const collectLocalContentPublishingSignals =
  collectLocalContentApprovalSignals;
export const collectLocalContentSourceSignals =
  collectLocalContentEvidenceSignals;

