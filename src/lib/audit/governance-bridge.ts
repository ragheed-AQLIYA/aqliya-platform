import { getGovernanceContext } from '@/lib/governance/retrieval-router'
import { isFinalizationAllowed, getApprovalBlockingReasons } from '@/lib/governance/approval-state'
import { evaluateEscalation } from '@/lib/governance/escalation'
import type {
  ProvenanceMetadata,
  GovernanceTaskType,
  ApprovalState,
  EscalationLevel,
  EvidenceRequirement,
  EscalationResult,
} from '@/lib/governance/runtime-types'

export function buildProvenanceMetadata(params: {
  taskType: GovernanceTaskType
  approvalState: ApprovalState
  evidenceRequirements: EvidenceRequirement[]
  escalationLevel?: EscalationLevel
  approvedBy?: string
}): ProvenanceMetadata {
  const context = getGovernanceContext(params.taskType)
  return {
    taskType: params.taskType,
    generatedAt: new Date().toISOString(),
    approvalState: params.approvalState,
    reviewRequired: params.approvalState !== 'approved_by_human' && params.approvalState !== 'finalized',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: params.evidenceRequirements,
    escalationLevel: params.escalationLevel ?? 'none',
    outputBoundary: context.outputBoundary,
    humanApprovalRequired: context.humanApprovalRequired,
    approvedBy: params.approvedBy,
    explainabilityMessage: `Governance check for ${params.taskType}: state=${params.approvalState}, escalation=${params.escalationLevel ?? 'none'}`,
  }
}

export function mapEngagementStatusToApprovalState(status: string): ApprovalState {
  switch (status) {
    case 'draft':
    case 'setup':
      return 'evidence_pending'
    case 'in_progress':
      return 'review_required'
    case 'under_review':
      return 'under_review'
    case 'awaiting_client':
      return 'changes_requested'
    case 'ready_for_approval':
      return 'review_required'
    case 'approved':
      return 'approved_by_human'
    case 'published':
      return 'finalized'
    default:
      return 'draft_generated'
  }
}

export function mapFindingStatusToApprovalState(status: string): ApprovalState {
  switch (status) {
    case 'draft':
      return 'draft_generated'
    case 'open':
      return 'evidence_pending'
    case 'in_review':
      return 'under_review'
    case 'accepted':
      return 'approved_by_human'
    case 'resolved':
      return 'finalized'
    case 'dismissed':
      return 'rejected_by_human'
    default:
      return 'draft_generated'
  }
}

export function mapRecommendationStatusToApprovalState(status: string): ApprovalState {
  switch (status) {
    case 'suggested':
      return 'draft_generated'
    case 'under_review':
      return 'under_review'
    case 'accepted':
      return 'approved_by_human'
    case 'rejected':
      return 'rejected_by_human'
    case 'implemented':
      return 'finalized'
    default:
      return 'draft_generated'
  }
}

export function getGovernanceAuditMetadata(
  taskType: GovernanceTaskType,
  provenance: ProvenanceMetadata,
): Record<string, unknown> {
  return {
    governanceTaskType: taskType,
    governanceApprovalState: provenance.approvalState,
    governanceEscalationLevel: provenance.escalationLevel,
    governanceHumanApprovalRequired: provenance.humanApprovalRequired,
    governanceEvidenceCount: provenance.evidenceRequirements.length,
    governanceEvidenceComplete: provenance.evidenceRequirements.filter(e => e.status === 'complete').length,
    governanceEvidenceRequired: provenance.evidenceRequirements.filter(e => e.requiredForApproval).length,
  }
}

export function checkPublicationGovernance(params: {
  engagementStatus: string
  evidenceRequirements: EvidenceRequirement[]
  escalationLevel?: EscalationLevel
  approvedBy?: string
  taskType: GovernanceTaskType
}): { allowed: boolean; reasons: string[] } {
  const provenance = buildProvenanceMetadata({
    taskType: params.taskType,
    approvalState: mapEngagementStatusToApprovalState(params.engagementStatus),
    evidenceRequirements: params.evidenceRequirements,
    escalationLevel: params.escalationLevel,
    approvedBy: params.approvedBy,
  })

  if (!isFinalizationAllowed(provenance)) {
    return { allowed: false, reasons: getApprovalBlockingReasons(provenance) }
  }

  return { allowed: true, reasons: [] }
}

export function evaluateFindingEscalation(severity: string): EscalationResult {
  return evaluateEscalation({
    detectedTriggers:
      severity === 'critical' || severity === 'high' ? ['high_materiality'] : undefined,
  })
}

export function evaluateEvidenceEscalation(evidenceState: string): EscalationResult {
  return evaluateEscalation({
    evidenceStatus:
      evidenceState === 'missing'
        ? 'missing'
        : evidenceState === 'rejected'
          ? 'conflicting'
          : undefined,
  })
}

export function buildEvidenceRequirementsFromEvidenceList(
  evidenceItems: Array<{ state: string }>,
): EvidenceRequirement[] {
  const missingCount = evidenceItems.filter(e => e.state === 'missing').length
  const rejectedCount = evidenceItems.filter(e => e.state === 'rejected').length

  return [
    {
      description: 'All required evidence collected',
      status: missingCount === 0 && rejectedCount === 0 ? 'complete' : 'missing',
      requiredForApproval: true,
    },
    {
      description: 'No evidence rejected',
      status: rejectedCount === 0 ? 'complete' : 'conflicting',
      requiredForApproval: true,
    },
  ]
}
