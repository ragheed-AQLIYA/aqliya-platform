"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { auditKnowledgeEngine } from "@/lib/audit/knowledge-engine";

export async function derivePatternsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return auditKnowledgeEngine.derivePatternsFromEngagement(engagementId);
}

export async function listPatternsAction(organizationId: string, patternType?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.listPatterns(organizationId, patternType);
}

export async function getTopPatternsAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.getTopPatterns(organizationId);
}

export async function generateRecommendationsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  return auditKnowledgeEngine.generateRecommendations(engagementId);
}

export async function listRecommendationsAction(engagementId: string, status?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.listRecommendations(engagementId, status);
}

export async function updateRecommendationStatusAction(
  id: string,
  status: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  return auditKnowledgeEngine.updateRecommendationStatus(id, status, actor.actorId);
}

export async function createEngagementProfileAction(
  engagementId: string,
  data: {
    organizationId: string;
    riskProfileSummary?: string;
    riskAreas?: string[];
    knowledgeTags?: string[];
    isCompleted?: boolean;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  return auditKnowledgeEngine.createOrUpdateProfile(engagementId, data);
}

export async function getEngagementProfileAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.getProfile(engagementId);
}

export async function createBenchmarkAction(data: {
  organizationId: string;
  industry: string;
  benchmarkType: string;
  metricName: string;
  metricValue: number;
  unit?: string;
  sampleSize?: number;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  return auditKnowledgeEngine.createBenchmark(data);
}

export async function listBenchmarksAction(organizationId: string, industry?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.listBenchmarks(organizationId, industry);
}

export async function getKnowledgeDashboardAction(organizationId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator", "viewer"]);
  return auditKnowledgeEngine.getDashboard(organizationId);
}
