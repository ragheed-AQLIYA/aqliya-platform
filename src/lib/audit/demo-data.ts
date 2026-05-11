// ─── AuditOS Demo Data Helper ───
// Read-only — imports mock data directly, never touches DB, auth, or write actions.

import {
  mockDashboardSummary,
  mockEngagement,
  mockTrialBalance,
  mockTBLines,
  mockCanonicalAccounts,
  mockMappings,
  mockValidationRun,
  mockFinancialStatements,
  mockDisclosureNotes,
  mockEvidence,
  mockFindings,
  mockRecommendations,
  mockReviewComments,
  mockApprovalRecords,
  mockPublicationPackage,
  mockAuditEvents,
  mockAiOutputs,
  mockAlerts,
  ID,
} from "./mock-data"

export function getDemoDashboardSummary() {
  return mockDashboardSummary
}

export function getDemoEngagement() {
  return mockEngagement
}

export function getDemoTrialBalance() {
  return { trialBalance: mockTrialBalance, lines: mockTBLines }
}

export function getDemoCanonicalAccounts() {
  return mockCanonicalAccounts
}

export function getDemoMappings() {
  return mockMappings
}

export function getDemoValidation() {
  return mockValidationRun
}

export function getDemoFinancialStatements() {
  return mockFinancialStatements
}

export function getDemoDisclosureNotes() {
  return mockDisclosureNotes
}

export function getDemoEvidence() {
  return mockEvidence
}

export function getDemoFindings() {
  return mockFindings
}

export function getDemoRecommendations() {
  return mockRecommendations
}

export function getDemoReviewComments() {
  return mockReviewComments
}

export function getDemoApprovalRecords() {
  return mockApprovalRecords
}

export function getDemoPublicationPackage() {
  return mockPublicationPackage
}

export function getDemoAuditEvents() {
  return mockAuditEvents
}

export function getDemoAiOutputs() {
  return mockAiOutputs
}

export function getDemoAlerts() {
  return mockAlerts
}

export { ID }
