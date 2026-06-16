import { GovernanceTaskType, EvidenceStatus, EscalationLevel, ApprovalState } from '../runtime-types';

export function getTaskTypeLabel(taskType: GovernanceTaskType): string {
  const labels: Record<GovernanceTaskType, string> = {
    trial_balance_upload: 'Trial Balance Upload',
    account_mapping: 'Account Mapping',
    statement_drafting: 'Statement Drafting',
    notes_generation: 'Notes Generation',
    disclosure_enrichment: 'Disclosure Enrichment',
    evidence_review: 'Evidence Review',
    audit_findings: 'Audit Findings',
    commercial_claim_review: 'Commercial Claim Review',
    pilot_decision: 'Pilot Decision',
    approval_review: 'Approval Review',
    skill_execution: 'Skill Execution',
  };
  return labels[taskType] || taskType;
}

export function getEvidenceStatusLabel(status: EvidenceStatus): string {
  const labels: Record<string, string> = { complete: 'Complete', sufficient: 'Sufficient', partial: 'Partial', missing: 'Missing', conflicting: 'Conflicting', weak: 'Weak', unverifiable: 'Unverifiable' };
  return labels[status] || status;
}

export function getEscalationLevelLabel(level: EscalationLevel): string {
  const labels: Record<string, string> = { none: 'None', notice: 'Notice', review_required: 'Review Required', senior_review_required: 'Senior Review Required', blocked: 'Blocked' };
  return labels[level] || level;
}

export function getApprovalStateLabel(state: ApprovalState): string {
  const labels: Record<string, string> = { draft_generated: 'Draft Generated', evidence_pending: 'Evidence Pending', review_required: 'Review Required', under_review: 'Under Review', changes_requested: 'Changes Requested', approved_by_human: 'Approved by Human', rejected_by_human: 'Rejected by Human', finalized: 'Finalized' };
  return labels[state] || state;
}

export const EVIDENCE_COLORS: Record<string, string> = { complete: 'bg-green-100 text-green-800', sufficient: 'bg-green-100 text-green-800', partial: 'bg-yellow-100 text-yellow-800', missing: 'bg-red-100 text-red-800', conflicting: 'bg-orange-100 text-orange-800', weak: 'bg-gray-100 text-gray-800', unverifiable: 'bg-purple-100 text-purple-800' };

export const ESCALATION_COLORS: Record<EscalationLevel, string> = { none: '', notice: 'bg-blue-100 text-blue-800', review_required: 'bg-yellow-100 text-yellow-800', senior_review_required: 'bg-orange-100 text-orange-800', blocked: 'bg-red-100 text-red-800' };

export const BOUNDARY_TEXT = 'Draft only. Human review and approval required before any professional use. AI assists. Humans decide. Evidence governs.';
