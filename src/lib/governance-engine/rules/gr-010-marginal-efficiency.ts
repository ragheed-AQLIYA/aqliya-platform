import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Claim, Evidence } from '../types/entities';

interface ProductEfficiency {
  productId: string;
  claimCount: number;
  newEvCount: number;
  mk01: number;
  baselineMk01: number | null;
}

export class GR010Rule implements GovernanceRule {
  readonly id = 'GR-010';
  readonly name = 'Marginal Knowledge Efficiency';
  readonly phase = 'pattern';
  readonly severity = 'medium';
  readonly blocking = false;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const baselines: Record<string, number> =
      (context.extensions?.baselines as Record<string, number>) ?? {};

    const products = Array.from(ctx.products.byId.values());
    const claims = Array.from(ctx.claims.byId.values());
    const allEvidence = Array.from(ctx.evidence.byId.values());

    const efficiencyMap = this.computeEfficiencyPerProduct(products, claims, allEvidence, baselines, ctx);

    if (efficiencyMap.size === 0) {
      return this.warn('No products with calculable MK-01 efficiency');
    }

    let hasDegradation = false;

    for (const [prodId, eff] of efficiencyMap) {
      const baselineStr =
        eff.baselineMk01 !== null
          ? `, baseline ${eff.baselineMk01.toFixed(3)}`
          : ', no baseline available';

      findings.push(
        `${prodId}: MK-01 = ${eff.mk01.toFixed(3)} (${eff.claimCount} claims / ${eff.newEvCount} new EV${baselineStr})`,
      );

      if (eff.baselineMk01 !== null && eff.mk01 < eff.baselineMk01 * 0.8) {
        const dropPercent = ((1 - eff.mk01 / eff.baselineMk01) * 100).toFixed(1);
        findings.push(
          `${prodId}: MK-01 dropped by ${dropPercent}% (>20% threshold). Efficiency is decreasing — evidence cost per claim is rising.`,
        );
        hasDegradation = true;
      }
    }

    const status: 'warn' | 'fail' = hasDegradation ? 'fail' : 'warn';

    return {
      ruleId: this.id,
      name: this.name,
      status,
      severity: this.severity,
      blocking: this.blocking,
      findings,
      duration: 0,
    };
  }

  private computeEfficiencyPerProduct(
    products: { id: string }[],
    claims: Claim[],
    evidence: Evidence[],
    baselines: Record<string, number>,
    ctx: import('../context/execution-context').ExecutionContext,
  ): Map<string, ProductEfficiency> {
    const efficiencyMap = new Map<string, ProductEfficiency>();

    for (const product of products) {
      const productClaims = ctx.claims.byProduct.get(product.id) ?? claims.filter((c) => c.product === product.id);
      if (productClaims.length === 0) {
        continue;
      }

      const supportedEvIds = new Set<string>();
      for (const claim of productClaims) {
        for (const ref of claim.evidenceRefs) {
          supportedEvIds.add(ref);
        }
      }

      const newEvIds = this.filterNewEvidence(supportedEvIds, ctx.evidence.byId);

      if (newEvIds.size === 0) {
        continue;
      }

      const mk01 = productClaims.length / newEvIds.size;
      const baselineMk01 = baselines[product.id] !== undefined
        ? baselines[product.id]
        : null;

      efficiencyMap.set(product.id, {
        productId: product.id,
        claimCount: productClaims.length,
        newEvCount: newEvIds.size,
        mk01,
        baselineMk01,
      });
    }

    return efficiencyMap;
  }

  private filterNewEvidence(
    evIdSet: Set<string>,
    evidenceById: Map<string, Evidence>,
  ): Set<string> {
    const newEvIds = new Set<string>();

    for (const evId of evIdSet) {
      const ev = evidenceById.get(evId);
      if (ev === undefined) {
        continue;
      }

      const isReusedShared = ev.reusable && ev.supportsClaims.length > 3;
      if (!isReusedShared) {
        newEvIds.add(evId);
      }
    }

    return newEvIds;
  }

  private warn(detail: string): RuleResult {
    return {
      ruleId: this.id,
      name: this.name,
      status: 'warn',
      severity: this.severity,
      blocking: this.blocking,
      findings: [detail],
      duration: 0,
    };
  }
}
