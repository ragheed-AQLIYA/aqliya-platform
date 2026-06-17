/* eslint-disable @typescript-eslint/no-explicit-any */
// Action-to-engine interface: actions accept broad string types from form data;
// engine methods use narrower literal/enum types. `as any` is the intentional bridge.
"use server";

// ─── AuditOS L6.7 ISQM1 Quality Engine Actions ───

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { isqm1Engine, type QualityObjectiveType, type QualityCategory, type QualityStatus, type FindingType, type FindingSeverity, type MonitorStatus, type ResponseStatus, type RemediationStatus } from "@/lib/audit/isqm1-engine";

// ==================== Quality Objectives ====================

export async function createQualityObjectiveAction(data: {
  organizationId: string;
  objectiveType: string;
  category: string;
  reference?: string;
  description: string;
  targetState?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.createObjective(actor, data as any);
}

export async function updateQualityObjectiveAction(
  id: string,
  data: {
    description?: string;
    targetState?: string;
    status?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.updateObjective(actor, id, data as any);
}

export async function listQualityObjectivesAction(organizationId: string, category?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listObjectives(organizationId, category as any);
}

export async function getQualityObjectiveAction(id: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.getObjective(id);
}

// ==================== Quality Risks ====================

export async function createQualityRiskAction(data: {
  organizationId: string;
  objectiveId: string;
  riskDescription: string;
  riskCategory?: string;
  inherentRisk?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.createRisk(actor, data);
}

export async function assessQualityRiskAction(
  id: string,
  data: {
    inherentRisk?: string;
    residualRisk?: string;
    residualRiskAssessment?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.assessRisk(actor, id, data);
}

export async function listQualityRisksAction(organizationId: string, objectiveId?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listRisks(organizationId, objectiveId);
}

// ==================== Quality Responses ====================

export async function createQualityResponseAction(data: {
  organizationId: string;
  riskId: string;
  responseType: string;
  responseDescription: string;
  responsiblePersonId?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.createResponse(actor, data);
}

export async function updateResponseStatusAction(
  id: string,
  status: string,
  evaluation?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.updateResponseStatus(actor, id, status as any, evaluation);
}

export async function listQualityResponsesAction(organizationId: string, riskId?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listResponses(organizationId, riskId);
}

// ==================== Monitoring Activities ====================

export async function createMonitoringActivityAction(data: {
  organizationId: string;
  activityType: string;
  scope?: string;
  frequency?: string;
  scheduledDate?: Date;
  performedById?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.createMonitoringActivity(actor, data);
}

export async function updateMonitoringStatusAction(
  id: string,
  status: string,
  completedDate?: Date,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.updateMonitoringStatus(actor, id, status as any, completedDate);
}

export async function listMonitoringActivitiesAction(organizationId: string, status?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listMonitoringActivities(organizationId, status as any);
}

// ==================== Quality Findings ====================

export async function createQualityFindingAction(data: {
  organizationId: string;
  monitoringActivityId?: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause?: string;
  rootCauseAnalysis?: string;
  engagementId?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer"]);
  return isqm1Engine.createFinding(actor, data as any);
}

export async function updateFindingStatusAction(id: string, status: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.updateFindingStatus(actor, id, status as any);
}

export async function listQualityFindingsAction(organizationId: string, status?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listFindings(organizationId, status as any);
}

// ==================== Remediation ====================

export async function createRemediationAction(data: {
  organizationId: string;
  findingId: string;
  actionDescription: string;
  actionType?: string;
  responsiblePersonId?: string;
  targetDate?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.createRemediation(actor, data);
}

export async function updateRemediationStatusAction(
  id: string,
  status: string,
  effectivenessResult?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return isqm1Engine.updateRemediationStatus(actor, id, status as any, effectivenessResult);
}

export async function listRemediationsAction(organizationId: string, status?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listRemediations(organizationId, status as any);
}

// ==================== System Evaluation ====================

export async function createQualityEvaluationAction(data: {
  organizationId: string;
  year: number;
  systemEffectiveness: string;
  overallConclusion?: string;
  summaryOfFindings?: string;
  keyStrengths?: string;
  keyWeaknesses?: string;
  nextEvaluationDate?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return isqm1Engine.createOrUpdateEvaluation(actor, data);
}

export async function getQualityEvaluationAction(organizationId: string, year: number) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.getEvaluation(organizationId, year);
}

export async function listQualityEvaluationsAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.listEvaluations(organizationId);
}

// ==================== Dashboard ====================

export async function getIsqm1DashboardAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return isqm1Engine.getDashboard(organizationId);
}

export async function getIsqm1CategoriesAction() {
  return isqm1Engine.getCategories();
}
