/* eslint-disable @typescript-eslint/no-explicit-any */
// Engine-internal Prisma JSON/where casts: `as any` bridges complex Prisma generic types.
// ─── AuditOS L6.6 Review Notes Workflow Engine ───
// محرك ملاحظات المراجعة مع دورة الحياة، التكليف، ومؤشرات الأداء
// ISA 220, ISQM1 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuditActor } from "./actor-context";
import { assertEngagementAccess } from "./tenant-guard";
import { recordAuditEvent } from "./services";

// ─── Types ───

export type ReviewNoteStatus =
  | "raised" | "assigned" | "in_progress" | "responded"
  | "evidenced" | "reviewed" | "closed";

export type ReviewPriority = "low" | "medium" | "high" | "critical";
export type ReviewStage = "planning" | "execution" | "reporting" | "completion";
export type EscalationLevel = "manager" | "partner" | "ethics" | "quality";

export const SLA_TARGETS: Record<ReviewPriority, { responseHrs: number; resolutionHrs: number; escalation1Hrs: number; escalation2Hrs: number }> = {
  critical: { responseHrs: 4, resolutionHrs: 24, escalation1Hrs: 8, escalation2Hrs: 16 },
  high: { responseHrs: 24, resolutionHrs: 72, escalation1Hrs: 48, escalation2Hrs: 120 },
  medium: { responseHrs: 72, resolutionHrs: 168, escalation1Hrs: 120, escalation2Hrs: 240 },
  low: { responseHrs: 168, resolutionHrs: 336, escalation1Hrs: 240, escalation2Hrs: 504 },
};

export interface CreateReviewNoteInput {
  engagementId: string;
  targetType: string;
  targetId: string;
  targetLabel?: string;
  reviewStage: ReviewStage;
  priority: ReviewPriority;
  comment: string;
  assignedToId?: string;
}

// ─── Service ───

export class ReviewNotesEngine {
  /**
   * Create a new review note.
   */
  async create(
    actor: AuditActor,
    input: CreateReviewNoteInput,
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    // Generate sequential note number
    const count = await prisma.reviewNote.count({
      where: { engagementId: input.engagementId },
    });

    const slaTarget = SLA_TARGETS[input.priority];

    const note = await prisma.reviewNote.create({
      data: {
        engagementId: input.engagementId,
        reviewNoteNumber: `RN-${(count + 1).toString().padStart(3, "0")}`,
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        reviewStage: input.reviewStage,
        priority: input.priority,
        status: input.assignedToId ? "assigned" : "raised",
        raiserId: actor.actorId,
        raiserName: actor.actorName,
        comment: input.comment,
        assignedToId: input.assignedToId,
        assignedAt: input.assignedToId ? new Date() : undefined,
        slaTargetHours: slaTarget.resolutionHrs,
      },
    });

    await this.auditEvent(actor, "review_note.created", input.engagementId, {
      reviewNoteId: note.id,
      priority: input.priority,
      assignedTo: input.assignedToId,
    });

    return note;
  }

  /**
   * Assign a review note to a team member.
   */
  async assign(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
    assignToId: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: {
        assignedToId: assignToId,
        assignedAt: new Date(),
        status: "assigned",
      },
    });

    await this.auditEvent(actor, "review_note.assigned", engagementId, {
      reviewNoteId: noteId,
      assignedTo: assignToId,
    });

    return note;
  }

  /**
   * Start working on a review note (in progress).
   */
  async startWork(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    return prisma.reviewNote.update({
      where: { id: noteId },
      data: { status: "in_progress" },
    });
  }

  /**
   * Respond to a review note with resolution description.
   */
  async respond(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
    responseDescription: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: {
        responseDescription,
        respondedAt: new Date(),
        status: "responded",
      },
    });

    await this.auditEvent(actor, "review_note.responded", engagementId, {
      reviewNoteId: noteId,
    });

    return note;
  }

  /**
   * Add evidence that the review note has been addressed.
   */
  async addEvidence(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
    evidenceRef: Record<string, unknown>,
  ) {
    await assertEngagementAccess(engagementId, actor);

    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: {
        evidenceRef: evidenceRef as any,
        status: "evidenced",
      },
    });

    await this.auditEvent(actor, "review_note.evidenced", engagementId, {
      reviewNoteId: noteId,
    });

    return note;
  }

  /**
   * Review the response and close or re-open.
   */
  async review(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
    conclusion: "satisfactory" | "needs_revision" | "re_open",
    closureComment?: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    const data: Record<string, unknown> = {
      reviewerConclusion: conclusion,
      closureComment,
    };

    if (conclusion === "satisfactory") {
      data.status = "closed";
      data.closedById = actor.actorId;
      data.closedAt = new Date();
    } else {
      data.status = "in_progress";
    }

    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data,
    });

    await this.auditEvent(actor, `review_note.${conclusion === "satisfactory" ? "closed" : "reopened"}`, engagementId, {
      reviewNoteId: noteId,
      conclusion,
    });

    return note;
  }

  /**
   * Escalate a review note.
   */
  async escalate(
    actor: AuditActor,
    noteId: string,
    engagementId: string,
    escalationLevel: EscalationLevel,
    reason: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    const [escalation] = await prisma.$transaction([
      prisma.reviewNoteEscalation.create({
        data: {
          reviewNoteId: noteId,
          escalationLevel,
          reason,
          escalatedById: actor.actorId,
        },
      }),
      prisma.reviewNote.update({
        where: { id: noteId },
        data: { status: "in_progress" },
      }),
    ]);

    await this.auditEvent(actor, "review_note.escalated", engagementId, {
      reviewNoteId: noteId,
      escalationLevel,
      reason,
    });

    return escalation;
  }

  /**
   * Resolve an escalation.
   */
  async resolveEscalation(
    actor: AuditActor,
    escalationId: string,
    engagementId: string,
    resolution: string,
  ) {
    await assertEngagementAccess(engagementId, actor);

    return prisma.reviewNoteEscalation.update({
      where: { id: escalationId },
      data: {
        resolvedById: actor.actorId,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  /**
   * Get a single review note with escalations.
   */
  async get(noteId: string) {
    return prisma.reviewNote.findUnique({
      where: { id: noteId },
      include: { escalations: true },
    });
  }

  /**
   * List review notes for an engagement with optional filters.
   */
  async list(
    engagementId: string,
    filters?: {
      status?: ReviewNoteStatus;
      priority?: ReviewPriority;
      assignedToId?: string;
      raiserId?: string;
    },
  ) {
    const where: Record<string, unknown> = { engagementId };
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.raiserId) where.raiserId = filters.raiserId;

    return prisma.reviewNote.findMany({
      where: where as any,
      include: { escalations: true },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  /**
   * Get SLA summary metrics for an engagement.
   */
  async getSLAMetrics(engagementId: string) {
    const notes = await prisma.reviewNote.findMany({
      where: { engagementId },
      select: {
        id: true,
        status: true,
        priority: true,
        slaTargetHours: true,
        raisedAt: true,
        assignedAt: true,
        respondedAt: true,
        closedAt: true,
        createdAt: true,
      },
    });

    type NoteSummary = {
      id: string;
      status: string;
      priority: string;
      slaTargetHours: number | null;
      raisedAt: Date | null;
      closedAt: Date | null;
      [key: string]: unknown;
    };

    const total = notes.length;
    const open = notes.filter((n: NoteSummary) => !["closed", "reviewed"].includes(n.status)).length;
    const closed = notes.filter((n: NoteSummary) => n.status === "closed").length;
    const breached = notes.filter((n: NoteSummary) => {
      if (!n.slaTargetHours || !n.raisedAt) return false;
      const elapsed = (Date.now() - n.raisedAt.getTime()) / (1000 * 60 * 60);
      return elapsed > n.slaTargetHours && !["closed", "reviewed"].includes(n.status);
    }).length;

    const avgResolutionHrs = notes
      .filter((n: NoteSummary) => n.closedAt && n.raisedAt)
      .map((n: NoteSummary) => (n.closedAt!.getTime() - n.raisedAt!.getTime()) / (1000 * 60 * 60))
      .reduce((sum: number, hrs: number) => sum + hrs, 0);

    const avgResolution = closed > 0 ? avgResolutionHrs / closed : 0;

    return {
      total,
      open,
      closed,
      breached,
      slaComplianceRate: total > 0 ? ((total - breached) / total) * 100 : 100,
      avgResolutionHours: Math.round(avgResolution * 10) / 10,
      byPriority: {
        critical: notes.filter((n: NoteSummary) => n.priority === "critical").length,
        high: notes.filter((n: NoteSummary) => n.priority === "high").length,
        medium: notes.filter((n: NoteSummary) => n.priority === "medium").length,
        low: notes.filter((n: NoteSummary) => n.priority === "low").length,
      },
      byStatus: notes.reduce(
        (acc: Record<string, number>, n: NoteSummary) => {
          acc[n.status] = (acc[n.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Get SLA targets configuration.
   */
  getSLATargets() {
    return SLA_TARGETS;
  }

  // ─── Private ───

  private async auditEvent(
    actor: AuditActor,
    eventType: string,
    engagementId: string,
    metadata: Record<string, unknown>,
  ) {
    await recordAuditEvent({
      engagementId,
      eventType,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: engagementId,
      newState: eventType,
      description: `[ReviewNotes] ${eventType}`,
      aiRelated: false,
      metadata,
    });
  }
}

export const reviewNotesEngine = new ReviewNotesEngine();


