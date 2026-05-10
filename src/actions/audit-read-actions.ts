"use server"

import {
  getEngagement,
  getTrialBalance,
  getMappings,
  confirmMapping,
  getFinancialStatements,
  getDisclosureNotes,
  getEvidence,
  getMissingEvidence,
  getFindings,
  getRecommendations,
  getReviewComments,
  getOpenReviewCount,
  getApprovalRecords,
  getApprovalStatus,
  getAuditEvents,
  getPublicationPackage,
  getValidationRun,
  runValidation,
} from "@/lib/audit/services"
import type {
  Engagement, TrialBalance, AccountMapping, FinancialStatement,
  DisclosureNote, EvidenceObject, Finding, Recommendation, ReviewComment,
  ApprovalRecord, PublicationPackage, ValidationRun,
} from "@/types/audit"

export async function getEngagementAction(id: string): Promise<Engagement | null> {
  return getEngagement(id)
}

export async function getTrialBalanceAction(engagementId: string): Promise<TrialBalance | null> {
  return getTrialBalance(engagementId)
}

export async function getMappingsAction(engagementId: string): Promise<AccountMapping[]> {
  return getMappings(engagementId)
}

export async function confirmMappingAction(engagementId: string, mappingId: string): Promise<AccountMapping | null> {
  return confirmMapping(engagementId, mappingId)
}

export async function getFinancialStatementsAction(engagementId: string): Promise<FinancialStatement[]> {
  return getFinancialStatements(engagementId)
}

export async function getDisclosureNotesAction(engagementId: string): Promise<DisclosureNote[]> {
  return getDisclosureNotes(engagementId)
}

export async function getEvidenceAction(engagementId: string): Promise<EvidenceObject[]> {
  return getEvidence(engagementId)
}

export async function getMissingEvidenceAction(engagementId: string): Promise<EvidenceObject[]> {
  return getMissingEvidence(engagementId)
}

export async function getOpenReviewCountAction(engagementId: string): Promise<number> {
  return getOpenReviewCount(engagementId)
}

export async function getFindingsAction(engagementId: string): Promise<Finding[]> {
  return getFindings(engagementId)
}

export async function getRecommendationsAction(engagementId: string): Promise<Recommendation[]> {
  return getRecommendations(engagementId)
}

export async function getReviewCommentsAction(engagementId: string): Promise<ReviewComment[]> {
  return getReviewComments(engagementId)
}

export async function getApprovalRecordsAction(engagementId: string): Promise<ApprovalRecord[]> {
  return getApprovalRecords(engagementId)
}

export async function getApprovalStatusAction(engagementId: string): Promise<{
  status: string; blockingIssues: readonly string[]; checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  return getApprovalStatus(engagementId)
}

export async function getAuditEventsAction(engagementId: string) {
  return getAuditEvents(engagementId)
}

export async function getPublicationPackageAction(engagementId: string): Promise<PublicationPackage | null> {
  return getPublicationPackage(engagementId)
}

export async function getValidationRunAction(engagementId: string): Promise<ValidationRun | null> {
  return getValidationRun(engagementId)
}

export async function runValidationAction(engagementId: string): Promise<ValidationRun> {
  return runValidation(engagementId)
}
