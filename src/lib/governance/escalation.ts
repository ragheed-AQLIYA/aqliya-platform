import { EscalationResult, EscalationLevel, EscalationTrigger, EscalationRecord, EvidenceStatus } from './runtime-types';

const ESCALATION_PRIORITY: Record<EscalationTrigger, EscalationLevel> = {
  missing_evidence: 'review_required',
  weak_evidence: 'review_required',
  conflicting_evidence: 'review_required',
  low_mapping_confidence: 'notice',
  unsupported_accounting_treatment: 'senior_review_required',
  governance_ambiguity: 'review_required',
  commercial_overclaim_risk: 'senior_review_required',
  approval_bypass_attempt: 'blocked',
  reviewer_disagreement: 'review_required',
  high_materiality: 'senior_review_required',
  unusual_transaction: 'notice',
  policy_conflict: 'senior_review_required'
};

export function evaluateEscalation(input: { evidenceStatus?: EvidenceStatus; mappingConfidence?: number; isUnusualTransaction?: boolean; detectedTriggers?: EscalationTrigger[] }): EscalationResult {
  const triggers: EscalationRecord[] = [];
  
  // Auto-detect triggers from input
  if (input.evidenceStatus && ['missing','weak','conflicting','unverifiable'].includes(input.evidenceStatus)) {
    triggers.push({ trigger: `${input.evidenceStatus}_evidence` as EscalationTrigger, level: 'review_required', message: `Evidence is ${input.evidenceStatus} — requires review`, timestamp: new Date().toISOString() });
  }
  if (input.mappingConfidence !== undefined && input.mappingConfidence < 60) {
    triggers.push({ trigger: 'low_mapping_confidence', level: 'notice', message: `Mapping confidence is ${input.mappingConfidence}% — recommended for review`, timestamp: new Date().toISOString() });
  }
  if (input.isUnusualTransaction) {
    triggers.push({ trigger: 'unusual_transaction', level: 'notice', message: 'Unusual transaction pattern detected', timestamp: new Date().toISOString() });
  }
  if (input.detectedTriggers) {
    for (const t of input.detectedTriggers) {
      triggers.push({ trigger: t, level: ESCALATION_PRIORITY[t], message: `Triggered: ${t}`, timestamp: new Date().toISOString() });
    }
  }
  
  const maxLevel = getMaxEscalationLevel(triggers.map(t => t.level));
  const blocked = maxLevel === 'blocked';
  
  const message = blocked ? 'This task is blocked and requires governance review.' : `Escalation level: ${maxLevel}. ${triggers.length} trigger(s) active.`;
  
  return { level: maxLevel, triggers, requiresHumanResolution: maxLevel !== 'none' && maxLevel !== 'notice', blocked, message };
}

function getMaxEscalationLevel(levels: EscalationLevel[]): EscalationLevel {
  const order: EscalationLevel[] = ['none', 'notice', 'review_required', 'senior_review_required', 'blocked'];
  let max = 'none' as EscalationLevel;
  for (const l of levels) {
    if (order.indexOf(l) > order.indexOf(max)) max = l;
  }
  return max;
}

export function getEscalationLevel(triggers: EscalationTrigger[]): EscalationLevel {
  if (triggers.length === 0) return 'none';
  const levels = triggers.map(t => ESCALATION_PRIORITY[t] || 'review_required');
  return getMaxEscalationLevel(levels);
}

export function getEscalationMessage(result: EscalationResult): string {
  if (result.blocked) return `⚠️ BLOCKED: ${result.message}`;
  if (result.level === 'senior_review_required') return `🔴 Senior review required: ${result.message}`;
  if (result.level === 'review_required') return `🟡 Review required: ${result.message}`;
  if (result.level === 'notice') return `🔵 Notice: ${result.message}`;
  return result.message;
}

export function requiresHumanResolution(result: EscalationResult): boolean {
  return result.requiresHumanResolution;
}
