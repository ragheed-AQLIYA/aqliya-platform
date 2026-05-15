import { EscalationLevel, EscalationTrigger } from '../runtime-types';

export function getEscalationRecommendation(level: EscalationLevel): string {
  const recommendations: Record<EscalationLevel, string> = { none: 'No action required.', notice: 'Monitor this item.', review_required: 'Review required before proceeding.', senior_review_required: 'Senior reviewer required.', blocked: 'This item is blocked. Escalate to governance team.' };
  return recommendations[level] || 'Review recommended.';
}

export function getTriggerDescription(trigger: EscalationTrigger): string {
  const descriptions: Record<EscalationTrigger, string> = {
    missing_evidence: 'Supporting evidence has not been provided.',
    weak_evidence: 'Available evidence may not be sufficient.',
    conflicting_evidence: 'Multiple evidence sources conflict.',
    low_mapping_confidence: 'Account mapping confidence is low.',
    unsupported_accounting_treatment: 'The requested treatment is not supported.',
    governance_ambiguity: 'Governance requirements are unclear.',
    commercial_overclaim_risk: 'Commercial claim may overstate maturity.',
    approval_bypass_attempt: 'An attempt to bypass approval was detected.',
    reviewer_disagreement: 'Reviewer has disagreed with the recommendation.',
    high_materiality: 'This item has high materiality.',
    unusual_transaction: 'Transaction pattern is unusual.',
    policy_conflict: 'The action conflicts with documented policy.',
  };
  return descriptions[trigger] || 'Review trigger.';
}
