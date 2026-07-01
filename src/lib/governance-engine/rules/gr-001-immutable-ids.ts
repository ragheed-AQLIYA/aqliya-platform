import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';
import { ID_PATTERNS } from '../types/identifiers';

interface PatternEntry {
  label: string;
  pattern: RegExp;
  ids: string[];
}

export class GR001Rule implements GovernanceRule {
  readonly id = 'GR-001';
  readonly name = 'Immutable IDs Rule';
  readonly phase = 'structural' as const;
  readonly severity = 'critical' as const;
  readonly blocking = true;

  private collectEntries(ctx: ExecutionContext): PatternEntry[] {
    return [
      {
        label: 'Product',
        pattern: ID_PATTERNS.PRODUCT,
        ids: Array.from(ctx.products.byId.keys()),
      },
      {
        label: 'Claim',
        pattern: ID_PATTERNS.CLAIM,
        ids: Array.from(ctx.claims.byId.keys()),
      },
      {
        label: 'Evidence',
        pattern: ID_PATTERNS.EVIDENCE,
        ids: Array.from(ctx.evidence.byId.keys()),
      },
      {
        label: 'Source',
        pattern: ID_PATTERNS.SOURCE,
        ids: Array.from(ctx.sources.byId.keys()),
      },
      {
        label: 'Authority',
        pattern: ID_PATTERNS.AUTHORITY,
        ids: Array.from(ctx.authorities.byId.keys()),
      },
      {
        label: 'Decision',
        pattern: ID_PATTERNS.DECISION,
        ids: Array.from(ctx.decisions.byId.keys()),
      },
      {
        label: 'Review',
        pattern: ID_PATTERNS.REVIEW,
        ids: ctx.registries.reviews.map(r => r.id),
      },
      {
        label: 'Finding',
        pattern: ID_PATTERNS.FINDING,
        ids: ctx.registries.findings.map(f => f.id),
      },
      {
        label: 'KnowledgeArea',
        pattern: ID_PATTERNS.KNOWLEDGE_AREA,
        ids: ctx.registries.knowledgeAreas.map(k => k.id),
      },
    ];
  }

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;
    const entries = this.collectEntries(ctx);

    for (const entry of entries) {
      for (const id of entry.ids) {
        if (!entry.pattern.test(id)) {
          findings.push(`${entry.label} ID "${id}" does not match expected pattern ${entry.pattern}`);
        }
      }
    }

    return {
      ruleId: this.id,
      name: this.name,
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: this.severity,
      blocking: this.blocking,
      findings,
      duration: 0,
    };
  }
}
