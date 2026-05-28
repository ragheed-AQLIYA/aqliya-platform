"use server";

import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError, requireDecisionAccess } from "@/lib/auth";
import {
  buildRecommendationDiff,
  getDiffSummary,
} from "@/lib/recommendation/recommendation-diff";
import { buildTimeline } from "@/lib/decision/decision-timeline";
import {
  formatExportJSON,
  formatExportMarkdown,
} from "@/lib/decision/decision-export-formats";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

export { formatExportJSON, formatExportMarkdown };

type ExportData = {
  metadata: {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string | null;
    description: string | null;
    targetDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    owner: string | null;
    organization: string | null;
  };
  recommendation: {
    id: string;
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    publishedVersion: number;
    publishedAt: Date | null;
    isClientVisible: boolean;
    publishedFromSnapshot: boolean;
    humanReviewRequired: boolean;
    updatedAt: Date;
  } | null;
  approvedSnapshot: {
    action: string | null;
    rationale: string | null;
    expectedNextState: string | null;
    scopeExclusions: string | null;
    assumptionsUsed: string | null;
    risksAccepted: string | null;
    risksRejected: string | null;
    conditions: string | null;
    confidence: number | null;
    score: number | null;
    overrideReason: string | null;
    approvedAt: Date | null;
    approver: string | null;
    isImmutable: boolean;
  } | null;
  approvalHistory: {
    status: string;
    approver: string | null;
    comments: string | null;
    conditions: string | null;
    createdAt: Date;
    recommendationId: string | null;
  }[];
  diffSummary: string | null;
  timeline: {
    type: string;
    label: string;
    date: Date;
    actor: string | null;
    details: string | null;
    isCritical: boolean;
    category: string;
  }[];
  exportMetadata: {
    exportedAt: Date;
    exportedBy: string;
    requestedFormat: "json" | "markdown";
    snapshotSource: string;
    evidenceCount: number;
    warnings: string[];
  };
};

export async function getDecisionExportData(
  decisionId: string,
  requestedFormat: "json" | "markdown" = "json",
): Promise<{ success: boolean; data?: ExportData; error?: string }> {
  try {
    const user = await requireDecisionAccess(decisionId, "VIEWER");

    const [decision, evidenceCount] = await Promise.all([
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
          auditLogs: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
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
    ]);

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const latestApproval = decision.approvals[decision.approvals.length - 1];
    const hasImmutableSnapshot = !!(
      latestApproval?.snapshotAction && latestApproval?.snapshotRationale
    );

    let approvedSnapshot: ExportData["approvedSnapshot"] = null;
    if (latestApproval) {
      if (hasImmutableSnapshot) {
        approvedSnapshot = {
          action: latestApproval.snapshotAction,
          rationale: latestApproval.snapshotRationale,
          expectedNextState: latestApproval.snapshotExpectedNextState,
          scopeExclusions: latestApproval.snapshotScopeExclusions,
          assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
          risksAccepted: latestApproval.snapshotRisksAccepted,
          risksRejected: latestApproval.snapshotRisksRejected,
          conditions: latestApproval.snapshotConditions,
          confidence: latestApproval.snapshotConfidence,
          score: latestApproval.snapshotScore,
          overrideReason: latestApproval.snapshotOverrideReason,
          approvedAt:
            latestApproval.snapshotCreatedAt || latestApproval.createdAt,
          approver: latestApproval.approver?.name || null,
          isImmutable: true,
        };
      } else {
        approvedSnapshot = {
          action: latestApproval.recommendation?.recommendedAction || null,
          rationale: latestApproval.recommendation?.rationale || null,
          expectedNextState:
            latestApproval.recommendation?.expectedNextState || null,
          scopeExclusions:
            latestApproval.recommendation?.scopeExclusions || null,
          assumptionsUsed:
            latestApproval.recommendation?.assumptionsUsed || null,
          risksAccepted: latestApproval.recommendation?.risksAccepted || null,
          risksRejected: latestApproval.recommendation?.risksRejected || null,
          conditions: null,
          confidence: null,
          score: null,
          overrideReason: null,
          approvedAt: latestApproval.createdAt,
          approver: latestApproval.approver?.name || null,
          isImmutable: false,
        };
      }
    }

    let diffSummary: string | null = null;
    if (hasImmutableSnapshot && decision.recommendation) {
      const approvedData: Record<string, unknown> = {
        recommendedAction: latestApproval.snapshotAction,
        rationale: latestApproval.snapshotRationale,
        expectedNextState: latestApproval.snapshotExpectedNextState,
        scopeExclusions: latestApproval.snapshotScopeExclusions,
        assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
        risksAccepted: latestApproval.snapshotRisksAccepted,
        risksRejected: latestApproval.snapshotRisksRejected,
        conditions: latestApproval.snapshotConditions,
        confidence: latestApproval.snapshotConfidence,
        score: latestApproval.snapshotScore,
        risks: latestApproval.snapshotRisks,
        nextActions: latestApproval.snapshotNextActions,
      };
      const currentData: Record<string, unknown> = {
        recommendedAction: decision.recommendation.recommendedAction,
        rationale: decision.recommendation.rationale,
        expectedNextState: decision.recommendation.expectedNextState,
        scopeExclusions: decision.recommendation.scopeExclusions,
        assumptionsUsed: decision.recommendation.assumptionsUsed,
        risksAccepted: decision.recommendation.risksAccepted,
        risksRejected: decision.recommendation.risksRejected,
        conditions: null,
        confidence: null,
        score: null,
        risks: null,
        nextActions: null,
      };
      const diff = buildRecommendationDiff(approvedData, currentData);
      diffSummary = getDiffSummary(diff);
    }

    const timeline = buildTimeline({
      decisionCreatedAt: decision.createdAt,
      decisionUpdatedAt: decision.updatedAt ?? undefined,
      recommendationCreatedAt: decision.recommendation?.createdAt,
      recommendationUpdatedAt: decision.recommendation?.updatedAt,
      recommendationPublishedAt:
        decision.recommendation?.publishedAt ?? undefined,
      approvals: decision.approvals.map((a) => ({
        status: a.status,
        createdAt: a.createdAt,
        approverName: a.approver?.name ?? undefined,
        comments: a.comments ?? undefined,
        conditions: a.snapshotConditions ?? undefined,
        snapshotCreatedAt: a.snapshotCreatedAt ?? undefined,
        overrideReason: a.snapshotOverrideReason ?? undefined,
      })),
      auditLogs: decision.auditLogs.map((l) => ({
        action: l.action,
        createdAt: l.createdAt,
        userName: l.user?.name ?? undefined,
        after: l.after ?? undefined,
      })),
    });

    const warnings: string[] = [];
    if (!approvedSnapshot) warnings.push("No approval snapshot exists");
    else if (!approvedSnapshot.isImmutable)
      warnings.push(
        "Legacy approval — content not frozen, may have changed since approval",
      );
    if (decision.status !== "APPROVED")
      warnings.push("Decision is not currently approved");
    if (evidenceCount === 0)
      warnings.push("No supporting evidence attached to this decision");
    if (decision.recommendation?.humanReviewRequired)
      warnings.push(
        "Human review remains required before relying on this export as a final decision record",
      );
    if (approvedSnapshot && decision.recommendation) {
      const differs =
        approvedSnapshot.action !== decision.recommendation.recommendedAction ||
        approvedSnapshot.rationale !== decision.recommendation.rationale;
      if (differs)
        warnings.push("Current recommendation differs from approved snapshot");
    }
    if (
      decision.recommendation?.isClientVisible &&
      !approvedSnapshot?.isImmutable
    ) {
      warnings.push("Published content may not match approved version");
    }

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
      recommendation: decision.recommendation
        ? {
            id: decision.recommendation.id,
            recommendedAction: decision.recommendation.recommendedAction,
            rationale: decision.recommendation.rationale,
            expectedNextState: decision.recommendation.expectedNextState,
            scopeExclusions: decision.recommendation.scopeExclusions,
            assumptionsUsed: decision.recommendation.assumptionsUsed,
            risksAccepted: decision.recommendation.risksAccepted,
            risksRejected: decision.recommendation.risksRejected,
            publishedVersion: decision.recommendation.publishedVersion,
            publishedAt: decision.recommendation.publishedAt,
            isClientVisible: decision.recommendation.isClientVisible,
            publishedFromSnapshot:
              decision.recommendation.publishedFromSnapshot,
            humanReviewRequired: decision.recommendation.humanReviewRequired,
            updatedAt: decision.recommendation.updatedAt,
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
        exportedBy: user.user.name,
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
          platformOrganizationId: user.user.platformOrganizationId,
        },
        actor: {
          id: user.user.id,
          type: "user",
          name: user.user.name || user.user.email,
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
      console.error("Error fetching export data:", error);
    }
    return { success: false, error: "Failed to fetch export data" };
  }
}
