"use server";

import {
  createFinding as svcCreateFinding,
  updateFindingStatus as svcUpdateFindingStatus,
  createRecommendation as svcCreateRecommendation,
  updateRecommendationStatus as svcUpdateRecommendationStatus,
  recordAuditEvent as svcRecordAuditEvent,
  getAuditActor,
  requireRole,
  assertEngagementAccess,
  enforceAuditRateLimit,
  evaluateFindingEscalation,
  getGovernanceAuditMetadata,
  buildProvenanceMetadata,
  mapFindingStatusToApprovalState,
  mapRecommendationStatusToApprovalState,
} from "@/lib/kernel";
import { getGovernanceContext } from "@/lib/governance/retrieval-router";
import { publishDomainEvent } from "@/lib/kernel/publish";
import { publishAuditOSEvent } from "@/lib/kernel/events/audit-events";

export async function createFindingAction(params: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause?: string;
  impact?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_finding", "mutation");
  const escalation = evaluateFindingEscalation(params.severity);
  const result = await svcCreateFinding({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
  if (escalation.triggers.length > 0) {
    await svcRecordAuditEvent({
      engagementId: params.engagementId,
      eventType: "finding.governance_escalation",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "finding",
      targetId: result.finding.id,
      newState: result.finding.status,
      description: `Governance escalation on finding "${params.title}": ${escalation.message}`,
      aiRelated: false,
      metadata: {
        governanceEscalationLevel: escalation.level,
        governanceEscalationTriggers: escalation.triggers.map((t) => t.trigger),
        governanceRequiresHumanResolution: escalation.requiresHumanResolution,
      },
    });
  }
  try {
    await publishDomainEvent(publishAuditOSEvent("finding.created", {
      actorId: actor.actorId,
      organizationId: actor.organizationId,
      resourceId: result.finding.id,
      resourceType: "finding",
      metadata: {
        engagementId: params.engagementId,
        findingId: result.finding.id,
      },
    }));
  } catch {
    // Event publishing is fire-and-forget
  }
  return result;
}

export async function updateFindingStatusAction(
  id: string,
  status: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "update_finding_status", "mutation");
  const governanceContext = getGovernanceContext("audit_findings");
  const provenance = buildProvenanceMetadata({
    taskType: "audit_findings",
    approvalState: mapFindingStatusToApprovalState(status),
    evidenceRequirements: governanceContext.evidenceRequirements,
  });
  const result = await svcUpdateFindingStatus(
    id,
    status,
    engagementId,
    actor.actorId,
  );
  await svcRecordAuditEvent({
    engagementId,
    eventType: "finding.governance_state_changed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "finding",
    targetId: id,
    newState: status,
    description: `Finding status changed to ${status} — governance check: ${provenance.approvalState}`,
    aiRelated: false,
    metadata: getGovernanceAuditMetadata("audit_findings", provenance),
  });
  return result;
}

export async function createRecommendationAction(params: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_recommendation", "mutation");
  return svcCreateRecommendation({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}

export async function updateRecommendationStatusAction(
  id: string,
  status: string,
  engagementId: string,
  reviewerDecision?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(
    actor,
    "update_recommendation_status",
    "mutation",
  );
  const governanceContext = getGovernanceContext("audit_findings");
  const provenance = buildProvenanceMetadata({
    taskType: "audit_findings",
    approvalState: mapRecommendationStatusToApprovalState(status),
    evidenceRequirements: governanceContext.evidenceRequirements,
  });
  const result = await svcUpdateRecommendationStatus(
    id,
    status,
    engagementId,
    reviewerDecision,
  );
  await svcRecordAuditEvent({
    engagementId,
    eventType: "recommendation.governance_state_changed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "recommendation",
    targetId: id,
    newState: status,
    description: `Recommendation status changed to ${status} — governance check: ${provenance.approvalState}${reviewerDecision ? ` (${reviewerDecision})` : ""}`,
    aiRelated: false,
    metadata: getGovernanceAuditMetadata("audit_findings", provenance),
  });
  return result;
}
