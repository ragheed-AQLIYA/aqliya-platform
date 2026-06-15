"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { clientAcceptanceEngine } from "@/lib/audit/client-acceptance-engine";

// ==================== Prospects ====================

export async function createProspectAction(data: {
  organizationId: string;
  source: string;
  companyName: string;
  registrationNumber?: string;
  jurisdiction?: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  estimatedFee?: number;
  referredBy?: string;
  referralNotes?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return clientAcceptanceEngine.createProspect(actor, data as any);
}

export async function updateProspectAction(
  id: string,
  data: {
    status?: string;
    companyName?: string;
    registrationNumber?: string;
    contactEmail?: string;
    contactPhone?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return clientAcceptanceEngine.updateProspect(id, data as any);
}

export async function getProspectAction(id: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return clientAcceptanceEngine.getProspect(id);
}

export async function listProspectsAction(organizationId: string, status?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return clientAcceptanceEngine.listProspects(organizationId, status as any);
}

// ==================== KYC ====================

export async function submitKycAction(
  prospectId: string,
  data: {
    ownershipStructure?: Record<string, unknown>;
    financialHealth?: Record<string, unknown>;
    regulatoryStatus?: string;
    regulatoryBody?: string;
    litigationHistory?: Record<string, unknown>;
    pepCheck?: string;
    sanctionCheck?: string;
    adverseMediaCheck?: string;
    notes?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return clientAcceptanceEngine.createOrUpdateKyc(actor, prospectId, data);
}

// ==================== Risk Assessment ====================

export async function assessClientRiskAction(input: {
  prospectId: string;
  assessmentType: string;
  clientId?: string;
  riskFactors: Array<{ name: string; weight: number; score: number; rationale: string }>;
  mitigatingFactors?: string[];
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return clientAcceptanceEngine.assessRisk(actor, input as any);
}

export async function reviewRiskAssessmentAction(assessmentId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner"]);
  return clientAcceptanceEngine.reviewRiskAssessment(actor, assessmentId);
}

export async function approveRiskAssessmentAction(assessmentId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return clientAcceptanceEngine.approveRiskAssessment(actor, assessmentId);
}

// ==================== Decision ====================

export async function makeAcceptanceDecisionAction(input: {
  prospectId: string;
  clientId?: string;
  decisionType: string;
  decision: string;
  rationale: string;
  conditions?: string[];
  effectiveDate?: Date;
  expiryDate?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return clientAcceptanceEngine.makeDecision(actor, input as any);
}

export async function getProspectDecisionsAction(prospectId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return clientAcceptanceEngine.getDecisions(prospectId);
}

// ==================== Continuance ====================

export async function createContinuanceReviewAction(input: {
  organizationId: string;
  clientId: string;
  reviewYear: number;
  engagementHistory?: Record<string, unknown>;
  feeHistory?: Record<string, unknown>;
  clientChanges?: Record<string, unknown>;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return clientAcceptanceEngine.createContinuanceReview(actor, input);
}

export async function completeContinuanceReviewAction(
  reviewId: string,
  decision: string,
  rationale: string,
  riskReassessmentId?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return clientAcceptanceEngine.completeContinuanceReview(actor, reviewId, decision as any, rationale, riskReassessmentId);
}

export async function listContinuanceReviewsAction(clientId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return clientAcceptanceEngine.listContinuanceReviews(clientId);
}

export async function getPipelineAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return clientAcceptanceEngine.getPipeline(organizationId);
}
