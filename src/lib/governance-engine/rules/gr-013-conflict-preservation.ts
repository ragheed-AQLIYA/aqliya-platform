import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Product, Claim, Dimension } from '../types/entities';

interface DimensionSpan {
  productId: string;
  productName: string;
  dimensions: Dimension[];
  claimCount: number;
  claimsByDimension: Map<Dimension, string[]>;
}

export class GR013Rule implements GovernanceRule {
  readonly id = 'GR-013';
  readonly name = 'Governance Conflict Preservation';
  readonly phase = 'historical' as const;
  readonly severity = 'critical' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const disputedProducts = ctx.products.disputed;
    if (disputedProducts.length === 0) {
      return this.pass('No products with Disputed L-level status to validate');
    }

    const allClaims = Array.from(ctx.claims.byId.values());
    const allDecisions = Array.from(ctx.decisions.byId.values());

    const dimensionSpans = this.buildDimensionSpans(disputedProducts, allClaims, ctx);

    for (const span of dimensionSpans) {
      this.checkDisputedProductHasConflict(span, findings);
      this.checkAllConflictingClaimsPreserved(span, allClaims, allDecisions, findings, ctx);
    }

    this.checkProductsWithDimensionalGaps(Array.from(ctx.products.byId.values()), allClaims, findings);

    const status: 'pass' | 'fail' = findings.length === 0 ? 'pass' : 'fail';

    return {
      ruleId: this.id,
      name: this.name,
      status,
      severity: this.severity,
      blocking: this.blocking,
      findings:
        findings.length > 0
          ? findings
          : ['All conflicting claims are preserved for Disputed products'],
      duration: 0,
    };
  }

  private buildDimensionSpans(
    disputedProducts: Product[],
    claims: Claim[],
    ctx: import('../context/execution-context').ExecutionContext,
  ): DimensionSpan[] {
    const spans: DimensionSpan[] = [];

    for (const product of disputedProducts) {
      const productClaims = ctx.claims.byProduct.get(product.id) ?? claims.filter((c) => c.product === product.id);
      const claimsByDimension = new Map<Dimension, string[]>();

      for (const claim of productClaims) {
        const dim = claim.dimension as Dimension;
        const existing = claimsByDimension.get(dim);
        if (existing !== undefined) {
          existing.push(claim.id);
        } else {
          claimsByDimension.set(dim, [claim.id]);
        }
      }

      spans.push({
        productId: product.id,
        productName: product.name,
        dimensions: Array.from(claimsByDimension.keys()),
        claimCount: productClaims.length,
        claimsByDimension,
      });
    }

    return spans;
  }

  private checkDisputedProductHasConflict(
    span: DimensionSpan,
    findings: string[],
  ): void {
    if (span.dimensions.length < 2) {
      findings.push(
        `Product ${span.productId} (${span.productName}) has L-level status "Disputed" but claims exist in only one dimension [${span.dimensions[0]}]. ` +
          'Disputed products must have claims in multiple dimensions to demonstrate conflict across L-level assessments.',
      );
    }

    let hasConflictingEvidence = false;
    for (const [, claimIds] of span.claimsByDimension) {
      for (const _claimId of claimIds) {
        void _claimId;
      }
      if (claimIds.length >= 2) {
        hasConflictingEvidence = true;
      }
    }

    if (!hasConflictingEvidence && span.claimCount > 0) {
      const dimDetail = span.dimensions
        .map((d) => `${d}: ${(span.claimsByDimension.get(d) ?? []).length} claims`)
        .join('; ');
      findings.push(
        `Product ${span.productId} is Disputed but each dimension has only a single claim (${dimDetail}). ` +
          'A Disputed product must have substantive evidence of conflict across dimensions.',
      );
    }
  }

  private checkAllConflictingClaimsPreserved(
    span: DimensionSpan,
    claims: Claim[],
    decisions: { id: string; affectedClaims: string[]; supersedes?: string; supersededBy?: string }[],
    findings: string[],
    ctx: import('../context/execution-context').ExecutionContext,
  ): void {
    const productClaims = ctx.claims.byProduct.get(span.productId) ?? claims.filter((c) => c.product === span.productId);

    const allDecisionClaimRefs = new Set<string>();
    for (const decision of decisions) {
      for (const ac of decision.affectedClaims) {
        allDecisionClaimRefs.add(ac);
      }
    }

    for (const claim of productClaims) {
      const refs = claim.historicalRefs ?? [];
      for (const historicalRef of refs) {
        const existsInClaims = ctx.claims.byId.has(historicalRef);
        const existsInDecisionRefs = allDecisionClaimRefs.has(historicalRef);

        if (!existsInClaims && !existsInDecisionRefs) {
          findings.push(
            `Claim ${claim.id} references historicalRef "${historicalRef}" but no matching claim or decision reference exists. ` +
              `This may indicate a deleted claim that contributed to a dimensional conflict in product ${span.productId}. All conflicting claims must be preserved.`,
          );
        }
      }
    }

    if (productClaims.length <= 1 && span.dimensions.length === 1) {
      findings.push(
        `Product ${span.productId} has only ${productClaims.length} claim(s) across 1 dimension but its L-level status is Disputed. ` +
          'Too few claims to demonstrate dimensional conflict. Additional claims may have been removed.',
      );
    }

    const decisionsForProduct = decisions.filter((d) =>
      d.affectedClaims.some((ac) => productClaims.some((pc) => pc.id === ac)),
    );

    for (const decision of decisionsForProduct) {
      if (decision.supersedes !== undefined) {
        const supersededClaim = productClaims.find(
          (c) => c.id === decision.supersedes,
        );
        const supersededExistsElsewhere = ctx.claims.byId.has(decision.supersedes);

        if (supersededClaim === undefined && !supersededExistsElsewhere) {
          findings.push(
            `Decision ${decision.id} supersedes "${decision.supersedes}" which affects product ${span.productId} but the superseded claim is missing from the registry. ` +
              'Superseded claims that are part of a dimensional conflict must be preserved for auditability.',
          );
        }
      }
    }
  }

  private checkProductsWithDimensionalGaps(
    allProducts: Product[],
    allClaims: Claim[],
    findings: string[],
  ): void {
    for (const product of allProducts) {
      if (product.lLevelStatus === 'Disputed') {
        continue;
      }

      const productDims = new Set(
        allClaims
          .filter((c) => c.product === product.id)
          .map((c) => c.dimension as Dimension),
      );

      const expectedDimensions: Dimension[] = [
        'Implementation Reality',
        'Product Maturity',
        'Commercial Claim',
        'Strategic Intent',
      ];

      const knownDims = productDims;
      if (knownDims.size < 2 && product.entityType === 'Engine') {
        const dimList = Array.from(knownDims).join(', ');
        findings.push(
          `Engine product ${product.id} has claims in fewer than 2 dimensions (current: [${dimList}]). ` +
            'Engine products should have claims across multiple dimensions to surface potential conflicts. ' +
            'Consider whether dimensional claims have been suppressed.',
        );
      }
    }
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
