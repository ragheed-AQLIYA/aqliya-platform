import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState, isFinalizationAllowed } from '../../approval-state';

function runWeakMappingConfidenceExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: Weak Mapping Confidence ===\n');

  const mappingConfidence = 45;
  output.push(`Mapping confidence: ${mappingConfidence}%\n`);

  const context = getGovernanceContext('account_mapping');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.principle}`));
  output.push(`Human approval required: ${context.humanApprovalRequired}\n`);

  const provenance = createDraftProvenance({
    taskType: 'account_mapping',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });

  const escalation = evaluateEscalation({ mappingConfidence });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  output.push('');

  output.push('Approval state checks:');
  output.push(`  AI can finalize: ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  Human can approve: ${canTransitionApprovalState('draft_generated', 'approved_by_human', false)}`);
  output.push(`  Is finalization allowed: ${isFinalizationAllowed(provenance)}\n`);

  const escalated = markEscalated(provenance, escalation.triggers[0]);
  output.push(`Post-escalation: ${explainProvenance(escalated)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('mappingConfidence < 60 → notice level (non-blocking)');
  output.push('Low confidence mappings flagged for reviewer awareness');

  return output.join('\n');
}

console.log(runWeakMappingConfidenceExample());
export { runWeakMappingConfidenceExample };
