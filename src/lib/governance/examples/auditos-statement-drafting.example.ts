/**
 * AuditOS Statement Drafting — Governance Runtime Example
 * 
 * Scenario: Draft financial statements from a mapped trial balance with partial evidence.
 * Expected behavior: Draft-only, review required, escalation if evidence weak.
 */
import { getGovernanceContext } from '../retrieval-router';
import { createDraftProvenance, explainProvenance, markEscalated } from '../provenance';
import { evaluateEscalation } from '../escalation';
import { canTransitionApprovalState, isFinalizationAllowed } from '../approval-state';
import { StatementDraftingPromptInput, EvidenceStatus } from '../runtime-types';

function runStatementDraftingExample(): string {
  const output: string[] = [];
  output.push('=== AuditOS Statement Drafting — Governance Prototype ===\n');

  // 1. Task input
  const input: StatementDraftingPromptInput = {
    accountsMapped: true,
    trialBalanceValidated: true,
    evidenceCompleteness: 'partial' as EvidenceStatus,
    hasPriorPeriodData: true,
    financialPeriod: 'FY 2026',
    accountingStandard: 'IFRS'
  };
  output.push(`Task: Draft financial statements for ${input.financialPeriod} (${input.accountingStandard})`);
  output.push(`Evidence status: ${input.evidenceCompleteness}\n`);

  // 2. Governance context retrieval
  const context = getGovernanceContext('statement_drafting');
  output.push(`Doctrine references: ${context.doctrineReferences.length} documents`);
  context.doctrineReferences.forEach(d => output.push(`  - ${d.documentId}: ${d.principle}`));
  output.push(`Human approval required: ${context.humanApprovalRequired}\n`);

  // 3. Provenance metadata
  const provenance = createDraftProvenance({
    taskType: 'statement_drafting',
    doctrineReferences: context.doctrineReferences,
    governanceReferences: context.governanceReferences,
    evidenceRequirements: context.evidenceRequirements
  });
  output.push('Provenance metadata created:');
  output.push(`  Approval state: ${provenance.approvalState}`);
  output.push(`  Output boundary: ${provenance.outputBoundary}`);
  output.push(`  Review required: ${provenance.reviewRequired}\n`);

  // 4. Evidence status check (partial evidence case)
  if (input.evidenceCompleteness !== 'complete') {
    output.push(`⚠️ Evidence is ${input.evidenceCompleteness} — downstream blocks may apply`);
  }

  // 5. Escalation evaluation
  const escalation = evaluateEscalation({
    evidenceStatus: input.evidenceCompleteness,
    isUnusualTransaction: false
  });
  output.push(`Escalation level: ${escalation.level}`);
  output.push(`Blocked: ${escalation.blocked}`);
  output.push(`Requires human resolution: ${escalation.requiresHumanResolution}`);
  if (escalation.triggers.length > 0) {
    escalation.triggers.forEach(t => output.push(`  Trigger: ${t.trigger} — ${t.message}`));
  }
  output.push('');

  // 6. Approval block check
  output.push('Approval state checks:');
  output.push(`  Can transition draft → finalized (AI attempt): ${canTransitionApprovalState('draft_generated', 'finalized', true)}`);
  output.push(`  Can transition draft → approved_by_human (AI attempt): ${canTransitionApprovalState('draft_generated', 'approved_by_human', true)}`);
  output.push(`  Can transition draft → approved_by_human (human reviewer): ${canTransitionApprovalState('draft_generated', 'approved_by_human', false)}`);
  output.push(`  Is finalization allowed: ${isFinalizationAllowed(provenance)}\n`);

  // 7. If escalated, mark it
  if (escalation.level !== 'none') {
    const escalated = markEscalated(provenance, escalation.triggers[0]);
    output.push(`Post-escalation explainability:`);
    output.push(`  ${explainProvenance(escalated)}`);
  } else {
    output.push(`Explainability: ${explainProvenance(provenance)}`);
  }

  output.push('\n=== Example Complete ===');
  output.push('KEY TAKEAWAYS:');
  output.push('✅ Output is draft-only — requires human review');
  output.push('✅ Evidence status is partial — escalation triggered');
  output.push('✅ AI cannot finalize — blocked by approval state logic');
  output.push('✅ Human approval is required for all professional outputs');
  output.push('✅ Provenance is fully traceable to doctrine and governance');
  
  return output.join('\n');
}

console.log(runStatementDraftingExample());
export { runStatementDraftingExample };
