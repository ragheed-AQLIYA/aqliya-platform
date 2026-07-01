import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';

interface ProductRoleMap {
  reviewers: Set<string>;
  authorities: Set<string>;
}

export class GR005Rule implements GovernanceRule {
  readonly id = 'GR-005';
  readonly name = 'Three-tier Review Separation';
  readonly phase = 'identity' as const;
  readonly severity = 'critical' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const productRoles = new Map<string, ProductRoleMap>();
    for (const product of ctx.products.byId.values()) {
      productRoles.set(product.id, { reviewers: new Set(), authorities: new Set() });
    }

    for (const ev of ctx.evidence.byId.values()) {
      const reviewerId = ev.freshness.reviewer;
      if (!reviewerId) continue;

      for (const claimRef of ev.supportsClaims) {
        const clm = ctx.claims.byId.get(claimRef);
        if (clm && productRoles.has(clm.product)) {
          productRoles.get(clm.product)!.reviewers.add(reviewerId);
        }
      }
    }

    for (const decision of ctx.decisions.byId.values()) {
      const authorityId = decision.authority;
      if (!authorityId) continue;

      for (const claimRef of decision.affectedClaims) {
        const clm = ctx.claims.byId.get(claimRef);
        if (clm && productRoles.has(clm.product)) {
          productRoles.get(clm.product)!.authorities.add(authorityId);
        }
      }
    }

    for (const [productId, roles] of productRoles) {
      for (const reviewerId of roles.reviewers) {
        if (roles.authorities.has(reviewerId)) {
          findings.push(
            `Agent "${reviewerId}" appears as both an evidence reviewer and a decision authority for product "${productId}". ` +
            `Three-tier review separation violated: evidence production and L-level decision must be independent.`
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
