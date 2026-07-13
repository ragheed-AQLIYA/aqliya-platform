// ─── AuditOS L6.6 Review Notes SLA Engine ───
// محرك ملاحظات المراجعة مع SLA والتصعيد

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuditActor } from "./actor-context";
import { recordAuditEvent } from "./services";

export type ReviewNoteStatus = "raised" | "assigned" | "in_progress" | "responded" | "evidenced" | "reviewed" | "closed";
export type ReviewPriority = "low" | "medium" | "high" | "critical";
export type ReviewStage = "planning" | "execution" | "reporting" | "completion";
export type EscalationLevel = "manager" | "partner" | "ethics" | "quality";

const SLA_BY_PRIORITY: Record<ReviewPriority, { responseHrs: number; resolutionHrs: number }> = {
  critical: { responseHrs: 4, resolutionHrs: 24 },
  high: { responseHrs: 24, resolutionHrs: 72 },
  medium: { responseHrs: 72, resolutionHrs: 168 },
  low: { responseHrs: 168, resolutionHrs: 336 },
};

class ReviewNotesEngineImpl {
  async create(
    actor: AuditActor,
    input: {
      engagementId: string;
      targetType: string;
      targetId: string;
      targetLabel?: string;
      reviewStage: string;
      priority: string;
      comment: string;
      assignedToId?: string;
    },
  ) {
    const count = await prisma.reviewNote.count({
      where: { engagementId: input.engagementId },
    });

    const note = await prisma.reviewNote.create({
      data: {
        engagementId: input.engagementId,
        reviewNoteNumber: `RN-${count + 1}`,
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        reviewStage: input.reviewStage,
        priority: input.priority,
        status: input.assignedToId ? "assigned" : "raised",
        comment: input.comment,
        raiserId: actor.actorId,
        raiserName: actor.actorName,
        assignedToId: input.assignedToId,
        assignedAt: input.assignedToId ? new Date() : undefined,
      },
    });

    const sla = SLA_BY_PRIORITY[input.priority as ReviewPriority] ?? SLA_BY_PRIORITY.medium;
    await prisma.reviewNoteSLA.create({
      data: {
        reviewNoteId: note.id,
        slaTargetHours: sla.responseHrs,
      },
    });

    await this.audit(actor, "review_note.created", note.id, input.engagementId, { priority: input.priority });
    return prisma.reviewNote.findUnique({ where: { id: note.id }, include: { slaConfig: true, escalations: true } });
  }

  async assign(actor: AuditActor, noteId: string, _engagementId: string, assignToId: string) {
    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: { assignedToId: assignToId, assignedAt: new Date(), status: "assigned" },
    });
    await this.audit(actor, "review_note.assigned", noteId, _engagementId, { assignedTo: assignToId });
    return note;
  }

  async startWork(actor: AuditActor, noteId: string, _engagementId: string) {
    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: { status: "in_progress" },
    });
    await this.audit(actor, "review_note.in_progress", noteId, _engagementId, {});
    return note;
  }

  async respond(actor: AuditActor, noteId: string, _engagementId: string, responseDescription: string) {
    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: { responseDescription, respondedAt: new Date(), status: "responded" },
    });
    await this.audit(actor, "review_note.responded", noteId, _engagementId, {});
    return note;
  }

  async addEvidence(actor: AuditActor, noteId: string, _engagementId: string, evidenceRef: Record<string, unknown>) {
    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: { evidenceRef: evidenceRef as unknown as Prisma.InputJsonValue, status: "evidenced" },
    });
    await this.audit(actor, "review_note.evidenced", noteId, _engagementId, {});
    return note;
  }

  async review(
    actor: AuditActor,
    noteId: string,
    _engagementId: string,
    conclusion: "satisfactory" | "needs_revision" | "re_open",
    closureComment?: string,
  ) {
    if (conclusion === "satisfactory") {
      const note = await prisma.reviewNote.update({
        where: { id: noteId },
        data: { reviewerConclusion: conclusion, closureComment, closedById: actor.actorId, closedAt: new Date(), status: "closed" },
      });
      await this.audit(actor, "review_note.closed", noteId, _engagementId, { conclusion });
      return note;
    }
    const note = await prisma.reviewNote.update({
      where: { id: noteId },
      data: { reviewerConclusion: conclusion, closureComment, status: "assigned", responseDescription: null, respondedAt: null },
    });
    await this.audit(actor, "review_note.re_opened", noteId, _engagementId, { conclusion });
    return note;
  }

  async escalate(actor: AuditActor, noteId: string, _engagementId: string, escalationLevel: EscalationLevel, reason: string) {
    const escalation = await prisma.reviewNoteEscalation.create({
      data: { reviewNoteId: noteId, escalationLevel, reason, escalatedById: actor.actorId },
    });
    await prisma.reviewNoteSLA.update({
      where: { reviewNoteId: noteId },
      data: { slaBreached: true, slaBreachedAt: new Date() },
    });
    await this.audit(actor, "review_note.escalated", noteId, _engagementId, { escalationLevel });
    return escalation;
  }

  async resolveEscalation(actor: AuditActor, escalationId: string, _engagementId: string, resolution: string) {
    const escalation = await prisma.reviewNoteEscalation.update({
      where: { id: escalationId },
      data: { resolvedById: actor.actorId, resolvedAt: new Date(), resolution },
    });
    await this.audit(actor, "review_note.escalation_resolved", escalation.reviewNoteId, _engagementId, {});
    return escalation;
  }

  async get(noteId: string) {
    return prisma.reviewNote.findUnique({
      where: { id: noteId },
      include: { slaConfig: true, escalations: { orderBy: { createdAt: "desc" } } },
    });
  }

  async list(engagementId: string, filters?: { status?: string; priority?: string; assignedToId?: string; raiserId?: string }) {
    return prisma.reviewNote.findMany({
      where: {
        engagementId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.priority ? { priority: filters.priority } : {}),
        ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
        ...(filters?.raiserId ? { raiserId: filters.raiserId } : {}),
      },
      include: { slaConfig: true, escalations: true },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
  }

  async getSLAMetrics(engagementId: string) {
    const notes = await prisma.reviewNote.findMany({
      where: { engagementId },
      include: { slaConfig: true },
    });
    const now = Date.now();
    let breached = 0, warning = 0, totalRatio = 0, count = 0;
    for (const n of notes) {
      if (!n.slaConfig) continue;
      const elapsed = (now - n.raisedAt.getTime()) / 3_600_000;
      const ratio = elapsed / n.slaConfig.slaTargetHours;
      if (ratio >= 1) breached++;
      else if (ratio >= 0.8) warning++;
      totalRatio += ratio;
      count++;
    }
    return {
      total: notes.length,
      breached,
      warning,
      healthy: count - breached - warning,
      averageSlaRatio: count > 0 ? Math.round((totalRatio / count) * 100) / 100 : 0,
    };
  }

  getSLATargets() {
    return SLA_BY_PRIORITY;
  }

  private async audit(actor: AuditActor, eventType: string, noteId: string, engagementId: string, metadata?: Record<string, unknown>) {
    await recordAuditEvent({
      engagementId,
      eventType,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "review_note",
      targetId: noteId,
      newState: eventType,
      description: `[ReviewNotes] ${eventType}`,
      aiRelated: false,
      metadata: (metadata ?? {}) as Record<string, unknown>,
    }).catch(() => null);
  }
}

export const reviewNotesEngine = new ReviewNotesEngineImpl();
