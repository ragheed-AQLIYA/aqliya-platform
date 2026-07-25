import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import type {
  ReviewComment,
  ApprovalRecord,
  DisclosureNote,
} from "@/types/audit";
import {
  toReviewComment,
  toApprovalRecord,
  toDisclosureNote,
  protectedAuditReadUnavailable,
} from "./types";

const logger = createLogger({ product: "audit", action: "review-db" });

export async function getReviewComments(
  engagementId: string,
): Promise<ReviewComment[]> {
  try {
    const comments = await prisma.auditReviewComment.findMany({
      where: { engagementId },
    });
    if (comments.length === 0) return [];
    return comments.map(toReviewComment);
  } catch (error) {
    protectedAuditReadUnavailable(`getReviewComments(${engagementId})`, error);
  }

const logger = createLogger({ product: "platform", action: "unknown" });

}

export async function getOpenReviewCount(
  engagementId: string,
): Promise<number> {
  try {
    const count = await prisma.auditReviewComment.count({
      where: { engagementId, status: "open" },
    });
    return count;
  } catch (error) {
    protectedAuditReadUnavailable(`getOpenReviewCount(${engagementId})`, error);
  }
}

export async function createReviewComment(data: {
  engagementId: string;
  targetType: string;
  targetId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  requiredAction?: string;
}): Promise<ReviewComment> {
  const rc = await prisma.auditReviewComment.create({
    data: {
      engagementId: data.engagementId,
      targetType: data.targetType,
      targetId: data.targetId,
      reviewerId: data.reviewerId,
      reviewerName: data.reviewerName,
      comment: data.comment,
      requiredAction: data.requiredAction ?? "none",
      status: "open",
    },
  });
  return toReviewComment(rc);
}

export async function updateReviewCommentStatus(
  id: string,
  status: string,
  resolution?: string,
): Promise<ReviewComment> {
  const rc = await prisma.auditReviewComment.update({
    where: { id },
    data: {
      status,
      resolution: resolution ?? null,
      resolvedAt: status === "resolved" ? new Date() : undefined,
    },
  });
  return toReviewComment(rc);
}

export async function getApprovalRecords(
  engagementId: string,
): Promise<ApprovalRecord[]> {
  try {
    const records = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
    });
    if (records.length === 0) return [];
    return records.map(toApprovalRecord);
  } catch (error) {
    protectedAuditReadUnavailable(`getApprovalRecords(${engagementId})`, error);
  }
}

export async function createApprovalRecord(data: {
  engagementId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  action: string;
  rationale?: string;
  targetType: string;
  targetId: string;
}): Promise<ApprovalRecord> {
  const ar = await prisma.auditApprovalRecord.create({
    data: {
      engagementId: data.engagementId,
      approverId: data.approverId,
      approverName: data.approverName,
      approverRole: data.approverRole,
      action: data.action,
      rationale: data.rationale ?? null,
      targetType: data.targetType,
      targetId: data.targetId,
    },
  });
  return toApprovalRecord(ar);
}

export async function getDisclosureNotes(
  engagementId: string,
): Promise<DisclosureNote[]> {
  try {
    const notes = await prisma.auditDisclosureNote.findMany({
      where: { engagementId },
    });
    if (notes.length === 0) return [];
    const reviewComments = await prisma.auditReviewComment.findMany({
      where: { engagementId, targetType: "note" },
    });
    const mappedComments = reviewComments.map(toReviewComment);
    return notes.map((n) =>
      toDisclosureNote(
        n,
        mappedComments.filter((rc) => rc.targetId === n.id),
      ),
    );
  } catch (error) {
    protectedAuditReadUnavailable(`getDisclosureNotes(${engagementId})`, error);
  }
}

export async function updateDisclosureNote(
  id: string,
  data: {
    content?: string;
    status?: string;
    missingInformation?: string[];
    aiDrafted?: boolean;
    linkedStatementLine?: string;
  },
): Promise<DisclosureNote | null> {
  try {
    const note = await prisma.auditDisclosureNote.update({
      where: { id },
      data: {
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.missingInformation !== undefined
          ? { missingInformation: data.missingInformation }
          : {}),
        ...(data.aiDrafted !== undefined ? { aiDrafted: data.aiDrafted } : {}),
        ...(data.linkedStatementLine !== undefined
          ? { linkedStatementLine: data.linkedStatementLine }
          : {}),
      },
    });
    const reviewComments = await prisma.auditReviewComment.findMany({
      where: {
        engagementId: note.engagementId,
        targetType: "note",
        targetId: note.id,
      },
    });
    return toDisclosureNote(note, reviewComments.map(toReviewComment));
  } catch (error) {
    logger.warn("[AuditDB] updateDisclosureNote(${id}) error", { error: error instanceof Error ? error?.message : String(error) });
    return null;
  }
}

export async function createDisclosureNote(data: {
  engagementId: string;
  noteNumber: string;
  title: string;
  noteType: string;
  content: string;
  linkedStatementLine?: string;
  missingInformation?: string[];
  aiDrafted?: boolean;
}): Promise<DisclosureNote> {
  const note = await prisma.auditDisclosureNote.create({
    data: {
      engagementId: data.engagementId,
      noteNumber: data.noteNumber,
      title: data.title,
      noteType: data.noteType,
      content: data.content,
      linkedStatementLine: data.linkedStatementLine ?? null,
      missingInformation: data.missingInformation ?? [],
      aiDrafted: data.aiDrafted ?? false,
      status: "draft",
    },
  });
  return toDisclosureNote(note, []);
}
