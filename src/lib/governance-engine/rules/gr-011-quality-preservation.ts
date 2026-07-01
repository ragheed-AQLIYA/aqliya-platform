import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Claim, Evidence } from '../types/entities';

interface ProductQuality {
  productId: string;
  strongEvCount: number;
  totalEvCount: number;
  highConfidenceClaimCount: number;
  totalClaimCount: number;
  kqi: number;
  baselineKqi: number | null;
}

export class GR011Rule implements GovernanceRule {
  readonly id = 'GR-011';
  readonly name = 'Knowledge Quality Preservation';
  readonly phase = 'pattern';
  readonly severity = 'high';
  readonly blocking = false;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const baselines: Record<string, number> =
      (context.extensions?.kqiBaselines as Record<string, number>) ?? {};

    const products = Array.from(ctx.products.byId.values());
    const claims = Array.from(ctx.claims.byId.values());
    const allEvidence = Array.from(ctx.evidence.byId.values());

    const qualityMap = this.computeQualityPerProduct(products, claims, allEvidence, baselines, ctx);

    if (qualityMap.size === 0) {
      return this.pass('No products with calculable KQI');
    }

    let hasDegradation = false;

    for (const [prodId, q] of qualityMap) {
      const kqiPct = (q.kqi * 100).toFixed(1);
      const baselineStr =
        q.baselineKqi !== null
          ? `, baseline ${(q.baselineKqi * 100).toFixed(1)}%`
          : ', no baseline available';

      findings.push(
        `${prodId}: KQI = ${kqiPct}% (${q.strongEvCount}/${q.totalEvCount} strong EV × ${q.highConfidenceClaimCount}/${q.totalClaimCount} high-confidence claims${baselineStr})`,
      );

      if (q.baselineKqi !== null && q.kqi < q.baselineKqi) {
        const dropPct = ((1 - q.kqi / q.baselineKqi) * 100).toFixed(1);
        findings.push(
          `${prodId}: KQI decreased by ${dropPct}% from baseline. Quality preservation threshold breached.`,
        );
        hasDegradation = true;
      }
    }

    const status: 'pass' | 'fail' = hasDegradation ? 'fail' : 'pass';

    return {
      ruleId: this.id,
      name: this.name,
      status,
      severity: this.severity,
      blocking: this.blocking,
      findings: findings.length > 0 ? findings : ['KQI stable for all products'],
      duration: 0,
    };
  }

  private computeQualityPerProduct(
    products: { id: string }[],
    claims: Claim[],
    evidence: Evidence[],
    baselines: Record<string, number>,
    ctx: import('../context/execution-context').ExecutionContext,
  ): Map<string, ProductQuality> {
    const qualityMap = new Map<string, ProductQuality>();

    for (const product of products) {
      const productClaims = ctx.claims.byProduct.get(product.id) ?? claims.filter((c) => c.product === product.id);
      if (productClaims.length === 0) {
        continue;
      }

      const productEvIds = new Set<string>();
      for (const claim of productClaims) {
        for (const ref of claim.evidenceRefs) {
          productEvIds.add(ref);
        }
      }

      const productEvidence = Array.from(productEvIds)
        .map((evId) => ctx.evidence.byId.get(evId))
        .filter((ev): ev is Evidence => ev !== undefined);
      const totalEvCount = productEvidence.length;

      if (totalEvCount === 0) {
        continue;
      }

      const strongEvCount = productEvidence.filter((ev) => ev.strength === 'Strong').length;
      const totalClaimCount = productClaims.length;
      const highConfidenceClaimCount = productClaims.filter(
        (c) => c.confidence === 'High',
      ).length;

      const strongRatio = strongEvCount / totalEvCount;
      const confidenceRatio = highConfidenceClaimCount / totalClaimCount;
      const kqi = strongRatio * confidenceRatio;

      const baselineKqi = baselines[product.id] !== undefined
        ? baselines[product.id]
        : null;

      qualityMap.set(product.id, {
        productId: product.id,
        strongEvCount,
        totalEvCount,
        highConfidenceClaimCount,
        totalClaimCount,
        kqi,
        baselineKqi,
      });
    }

    return qualityMap;
  }

  private pass(detail: string): RuleResult {
    return {
      ruleId: this.id,
      name: this.name,
      status: 'pass',
      severity: this.severity,
      blocking: this.blocking,
      findings: [detail],
      duration: 0,
    };
  }
}
