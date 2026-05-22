import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState } from '../../approval-state';
import { ProvenanceMetadata, EscalationTrigger } from '../../runtime-types';

function runReviewerDisagreementExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: Reviewer Disagreement ===\n');

  const context = getGovernanceContext('evidence_review');
  const provenance = createDraftProvenance({
    taskType: 'evidence_review',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });
  output.push(`Initial state: ${provenance.approvalState}\n`);

  // Simulate human rejection
  const rejectedProvenance: ProvenanceMetadata = {
    ...provenance,
    approvalState: 'rejected_by_human',
    reviewedBy: 'Senior Reviewer',
    rejectionReason: 'Material misstatement in revenue recognition evidence',
    explainabilityMessage: 'Rejected by human reviewer: Senior Reviewer'
  };
  output.push('After human rejection:');
  output.push(`  Approval state: ${rejectedProvenance.approvalState}`);
  output.push(`  Rejection reason: ${rejectedProvenance.rejectionReason}`);
  output.push(`  Reviewed by: ${rejectedProvenance.reviewedBy}\n`);

  const escalation = evaluateEscalation({
    detectedTriggers: ['reviewer_disagreement' as EscalationTrigger]
  });
  output.push(`Escalation level: ${escalation.level}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  output.push('');

  output.push('Approval state checks from rejected:');
  output.push(`  AI rejected → finalized: ${canTransitionApprovalState('rejected_by_human', 'finalized', true)}`);
  output.push(`  Human rejected → approved: ${canTransitionApprovalState('rejected_by_human', 'approved_by_human', false)}`);
  output.push(`  Human rejected → finalized: ${canTransitionApprovalState('rejected_by_human', 'finalized', false)}\n`);

  output.push(`Explainability: ${explainProvenance(rejectedProvenance)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('Human rejection moves state to rejected_by_human');
  output.push('AI cannot override rejection; only human can re-approve');
  output.push('reviewer_disagreement trigger recorded in escalation log');

  return output.join('\n');
}

console.log(runReviewerDisagreementExample());
export { runReviewerDisagreementExample };
