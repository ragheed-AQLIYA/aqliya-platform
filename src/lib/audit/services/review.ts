/**
 * Audit Services — Review domain
 *
 * Review comments, approvals, publication.
 */

import type {
  ReviewComment,
  ApprovalRecord,
  PublicationPackage,
} from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb, prismaGlobal } from "./common";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "auditos", action: "services-review" });

// ─── Review Comment Reads ───

export async function getReviewComments(
  engagementId: string,
): Promise<ReviewComment[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockReviewComments)
        : Promise.resolve([]),
    (db) => db.getReviewComments(engagementId),
  );
}

export async function getOpenReviewCount(
  engagementId: string,
): Promise<number> {
  return tryDb(
    () =>
      Promise.resolve(
        mock.mockReviewComments.filter((c) => c.status === "open").length,
      ),
    (db) => db.getOpenReviewCount(engagementId),
  );
}

// ─── Approval Reads ───

export async function getApprovalRecords(
  engagementId: string,
): Promise<ApprovalRecord[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockApprovalRecords)
        : Promise.resolve([]),
    (db) => db.getApprovalRecords(engagementId),
  );
}

export async function getApprovalStatus(engagementId: string): Promise<{
  status: string;
  blockingIssues: readonly string[];
  checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  const db = await getDb();
  return db.getApprovalStatus(engagementId);
}

// ─── Publication Reads ───

export async function getPublicationPackage(
  engagementId: string,
): Promise<PublicationPackage | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockPublicationPackage)
        : Promise.resolve(null),
    (db) => db.getPublicationPackage(engagementId),
  );
}

// ─── Review Comment Mutations ───

export async function createReviewComment(params: {
  engagementId: string;
  targetType: string;
  targetId: string;
  comment: string;
  requiredAction?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rc = await db.createReviewComment({
    engagementId: params.engagementId,
    targetType: params.targetType,
    targetId: params.targetId,
    reviewerId: params.actorId ?? "system",
    reviewerName: params.actorName ?? "System",
    comment: params.comment,
    requiredAction: params.requiredAction,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "review.comment_added",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: params.targetType,
    targetId: params.targetId,
    newState: "open",
    description: `Review comment added on ${params.targetType}: ${params.comment.substring(0, 80)}`,
  });
  return { comment: rc };
}

export async function updateReviewCommentStatus(
  id: string,
  status: string,
  resolution?: string,
): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rc = await db.updateReviewCommentStatus(id, status, resolution);
  if (status === "resolved" && rc) {
    try {
      const engagement = await (
        await prismaGlobal()
      ).auditReviewComment.findUnique({
        where: { id },
        select: { engagementId: true },
      });
      if (engagement) {
        await db.recordAuditEvent({
          engagementId: engagement.engagementId,
          eventType: "review.comment_resolved",
          actorId: "system",
          actorName: rc.reviewerName,
          actorRole: "reviewer",
          targetType: "review_comment",
          targetId: id,
          newState: status,
          description: `Review comment resolved${resolution ? ": " + resolution : ""}`,
        });
      }
    } catch (e) {
      logger.warn("[AuditServices] Failed to record review comment resolution event:", { detail: (e as Error).message, });
    }
  }
  return { comment: rc };
}

// ─── Approval Mutations ───

export async function createApprovalRecord(params: {
  engagementId: string;
  action: string;
  rationale?: string;
  targetType: string;
  targetId: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}): Promise<{ record: ApprovalRecord }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  if (params.action === "approved") {
    const { assertFactoryApprovalGatesPass } = await import(
      "@/lib/audit/governance"
    );
    await assertFactoryApprovalGatesPass(params.engagementId);
  }
  const ar = await db.createApprovalRecord({
    engagementId: params.engagementId,
    approverId: params.actorId ?? "system",
    approverName: params.actorName ?? "System",
    approverRole: params.actorRole ?? "reviewer",
    action: params.action,
    rationale: params.rationale,
    targetType: params.targetType,
    targetId: params.targetId,
  });
  if (params.action === "approved") {
    try {
      const { promoteFinancialStatementsOnApproval } = await import(
        "@/lib/audit/governance"
      );
      await promoteFinancialStatementsOnApproval(
        params.engagementId,
        params.actorId ?? "system",
        params.actorName ?? "System",
      );
    } catch (promoteErr) {
      logger.error(`[AuditOS] FS promotion on approval failed for ${params.engagementId}`, promoteErr instanceof Error ? promoteErr : new Error(String(promoteErr)));
    }
    try {
      const { captureReportingGraphSnapshot } = await import(
        "@/lib/audit/reporting-graph"
      );
      await captureReportingGraphSnapshot({
        engagementId: params.engagementId,
        milestone: "approval",
        actorId: params.actorId ?? "system",
        actorName: params.actorName ?? "System",
        actorRole: params.actorRole ?? "reviewer",
      });
    } catch (snapErr) {
      logger.error(`[AuditOS] Graph snapshot on approval failed for ${params.engagementId}`, snapErr instanceof Error ? snapErr : new Error(String(snapErr)));
    }
  }
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType:
      params.action === "approved"
        ? "engagement.state_changed"
        : "engagement.state_changed",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: params.actorRole ?? "reviewer",
    targetType: params.targetType,
    targetId: params.targetId,
    newState: params.action === "approved" ? "approved" : "rejected",
    description: `Engagement ${params.action} by ${params.actorName ?? "System"}${params.rationale ? ": " + params.rationale : ""}`,
  });
  if (params.action === "approved") {
    await db.updateEngagementStatus(params.engagementId, "approved");
  }
  return { record: ar };
}
