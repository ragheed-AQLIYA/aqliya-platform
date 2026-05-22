import { getGovernanceContext } from '../../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../../provenance';
import { evaluateEscalation } from '../../escalation';
import { canTransitionApprovalState } from '../../approval-state';
import { CommercialClaimPromptInput, EscalationTrigger } from '../../runtime-types';

function runCommercialOverclaimExample(): string {
  const output: string[] = [];
  output.push('=== Scenario: Commercial Overclaim Risk ===\n');

  const input: CommercialClaimPromptInput = {
    claimType: 'readiness_assessment',
    targetAudience: 'prospective_client',
    isPilotResult: true,
    hasEvidenceSupport: false
  };
  output.push(`Claim type: ${input.claimType}`);
  output.push(`Pilot result: ${input.isPilotResult}`);
  output.push(`Evidence support: ${input.hasEvidenceSupport}\n`);

  const context = getGovernanceContext('commercial_claim_review');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.title}`));
  output.push(`Output boundary: ${context.outputBoundary}\n`);

  const provenance = createDraftProvenance({
    taskType: 'commercial_claim_review',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });

  const escalation = evaluateEscalation({
    detectedTriggers: ['commercial_overclaim_risk' as EscalationTrigger]
  });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  output.push('');

  output.push('Approval state checks:');
  output.push(`  AI can finalize: ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  Human can approve: ${canTransitionApprovalState('draft_generated', 'approved_by_human', false)}\n`);

  const escalated = markEscalated(provenance, escalation.triggers[0]);
  output.push(`Post-escalation: ${explainProvenance(escalated)}`);

  output.push('\n=== KEY TAKEAWAYS ===');
  output.push('commercial_overclaim_risk → senior_review_required');
  output.push('Boundary enforcement prevents overstating product maturity');

  return output.join('\n');
}

console.log(runCommercialOverclaimExample());
export { runCommercialOverclaimExample };
