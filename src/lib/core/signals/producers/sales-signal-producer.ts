// ─── SalesOS signal producer (in-memory store + optional prisma) ───

import {
  ensureSalesSeed,
  listAccounts,
  listAuditEntries,
  listOpportunities,
} from "@/lib/sales/store";
import type { ProductMetricSignals, RuntimeSignal } from "@/lib/core/signals/types";

export async function collectSalesActivitySignals(
  organizationId: string,
  ownerId = "system",
  limit = 50,
): Promise<RuntimeSignal[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const entries = listAuditEntries(organizationId).slice(0, limit);

  return entries.map((e) => ({
    id: e.id,
    organizationId,
    productSlug: "sales" as const,
    kind: "activity" as const,
    action: e.action,
    resourceType: e.targetType,
    resourceId: e.targetId,
    timestamp: e.timestamp,
    actorId: e.actorId,
    summaryAr: `مبيعات: ${e.action}`,
    summaryEn: `Sales: ${e.action}`,
    metadata: e.metadata,
  }));
}

export async function collectSalesTaskSignals(
  organizationId: string,
  ownerId = "system",
): Promise<RuntimeSignal[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const opportunities = listOpportunities(organizationId);

  return opportunities
    .filter(
      (o) =>
        o.reviewStatus === "Draft" ||
        o.reviewStatus === "InReview" ||
        o.stage === "Qualification",
    )
    .map((o) => ({
      id: `opp-${o.id}`,
      organizationId,
      productSlug: "sales" as const,
      kind: "task" as const,
      action: `opportunity.${o.stage}`,
      resourceType: "SalesOpportunity",
      resourceId: o.id,
      timestamp: o.updatedAt ?? o.createdAt ?? new Date().toISOString(),
      summaryAr: `فرصة: ${o.name}`,
      summaryEn: `Opportunity: ${o.name}`,
      metadata: {
        stage: o.stage,
        reviewStatus: o.reviewStatus,
        ownerId: o.ownerId,
      },
      severity: o.reviewStatus === "InReview" ? "warning" : "info",
    }));
}

export async function collectSalesReviewSignals(
  organizationId: string,
  ownerId = "system",
): Promise<RuntimeSignal[]> {
  await ensureSalesSeed(organizationId, ownerId);
  return listOpportunities(organizationId)
    .filter((o) => o.reviewStatus === "InReview" || o.reviewStatus === "Draft")
    .map((o) => ({
      id: `sales-review-${o.id}`,
      organizationId,
      productSlug: "sales" as const,
      kind: "review" as const,
      action: "review.pending",
      resourceType: "SalesOpportunity",
      resourceId: o.id,
      timestamp: o.updatedAt ?? o.createdAt ?? new Date().toISOString(),
      summaryAr: `مراجعة تجارية: ${o.name}`,
      summaryEn: `Commercial review: ${o.name}`,
      metadata: { reviewStatus: o.reviewStatus },
      severity: "warning" as const,
    }));
}

export async function collectSalesApprovalSignals(
  organizationId: string,
  ownerId = "system",
): Promise<RuntimeSignal[]> {
  await ensureSalesSeed(organizationId, ownerId);
  return listOpportunities(organizationId)
    .filter(
      (o) =>
        o.approvalStatus === "PendingApproval" ||
        o.approvalStatus === "AwaitingSignoff",
    )
    .map((o) => ({
      id: `sales-approval-${o.id}`,
      organizationId,
      productSlug: "sales" as const,
      kind: "approval" as const,
      action: "approval.pending",
      resourceType: "SalesOpportunity",
      resourceId: o.id,
      timestamp: o.updatedAt ?? o.createdAt ?? new Date().toISOString(),
      summaryAr: `اعتماد تجاري: ${o.name}`,
      summaryEn: `Commercial approval: ${o.name}`,
      severity: "warning" as const,
    }));
}

export async function collectSalesMetricSignals(
  organizationId: string,
  ownerId = "system",
): Promise<ProductMetricSignals> {
  await ensureSalesSeed(organizationId, ownerId);
  const opportunities = listOpportunities(organizationId);
  const accounts = listAccounts(organizationId);

  const pendingReviews = opportunities.filter(
    (o) => o.reviewStatus === "InReview" || o.reviewStatus === "Draft",
  ).length;
  const pendingApprovals = opportunities.filter(
    (o) =>
      o.approvalStatus === "PendingApproval" ||
      o.approvalStatus === "AwaitingSignoff",
  ).length;

  return {
    productSlug: "sales",
    organizationId,
    signals: [],
    generatedAt: new Date().toISOString(),
    pendingReviews,
    pendingApprovals,
    evidenceAlerts: opportunities.filter((o) => o.stage === "Qualification")
      .length,
  };
}

/** Pilot stubs — extended signal kinds ship in platform signals v0.2 */
export const collectSalesAccountSignals = collectSalesActivitySignals;
export const collectSalesOpportunitySignals = collectSalesTaskSignals;
export const collectSalesEvidenceSignals = collectSalesReviewSignals;
export const collectSalesProofSignals = collectSalesApprovalSignals;
export const collectSalesOutputSignals = collectSalesActivitySignals;
export async function collectSalesCommercialIntelligenceSignals(
  _organizationId: string,
  _ownerId = "system",
): Promise<RuntimeSignal[]> {
  return [];
}

