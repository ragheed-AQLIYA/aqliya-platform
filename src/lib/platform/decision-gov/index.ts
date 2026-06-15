export {
  DecisionGovError,
  checkGate,
  approve,
  reject,
  exportDecision,
  archiveDecision,
  createEscalationRule,
  getActiveEscalations,
  processEscalations,
  getDecisionEventLog,
} from './decision-gov-service'
// submitForReview intentionally omitted — conflicts with model-governance; use decision-gov-service directly

export type {
  GovAction,
  GateResult,
  DecisionGovEvent,
  EscalationCheck,
  CreateEscalationRuleData,
} from './decision-gov-service'

export { GOV_STRINGS } from './gov-strings'
