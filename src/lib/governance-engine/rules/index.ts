// Governance Engine — Rules Barrel

export { RuleEngine } from './engine';
export type { GovernanceRule, RuleContext } from './base-rule';

export { GR001Rule } from './gr-001-immutable-ids';
export { GR002Rule } from './gr-002-derived-artifacts';
export { GR003Rule } from './gr-003-evidence-manifest';
export { GR004Rule } from './gr-004-glossary-precision';
export { GR005Rule } from './gr-005-three-tier-review';
export { GR006Rule } from './gr-006-decision-preconditions';
export { GR007Rule } from './gr-007-evidence-independence';
export { GR008Rule } from './gr-008-shared-evidence';
export { GR009Rule } from './gr-009-capability-evidence';
export { GR010Rule } from './gr-010-marginal-efficiency';
export { GR011Rule } from './gr-011-quality-preservation';
export { GR012Rule } from './gr-012-historical-consistency';
export { GR013Rule } from './gr-013-conflict-preservation';
