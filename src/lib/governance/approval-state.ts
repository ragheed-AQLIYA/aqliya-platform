import { ApprovalState, ProvenanceMetadata, GovernanceTaskType, EscalationLevel } from './runtime-types';

const AI_FORBIDDEN_TRANSITIONS: Record<ApprovalState, ApprovalState[]> = {
  draft_generated: ['approved_by_human', 'finalized'],
  evidence_pending: ['approved_by_human', 'finalized'],
  review_required: ['approved_by_human', 'finalized'],
  under_review: ['approved_by_human', 'finalized'],
  changes_requested: ['approved_by_human', 'finalized'],
  approved_by_human: ['finalized'],
  rejected_by_human: ['approved_by_human', 'finalized'],
  finalized: [],
};

const PROFESSIONAL_TASK_TYPES: GovernanceTaskType[] = [
  'statement_drafting',
  'notes_generation',
  'audit_findings',
  'commercial_claim_review',
];

export function canTransitionApprovalState(from: ApprovalState, to: ApprovalState, isAi: boolean): boolean {
  if (!isAi) return true;
  const forbidden = AI_FORBIDDEN_TRANSITIONS[from];
  return !forbidden.includes(to);
}

export function requireHumanApproval(taskType: GovernanceTaskType): boolean {
  return PROFESSIONAL_TASK_TYPES.includes(taskType);
}

export function isFinalizationAllowed(metadata: ProvenanceMetadata): boolean {
  if (metadata.approvalState !== 'approved_by_human') return false;
  if (metadata.escalationLevel === 'blocked' || metadata.escalationLevel === 'senior_review_required' || metadata.escalationLevel === 'review_required') return false;
  return metadata.evidenceRequirements.every(
    er => !er.requiredForApproval || er.status === 'complete'
  );
}

export function getApprovalBlockingReasons(metadata: ProvenanceMetadata): string[] {
  const reasons: string[] = [];

  if (metadata.approvalState === 'finalized') {
    return [];
  }

  if (metadata.approvalState !== 'approved_by_human') {
    reasons.push('Output has not been approved by a human reviewer');
  }

  const missingEvidence = metadata.evidenceRequirements.filter(
    er => er.requiredForApproval && er.status !== 'complete'
  );
  for (const er of missingEvidence) {
    reasons.push(`Missing required evidence: ${er.description} (status: ${er.status})`);
  }

  if (metadata.escalationLevel === 'blocked') {
    reasons.push('This item is blocked by escalation — must be resolved before finalization');
  }
  if ((metadata.escalationLevel === 'senior_review_required' || metadata.escalationLevel === 'review_required') && !metadata.approvedBy) {
    reasons.push(`Escalated item (${metadata.escalationLevel}) requires reviewer resolution before finalization`);
  }

  if (requireHumanApproval(metadata.taskType) && metadata.approvalState !== 'approved_by_human') {
    reasons.push('Professional output requires human approval before finalization');
  }

  return reasons;
}
