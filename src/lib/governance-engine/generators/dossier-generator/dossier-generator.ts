import { hashContent } from '../../shared/hash';
import {
  type GovernanceRegistries,
  type Product,
  type Claim,
  type Evidence,
} from '../../types/entities';
import { ExecutionContext } from '../../context/execution-context';
import { ExecutionContextBuilder } from '../../context/builder';
import { buildHeader } from './header';
import { buildExecutiveSummary } from './executive-summary';
import { buildProductIdentity } from './product-identity';
import { buildStrategicIntent } from './strategic-intent';
import { buildClaimSummary } from './claim-summary';
import { buildEvidenceSummary } from './evidence-summary';
import { buildDoDRubric } from './dod-rubric';
import { buildGovernanceRecommendation } from './governance-recommendation';
import { buildAppendices } from './appendices';

export class DossierGenerator {
  generate(
    productId: string,
    _manifestContent: string,
    manifestHash: string,
    registries: GovernanceRegistries,
    context?: ExecutionContext,
  ): { content: string; hash: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const product = this.findProduct(productId, registries, ctx);
    const claims = this.getSortedClaims(product.id, registries, ctx);
    const evidence = this.getSortedEvidence(claims, registries, ctx);
    const content = this.buildDossierContent(
      product,
      claims,
      evidence,
      manifestHash,
      registries,
      ctx,
    );
    const hash = hashContent(content);
    return { content, hash };
  }

  private findProduct(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Product {
    const product = ctx.products.byId.get(productId) ?? registries.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`DossierGenerator: Product not found — ${productId}`);
    }
    return product;
  }

  private getSortedClaims(productId: string, registries: GovernanceRegistries, ctx: ExecutionContext): Claim[] {
    return ctx.claims.byProduct.get(productId) ?? registries.claims
      .filter((c) => c.product === productId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  private getSortedEvidence(claims: Claim[], registries: GovernanceRegistries, ctx: ExecutionContext): Evidence[] {
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

  private buildDossierContent(
    product: Product,
    claims: Claim[],
    evidence: Evidence[],
    manifestHash: string,
    registries: GovernanceRegistries,
    ctx: ExecutionContext,
  ): string {
    const segments: string[] = [];

    segments.push(buildHeader(product));
    segments.push(buildExecutiveSummary(product, claims, evidence));
    segments.push(buildProductIdentity(product));
    segments.push(buildStrategicIntent(product, registries, ctx));
    segments.push(buildClaimSummary(claims));
    segments.push(buildEvidenceSummary(evidence));
    segments.push(buildDoDRubric(product, claims, evidence));
    segments.push(buildGovernanceRecommendation(product, claims, evidence));
    segments.push(buildAppendices(product, claims, evidence, manifestHash, registries, ctx));

    return segments.join('\n\n') + '\n';
  }
}
