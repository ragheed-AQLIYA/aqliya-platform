import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';

export class GR003Rule implements GovernanceRule {
  readonly id = 'GR-003';
  readonly name = 'Evidence Manifest Rule';
  readonly phase = 'identity' as const;
  readonly severity = 'critical' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;
    const { manifests } = context.registries;

    const matDecisions = ctx.decisions.activeMAT;

    const manifestProductIds = new Set(manifests.map(m => m.productId));

    for (const decision of matDecisions) {
      const productIds = new Set<string>();

      for (const claimRef of decision.affectedClaims) {
        const clm = ctx.claims.byId.get(claimRef);
        if (clm) {
          productIds.add(clm.product);
        } else {
          findings.push(
            `Decision "${decision.id}" (MAT) references unknown claim "${claimRef}". Cannot verify manifest coverage.`
          );
        }
      }

      if (productIds.size === 0) {
        findings.push(
          `Decision "${decision.id}" (MAT) has no resolvable product claims. Cannot verify manifest existence.`
        );
        continue;
      }

      for (const productId of productIds) {
        if (!manifestProductIds.has(productId)) {
          findings.push(
            `Decision "${decision.id}" (MAT) affects product "${productId}" but no manifest exists in the registry for this product.`
          );
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
