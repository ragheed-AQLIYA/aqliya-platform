import { GovernanceRegistries, Evidence } from '../types/entities';
import { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

const ALL_TIERS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export class CoverageGenerator {
  generate(registries: GovernanceRegistries, context?: ExecutionContext): { content: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);

    const evidenceMap = ctx.evidence.byId;

    const productClaims = ctx.claims.byProduct;

    const productEvidence = new Map<string, Evidence[]>();
    const evidenceProducts = new Map<string, Set<string>>();

    for (const [prodId, claims] of productClaims) {
      const seen = new Map<string, Evidence>();
      for (const claim of claims) {
        for (const ref of claim.evidenceRefs) {
          const ev = evidenceMap.get(ref);
          if (ev && !seen.has(ev.id)) {
            seen.set(ev.id, ev);
            const prodSet = evidenceProducts.get(ev.id);
            if (prodSet) {
              prodSet.add(prodId);
            } else {
              evidenceProducts.set(ev.id, new Set([prodId]));
            }
          }
        }
      }
      productEvidence.set(prodId, [...seen.values()]);
    }

    const totalEvidence = registries.evidence.length;
    const sharedEvidenceCount = [...evidenceProducts.values()].filter(
      (s) => s.size > 1
    ).length;
    const globalReusePct = totalEvidence > 0
      ? ((sharedEvidenceCount / totalEvidence) * 100).toFixed(1)
      : '0.0';

    const sortedProductIds = [...ctx.sortedProductIds];
    if (sortedProductIds.length === 0) {
      sortedProductIds.push(...registries.products.map((p) => p.id).sort((a, b) => a.localeCompare(b)));
    }

    const lines: string[] = [
      '# Coverage Matrix',
      '',
      '| Product | T1 | T2 | T3 | T4 | T5 | T6 | T7 | Strong | Moderate | Weak | Reuse % |',
      '|---------|----|----|----|----|----|----|----|--------|----------|------|---------|',
    ];

    for (const productId of sortedProductIds) {
      const product = ctx.products.byId.get(productId)!;
      const evs = productEvidence.get(productId) ?? [];

      const tierScores = new Map<string, number[]>();
      for (const tier of ALL_TIERS) {
        tierScores.set(tier, []);
      }
      for (const ev of evs) {
        const bucket = tierScores.get(ev.tier);
        if (bucket) {
          bucket.push(ev.score);
        }
      }

      const tierAverages = ALL_TIERS.map((tier) => {
        const scores = tierScores.get(tier)!;
        if (scores.length === 0) return '-';
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return avg.toFixed(1);
      });

      let strong = 0;
      let moderate = 0;
      let weak = 0;
      for (const ev of evs) {
        if (ev.strength === 'Strong') strong++;
        else if (ev.strength === 'Moderate') moderate++;
        else if (ev.strength === 'Weak') weak++;
      }

      const prodSharedCount = evs.filter(
        (ev) => (evidenceProducts.get(ev.id)?.size ?? 1) > 1
      ).length;
      const reusePct = evs.length > 0
        ? ((prodSharedCount / evs.length) * 100).toFixed(1)
        : '0.0';

      lines.push(
        `| ${product.id} | ${tierAverages.join(' | ')} | ${strong} | ${moderate} | ${weak} | ${reusePct}% |`
      );
    }

    lines.push('');
    lines.push(`**Cross-Product Reuse Ratio (Global):** ${globalReusePct}%`);
    lines.push(`**Total Evidence:** ${totalEvidence} | **Shared Across Products:** ${sharedEvidenceCount}`);

    return { content: lines.join('\n') };
  }
}
