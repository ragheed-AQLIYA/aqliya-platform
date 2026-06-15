"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { independenceEngine } from "@/lib/audit/independence-engine";

// ==================== Register ====================

export async function registerPersonAction(data: {
  organizationId: string;
  entityId: string;
  entityName: string;
  entityRole: string;
  joinDate?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return independenceEngine.registerPerson(actor, data);
}

export async function deactivateRegisterEntryAction(id: string, leaveDate?: Date) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return independenceEngine.deactivateRegisterEntry(actor, id, leaveDate);
}

export async function listRegisterAction(organizationId: string, roleFilter?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return independenceEngine.listRegister(organizationId, roleFilter);
}

export async function getRegisterEntryAction(id: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return independenceEngine.getRegisterEntry(id);
}

// ==================== Financial Interests ====================

export async function declareFinancialInterestAction(data: {
  registerId: string;
  interestType: string;
  issuerName: string;
  issuerTicker?: string;
  amount?: number;
  currency?: string;
  dateAcquired?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return independenceEngine.declareFinancialInterest(actor, data);
}

export async function disposeFinancialInterestAction(id: string, dateDisposed: Date) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return independenceEngine.disposeFinancialInterest(id, dateDisposed);
}

// ==================== Employment Relationships ====================

export async function declareEmploymentAction(data: {
  registerId: string;
  relatedEntityName: string;
  relatedEntityType: string;
  relationshipType: string;
  relationshipDescription?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return independenceEngine.declareEmploymentRelationship(actor, data);
}

// ==================== Threats ====================

export async function identifyThreatAction(data: {
  registerId: string;
  clientId?: string;
  engagementId?: string;
  threatCategory: string;
  threatDescription: string;
  threatLevel: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer"]);
  return independenceEngine.identifyThreat(actor, data as any);
}

export async function assessThreatAction(
  id: string,
  threatLevel: string,
  status: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return independenceEngine.assessThreat(actor, id, threatLevel as any, status as any);
}

export async function listThreatsAction(organizationId: string, filters?: { status?: string; category?: string }) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return independenceEngine.listThreats(organizationId, filters);
}

// ==================== Safeguards ====================

export async function proposeSafeguardAction(data: {
  threatId: string;
  safeguardType: string;
  safeguardDescription: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return independenceEngine.proposeSafeguard(actor, data as any);
}

export async function updateSafeguardStatusAction(
  id: string,
  status: string,
  effectivenessReview?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return independenceEngine.updateSafeguardStatus(id, status as any, effectivenessReview);
}

// ==================== Conflict Check ====================

export async function runConflictCheckAction(clientId: string, clientName: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return independenceEngine.runConflictCheck(actor, clientId, clientName);
}

// ==================== Annual Confirmation ====================

export async function createConfirmationCycleAction(organizationId: string, year: number) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return independenceEngine.createConfirmationCycle(actor, organizationId, year);
}

export async function submitConfirmationAction(
  id: string,
  interestsDeclared?: Record<string, unknown>,
  relationshipsDeclared?: Record<string, unknown>,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "operator"]);
  return independenceEngine.submitConfirmation(actor, id, interestsDeclared, relationshipsDeclared);
}

export async function reviewConfirmationAction(
  id: string,
  reviewedNotes: string,
  status: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  return independenceEngine.reviewConfirmation(actor, id, reviewedNotes, status as any);
}

export async function getConfirmationStatusAction(organizationId: string, year: number) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return independenceEngine.getConfirmationStatus(organizationId, year);
}

// ==================== Dashboard ====================

export async function getIndependenceDashboardAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return independenceEngine.getDashboard(organizationId);
}

export async function getThreatCategoriesAction() {
  return independenceEngine.getThreatCategories();
}
