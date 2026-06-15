"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { samplingHardening } from "@/lib/audit/sampling-hardening";

export async function recordSamplingEvidenceAction(data: {
  organizationId: string;
  planId: string;
  resultId?: string;
  itemIndex: number;
  itemReference?: string;
  itemDescription?: string;
  evidenceType?: string;
  evidenceRef?: string;
  evidenceDescription?: string;
  conclusion: string;
  errorAmount?: number;
  errorDescription?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager"]);
  return samplingHardening.recordEvidence(actor, data);
}

export async function listSamplingEvidenceAction(planId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return samplingHardening.listEvidence(planId);
}

export async function getSamplingEvidenceByResultAction(resultId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return samplingHardening.getEvidenceByResult(resultId);
}

export async function generateSamplingWorkingPaperAction(planId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return samplingHardening.generateWorkingPaper(planId);
}

export async function submitSamplingForReviewAction(data: {
  organizationId: string;
  planId: string;
  resultId?: string;
  reviewType?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "manager"]);
  return samplingHardening.submitForReview(actor, data);
}

export async function approveSamplingReviewAction(
  reviewId: string,
  planId: string,
  data: {
    methodologyValid?: boolean;
    selectionValid?: boolean;
    conclusionValid?: boolean;
    comments?: string;
  },
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner", "manager"]);
  return samplingHardening.approveSample(actor, reviewId, planId, data);
}

export async function rejectSamplingReviewAction(
  reviewId: string,
  planId: string,
  justification: string,
  comments?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "partner", "manager"]);
  return samplingHardening.rejectSample(actor, reviewId, planId, justification, comments);
}

export async function getSamplingReviewStatusAction(planId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return samplingHardening.getReviewStatus(planId);
}

export async function getSamplingPlanSummaryAction(planId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  return samplingHardening.getPlanSummary(planId);
}
