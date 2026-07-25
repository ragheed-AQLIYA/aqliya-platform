"use server";

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError, getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { buildTimeline } from "@/lib/decision/decision-timeline";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { getDecisionAuditLogs } from "@/lib/decision/decision-audit";
import {
  type ExportData,
  buildApprovedSnapshot,
  getHasImmutableSnapshot,
  buildDiffSummary,
  buildWarnings,
} from "./common";

const logger = createLogger({ product: "platform", action: "decision-export" });

export async function getDecisionExportData(
  decisionId: string,
  requestedFormat: "json" | "markdown" = "json",
): Promise<{ success: boolean; data?: ExportData; error?: string }> {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

    const [decision, evidenceCount, auditLogs] = await Promise.all([
      prisma.decision.findUnique({
        where: { id: decisionId },
        include: {
          owner: true,
          organization: true,
          recommendation: true,
          approvals: {
            include: { approver: true, recommendation: true },
            orderBy: { createdAt: "asc" },
          },
          // [MIGRATED] auditLogs include → separate PlatformAuditLog query (productKey: "decision_os")
          // auditLogs: {
          //   include: { user: true },
          //   orderBy: { createdAt: "asc" },
          // },
          objectives: true,
          constraints: true,
          alternatives: true,
          risks: true,
          framework: true,
          decisionScenarios: true,
          riskAnalyses: true,
        },
      }),
      prisma.decisionEvidence.count({
        where: { decisionId },
      }),
      getDecisionAuditLogs(decisionId, { orderBy: "asc" }),
    ]);

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const hasImmutableSnapshot = getHasImmutableSnapshot(decision.approvals);
    const latestApproval = decision.approvals[decision.approvals.length - 1];
    const recommendation = decision.recommendation;

    const approvedSnapshot = buildApprovedSnapshot(
      decision.approvals,
      recommendation,
    );
    const diffSummary = buildDiffSummary(
      latestApproval,
      recommendation,
      hasImmutableSnapshot,
    );

    const timeline = buildTimeline({
      decisionCreatedAt: decision.createdAt,
      decisionUpdatedAt: decision.updatedAt ?? undefined,
      recommendationCreatedAt: recommendation?.createdAt,
      recommendationUpdatedAt: recommendation?.updatedAt,
      recommendationPublishedAt:
        recommendation?.publishedAt ?? undefined,
      approvals: decision.approvals.map((a) => ({
        status: a.status,
        createdAt: a.createdAt,
        approverName: a.approver?.name ?? undefined,
        comments: a.comments ?? undefined,
        conditions: a.snapshotConditions ?? undefined,
        snapshotCreatedAt: a.snapshotCreatedAt ?? undefined,
        overrideReason: a.snapshotOverrideReason ?? undefined,
      })),
      auditLogs: auditLogs.map((l) => ({
        action: l.action,
        createdAt: l.createdAt,
        userName: l.user?.name ?? undefined,
        after: l.after ?? undefined,
      })),
    });

    const warnings = buildWarnings(
      approvedSnapshot,
      decision.status,
      evidenceCount,
      recommendation,
    );

    const snapshotSource = approvedSnapshot?.isImmutable
      ? "approved_immutable_snapshot"
      : approvedSnapshot
        ? "legacy_approval_relation"
        : "none";

    const exportData: ExportData = {
      metadata: {
        id: decision.id,
        title: decision.title,
        type: decision.type,
        status: decision.status,
        priority: decision.priority,
        description: decision.description,
        targetDate: decision.targetDate,
        createdAt: decision.createdAt,
        updatedAt: decision.updatedAt,
        owner: decision.owner?.name || null,
        organization: decision.organization?.name || null,
      },
      recommendation: recommendation
        ? {
            id: recommendation.id,
            recommendedAction: recommendation.recommendedAction,
            rationale: recommendation.rationale,
            expectedNextState: recommendation.expectedNextState,
            scopeExclusions: recommendation.scopeExclusions,
            assumptionsUsed: recommendation.assumptionsUsed,
            risksAccepted: recommendation.risksAccepted,
            risksRejected: recommendation.risksRejected,
            publishedVersion: recommendation.publishedVersion,
            publishedAt: recommendation.publishedAt,
            isClientVisible: recommendation.isClientVisible,
            publishedFromSnapshot: recommendation.publishedFromSnapshot,
            humanReviewRequired: recommendation.humanReviewRequired,
            updatedAt: recommendation.updatedAt,
          }
        : null,
      approvedSnapshot,
      approvalHistory: decision.approvals.map((a) => ({
        status: a.status,
        approver: a.approver?.name || null,
        comments: a.comments,
        conditions: a.snapshotConditions,
        createdAt: a.createdAt,
        recommendationId: a.recommendationId,
      })),
      diffSummary,
      timeline: timeline.map((e) => ({
        type: e.type,
        label: e.label,
        date: e.date,
        actor: e.actor,
        details: e.details,
        isCritical: e.isCritical,
        category: e.category,
      })),
      exportMetadata: {
        exportedAt: new Date(),
        exportedBy: user.name,
        requestedFormat,
        snapshotSource,
        evidenceCount,
        warnings,
      },
    };

    try {
      const alog = auditLogger({
        productKey: Product.DECISION_OS,
        sourceSystem: "decision_export",
        organization: {
          platformOrganizationId: user.platformOrganizationId,
        },
        actor: {
          id: user.id,
          type: "user",
          name: user.name || user.email,
        },
      });
      await alog.record(
        "DECISION_EXPORT_PREPARED",
        {
          type: "decision_export",
          id: decision.id,
          label: decision.title,
        },
        {
          severity: "info",
          status: "recorded",
          sourceModel: "Decision",
          sourceId: decision.id,
          metadata: {
            requestedFormat,
            snapshotSource,
            evidenceCount,
            warningsCount: warnings.length,
            status: decision.status,
          },
        },
      );
    } catch {
      // Export preparation should not fail if platform audit recording fails.
    }

    return { success: true, data: exportData };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error fetching export data:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch export data" };
  }
}
