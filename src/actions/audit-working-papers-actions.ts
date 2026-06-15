"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { workingPapersEngine } from "@/lib/audit/working-papers-engine";

export async function createWorkingPaperAction(data: {
  engagementId: string;
  indexType: string;
  paperNumber: string;
  paperTitle: string;
  methodologyRef?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createPaper(actor, data as any);
}

export async function listWorkingPapersAction(engagementId: string, indexType?: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  return workingPapersEngine.listPapers(engagementId, indexType as any);
}

export async function getWorkingPaperAction(id: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return workingPapersEngine.getPaper(id);
}

export async function updateWorkingPaperStatusAction(
  id: string,
  engagementId: string,
  status: string,
  conclusion?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);
  return workingPapersEngine.updatePaperStatus(actor, id, status, conclusion);
}

export async function createLeadScheduleAction(data: {
  engagementId: string;
  workingPaperIndexId: string;
  accountCode: string;
  accountName: string;
  priorYearBalance?: number;
  currentYearBalance?: number;
  finalBalance?: number;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createLeadSchedule(actor, data);
}

export async function createAnalyticalReviewAction(data: {
  engagementId: string;
  workingPaperIndexId: string;
  procedureDescription: string;
  expectation?: number;
  expectationBasis?: string;
  actualResult?: number;
  variance?: number;
  investigationConclusion?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createAnalyticalReview(actor, data);
}

export async function createControlTestAction(data: {
  engagementId: string;
  workingPaperIndexId: string;
  controlDescription: string;
  controlObjective?: string;
  controlType: string;
  controlFrequency?: string;
  sampleSize?: number;
  deviations?: number;
  conclusion?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createControlTest(actor, data);
}

export async function createSubstantiveTestAction(data: {
  engagementId: string;
  workingPaperIndexId: string;
  procedureDescription: string;
  assertionTested?: string;
  populationReference?: string;
  sampleReference?: string;
  conclusion?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createSubstantiveTest(actor, data);
}

export async function createCompletionPaperAction(data: {
  engagementId: string;
  workingPaperIndexId: string;
  checklistType: string;
  overallAssessment?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  await assertEngagementAccess(data.engagementId, actor);
  return workingPapersEngine.createCompletionPaper(actor, data);
}

export async function signOffCompletionAction(id: string, engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  return workingPapersEngine.signOffCompletion(actor, id);
}

export async function generateWorkingPaperFileIndexAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  return workingPapersEngine.generateFileIndex(engagementId);
}

export async function getWorkingPaperDashboardAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  return workingPapersEngine.getDashboard(engagementId);
}
