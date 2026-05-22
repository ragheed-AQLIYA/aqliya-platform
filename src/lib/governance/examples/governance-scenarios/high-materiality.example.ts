import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState, isFinalizationAllowed } from '../../approval-state';
import { AuditFindingPromptInput, EscalationTrigger } from '../../runtime-types';

function runHighMaterialityExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: High Materiality Audit Finding ===\n');

  const input: AuditFindingPromptInput = {
    findingType: 'revenue_recognition',
    severity: 'high',
    evidenceLinked: true,
    evidenceSufficient: true
  };
  output.push(`Finding type: ${input.findingType}`);
  output.push(`Severity: ${input.severity}`);
  output.push(`Evidence linked: ${input.evidenceLinked}\n`);

  const context = getGovernanceContext('audit_findings');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.principle}`));
  output.push(`Human approval required: ${context.humanApprovalRequired}\n`);

  const provenance = createDraftProvenance({
    taskType: 'audit_findings',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });

  const escalation = evaluateEscalation({
    detectedTriggers: ['high_materiality' as EscalationTrigger]
  });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  output.push('');

  output.push('Approval state checks:');
  output.push(`  AI can finalize: ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  Is finalization allowed: ${isFinalizationAllowed(provenance)}\n`);

  const escalated = markEscalated(provenance, escalation.triggers[0]);
  output.push(`Post-escalation: ${explainProvenance(escalated)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('high_materiality → senior_review_required');
  output.push('High-severity findings require senior reviewer authority');

  return output.join('\n');
}

console.log(runHighMaterialityExample());
export { runHighMaterialityExample };
