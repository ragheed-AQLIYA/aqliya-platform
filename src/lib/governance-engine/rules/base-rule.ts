// Governance Engine — Base Rule Interface
// All GR rules implement this interface

import { GovernanceRegistries } from '../types/entities';
import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';

export interface RuleContext {
  registries: GovernanceRegistries;
  /** @deprecated Use `context` instead — provides indexes, chains, graph, metrics */
  extensions?: Record<string, unknown>;
  /** Centralized, immutable, indexed governance data — CR-04 */
  context: ExecutionContext;
}

export interface GovernanceRule {
  readonly id: string;
  readonly name: string;
  readonly phase: 'structural' | 'identity' | 'integrity' | 'pattern' | 'historical';
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly blocking: boolean;

  validate(context: RuleContext): Promise<RuleResult> | RuleResult;
}
