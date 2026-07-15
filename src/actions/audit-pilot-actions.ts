"use server";

import {
  createPilotFeedback as svcCreatePilotFeedback,
  updatePilotFeedbackStatus as svcUpdatePilotFeedbackStatus,
  getPilotFeedback as svcGetPilotFeedback,
  createProductionBlocker as svcCreateProductionBlocker,
  updateProductionBlockerStatus as svcUpdateProductionBlockerStatus,
  getProductionBlockers as svcGetProductionBlockers,
  createOrUpdatePilotSignoff as svcCreateOrUpdatePilotSignoff,
  getPilotSignoffChecklist as svcGetPilotSignoffChecklist,
  recordAuditEvent as svcRecordAuditEvent,
  getAuditActor,
  requireRole,
  assertEngagementAccess,
} from "@/lib/kernel";

export async function createPilotFeedbackAction(params: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const feedback = await svcCreatePilotFeedback({
    ...params,
    createdBy: actor.actorId,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.feedback_created",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "pilot_feedback",
    targetId: feedback.id,
    newState: "open",
    description: `Pilot feedback created: ${params.title}`,
    metadata: { category: params.category, source: params.source },
  });
  return feedback;
}

export async function updatePilotFeedbackStatusAction(
  id: string,
  engagementId: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  const fb = await svcUpdatePilotFeedbackStatus(
    id,
    status,
    decision,
    owner,
    nextAction,
  );
  if (fb) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "pilot.feedback_updated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "pilot_feedback",
      targetId: id,
      newState: status,
      description: `Pilot feedback updated: ${fb.title}`,
    });
  }
  return fb;
}

export async function getPilotFeedbackAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetPilotFeedback(engagementId);
}

export async function createProductionBlockerAction(params: {
  engagementId: string;
  title: string;
  description: string;
  category: string;
  severity?: string;
  requiredBefore?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const blocker = await svcCreateProductionBlocker({
    ...params,
    createdBy: actor.actorId,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.blocker_created",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "production_blocker",
    targetId: blocker.id,
    newState: "open",
    description: `Production blocker created: ${params.title}`,
  });
  return blocker;
}

export async function updateProductionBlockerStatusAction(
  id: string,
  engagementId: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  const blockers = await svcGetProductionBlockers(engagementId);
  if (!blockers.some((blocker) => blocker.id === id)) {
    throw new Error("Production blocker not found for this engagement");
  }
  const b = await svcUpdateProductionBlockerStatus(
    id,
    status,
    owner,
    resolutionPlan,
  );
  if (b) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "pilot.blocker_updated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "production_blocker",
      targetId: id,
      newState: status,
      description: `Production blocker updated: ${b.title}`,
    });
  }
  return b;
}

export async function getProductionBlockersAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetProductionBlockers(engagementId);
}

export async function createOrUpdatePilotSignoffAction(params: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const signoff = await svcCreateOrUpdatePilotSignoff({
    ...params,
    signedBy: params.signedBy ?? actor.actorName,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.signoff_updated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "pilot_signoff",
    targetId: signoff.id,
    newState: params.status,
    description: `Pilot signoff updated: ${params.checklistItem} → ${params.status}`,
  });
  return signoff;
}

export async function getPilotSignoffChecklistAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetPilotSignoffChecklist(engagementId);
}
