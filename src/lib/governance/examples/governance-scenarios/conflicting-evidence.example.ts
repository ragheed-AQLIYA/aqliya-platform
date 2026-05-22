import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState, isFinalizationAllowed } from '../../approval-state';
import { EvidenceStatus } from '../../runtime-types';

function runConflictingEvidenceExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: Conflicting Evidence ===\n');

  const evidenceStatus = 'conflicting' as EvidenceStatus;
  output.push(`Evidence status: ${evidenceStatus}\n`);

  const context = getGovernanceContext('evidence_review');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.principle}`));
  output.push(`Human approval required: ${context.humanApprovalRequired}\n`);

  const provenance = createDraftProvenance({
    taskType: 'evidence_review',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });

  const escalation = evaluateEscalation({ evidenceStatus });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Blocked: ${escalation.blocked}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} (${t.level})`));
  output.push('');

  output.push('Approval state checks:');
  output.push(`  AI can finalize: ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  AI can approve: ${canTransitionApprovalState('draft_generated', 'approved_by_human', true)}`);
  output.push(`  Is finalization allowed: ${isFinalizationAllowed(provenance)}\n`);

  const escalated = markEscalated(provenance, escalation.triggers[0]);
  output.push(`Post-escalation: ${explainProvenance(escalated)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('conflicting evidence → review_required');
  output.push('Human must reconcile conflicts before proceeding');

  return output.join('\n');
}

console.log(runConflictingEvidenceExample());
export { runConflictingEvidenceExample };
