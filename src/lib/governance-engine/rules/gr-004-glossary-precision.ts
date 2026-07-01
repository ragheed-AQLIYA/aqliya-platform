import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';

const FORBIDDEN_TERMS: [string, string][] = [
  ['Strategic Future', 'Use "Approved", "Deferred", "Frozen", or "Experimental" instead.'],
  ['Planned', 'Use "Approved", "Deferred", "Frozen", or "Experimental" instead.'],
  ['Coming Soon', 'Use explicit status terms. Do not market unbuilt features.'],
  ['Future Product', 'Use explicit status terms. Do not market unbuilt features.'],
];

const FORBIDDEN_PATTERNS: [RegExp, string][] = FORBIDDEN_TERMS.map(
  ([term, guide]) => [new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'iu'), guide] as [RegExp, string]
);

export class GR004Rule implements GovernanceRule {
  readonly id = 'GR-004';
  readonly name = 'Glossary Precision Rule';
  readonly phase = 'identity' as const;
  readonly severity = 'medium' as const;
  readonly blocking = false;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    for (const claim of ctx.claims.byId.values()) {
      const text = claim.claimText;

      for (let i = 0; i < FORBIDDEN_PATTERNS.length; i++) {
        const [pattern, guidance] = FORBIDDEN_PATTERNS[i];
        if (pattern.test(text)) {
          findings.push(
            `Claim "${claim.id}" contains forbidden term "${FORBIDDEN_TERMS[i][0]}". ${guidance}`
          );
        }
      }
    }

    return {
      ruleId: this.id,
      name: this.name,
      status: findings.length === 0 ? 'pass' : 'warn',
      severity: this.severity,
      blocking: this.blocking,
      findings,
      duration: 0,
    };
  }
}
