"use server";

// ─── AuditOS L6.6 Review Notes Workflow Actions ───

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { reviewNotesEngine, type ReviewPriority, type ReviewStage, type EscalationLevel } from "@/lib/audit/review-notes-engine";

export async function createReviewNoteAction(input: {
  engagementId: string;
  targetType: string;
  targetId: string;
  targetLabel?: string;
  reviewStage: string;
  priority: string;
  comment: string;
  assignedToId?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(input.engagementId, actor);

  return reviewNotesEngine.create(actor, input as any);
}

export async function assignReviewNoteAction(
  noteId: string,
  engagementId: string,
  assignToId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "manager", "partner"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.assign(actor, noteId, engagementId, assignToId);
}

export async function startReviewNoteWorkAction(noteId: string, engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.startWork(actor, noteId, engagementId);
}

export async function respondReviewNoteAction(
  noteId: string,
  engagementId: string,
  responseDescription: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.respond(actor, noteId, engagementId, responseDescription);
}

export async function addReviewNoteEvidenceAction(
  noteId: string,
  engagementId: string,
  evidenceRef: Record<string, unknown>,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.addEvidence(actor, noteId, engagementId, evidenceRef);
}

export async function reviewReviewNoteAction(
  noteId: string,
  engagementId: string,
  conclusion: "satisfactory" | "needs_revision" | "re_open",
  closureComment?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.review(actor, noteId, engagementId, conclusion, closureComment);
}

export async function escalateReviewNoteAction(
  noteId: string,
  engagementId: string,
  escalationLevel: string,
  reason: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.escalate(actor, noteId, engagementId, escalationLevel as EscalationLevel, reason);
}

export async function resolveEscalationAction(
  escalationId: string,
  engagementId: string,
  resolution: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.resolveEscalation(actor, escalationId, engagementId, resolution);
}

export async function getReviewNoteAction(noteId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager", "viewer"]);

  const note = await reviewNotesEngine.get(noteId);
  if (!note) throw new Error("Review note not found");

  await assertEngagementAccess(note.engagementId, actor);
  return note;
}

export async function listReviewNotesAction(
  engagementId: string,
  filters?: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    raiserId?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager", "viewer"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.list(engagementId, filters as any);
}

export async function getReviewNoteSLAMetricsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "manager", "partner"]);
  await assertEngagementAccess(engagementId, actor);

  return reviewNotesEngine.getSLAMetrics(engagementId);
}

export async function getReviewNoteSLATargetsAction() {
  return reviewNotesEngine.getSLATargets();
}
