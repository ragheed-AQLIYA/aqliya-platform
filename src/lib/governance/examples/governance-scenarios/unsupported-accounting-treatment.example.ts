import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState } from '../../approval-state';
import { EscalationTrigger } from '../../runtime-types';

function runUnsupportedAccountingTreatmentExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: Unsupported Accounting Treatment ===\n');

  const context = getGovernanceContext('statement_drafting');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.principle}`));
  output.push(`Human approval required: ${context.humanApprovalRequired}\n`);

  const provenance = createDraftProvenance({
    taskType: 'statement_drafting',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });

  const escalation = evaluateEscalation({
    detectedTriggers: ['unsupported_accounting_treatment' as EscalationTrigger]
  });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Blocked: ${escalation.blocked}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  output.push('');

  output.push('Approval state checks:');
  output.push(`  AI can finalize: ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  AI can approve: ${canTransitionApprovalState('draft_generated', 'approved_by_human', true)}\n`);

  const escalated = markEscalated(provenance, escalation.triggers[0]);
  output.push(`Post-escalation: ${explainProvenance(escalated)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('unsupported_accounting_treatment → senior_review_required');
  output.push('Non-standard treatment flagged; senior authority mandated');

  return output.join('\n');
}

console.log(runUnsupportedAccountingTreatmentExample());
export { runUnsupportedAccountingTreatmentExample };
