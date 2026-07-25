import { hashContent } from '../../shared/hash';
import {
  type Claim,
  type Evidence,
  type GovernanceRegistries,
  type Product,
} from '../../types/entities';
import { ExecutionContext } from '../../context/execution-context';
import { ExecutionContextBuilder } from '../../context/builder';
import { buildProductIdentity } from './product-identity';
import { buildClaimsTable } from './claims-table';
import { buildEvidenceCoverageTable } from './evidence-table';
import { computeIntegrityScores, buildIntegrityScoreSection } from './integrity-scores';
import { buildDependencyGraph } from './dependency-graph';
import { buildFreshnessSection } from './freshness';

export class ManifestGenerator {
  generate(
    productId: string,
    registries: GovernanceRegistries,
    context?: ExecutionContext,
  ): { content: string; hash: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const product = this.findProduct(productId, registries, ctx);
    const claims = this.getProductClaims(product.id, registries, ctx);
    const evidence = this.getProductEvidence(claims, registries, ctx);
    const content = this.buildManifestContent(product, claims, evidence, registries, ctx);
    const hash = hashContent(content);
    return { content, hash };
  }

  private findProduct(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Product {
    const product = ctx.products.byId.get(productId) ?? registries.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`ManifestGenerator: Product not found — ${productId}`);
    }
    return product;
  }

  private getProductClaims(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Claim[] {
    return ctx.claims.byProduct.get(productId) ?? registries.claims
      .filter((c) => c.product === productId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private getProductEvidence(claims: Claim[], registries: GovernanceRegistries, ctx: ExecutionContext): Evidence[] {
    const evIds = new Set<string>();
    for (const claim of claims) {
      for (const ref of claim.evidenceRefs) {
        evIds.add(ref);
      }
    }
    if (ctx.evidence.byId.size >= registries.evidence.length) {
      const result: Evidence[] = [];
      for (const id of evIds) {
        const ev = ctx.evidence.byId.get(id);
        if (ev) result.push(ev);
      }
      return result.sort((a, b) => a.id.localeCompare(b.id));
    }
    return registries.evidence
      .filter((ev) => evIds.has(ev.id))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private buildManifestContent(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): string {
    const segments: string[] = [];

    segments.push(buildProductIdentity(product));
    segments.push(buildClaimsTable(claims));
    segments.push(buildEvidenceCoverageTable(evidence));

    const scores = computeIntegrityScores(product, claims, evidence, registries, ctx);
    segments.push(buildIntegrityScoreSection(scores));

    segments.push(buildDependencyGraph(product, registries, ctx));
    segments.push(buildFreshnessSection(evidence));

    return segments.join('\n\n') + '\n';
  }
}
