import { GovernanceRegistries, Evidence } from '../types/entities';
import { parseDate } from '../shared/date';
import { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

export interface ProductFreshness {
  fresh: number;
  expiring: number;
  expired: number;
}

export class FreshnessGenerator {
  generate(registries: GovernanceRegistries, context?: ExecutionContext): { content: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const now = new Date();

    const claimProductMap = new Map<string, string>();
    for (const claim of ctx.claims.byId.values()) {
      claimProductMap.set(claim.id, claim.product);
    }
    if (claimProductMap.size === 0) {
      for (const claim of registries.claims) {
        claimProductMap.set(claim.id, claim.product);
      }
    }

    const productEvidence = new Map<string, Evidence[]>();
    for (const ev of registries.evidence) {
      const productsAdded = new Set<string>();
      for (const claimRef of ev.supportsClaims) {
        const prodId = claimProductMap.get(claimRef);
        if (prodId && !productsAdded.has(prodId)) {
          productsAdded.add(prodId);
          const existing = productEvidence.get(prodId);
          if (existing) {
            existing.push(ev);
          } else {
            productEvidence.set(prodId, [ev]);
          }
        }
      }
    }

    const sortedProductIds = [...ctx.sortedProductIds];
    if (sortedProductIds.length === 0) {
      sortedProductIds.push(...registries.products.map((p) => p.id).sort((a, b) => a.localeCompare(b)));
    }

    const lines: string[] = [
      '# Freshness Report',
      '',
      '| Product | Fresh (>30d) | Expiring (1-30d) | Expired (<0d) | Total |',
      '|---------|-------------|------------------|---------------|-------|',
    ];

    let globalFresh = 0;
    let globalExpiring = 0;
    let globalExpired = 0;

    for (const productId of sortedProductIds) {
      const product = ctx.products.byId.get(productId)!;
      const evs = productEvidence.get(productId) ?? [];
      let fresh = 0;
      let expiring = 0;
      let expired = 0;

      for (const ev of evs) {
        try {
          const expiryDate = parseDate(ev.freshness.expires);
          const diffMs = expiryDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (daysRemaining < 0) {
            expired++;
          } else if (daysRemaining <= 30) {
            expiring++;
          } else {
            fresh++;
          }
        } catch {
          expired++;
        }
      }

      globalFresh += fresh;
      globalExpiring += expiring;
      globalExpired += expired;

      const total = fresh + expiring + expired;
      lines.push(`| ${product.id} | ${fresh} | ${expiring} | ${expired} | ${total} |`);
    }

    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Category | Count |`);
    lines.push(`|----------|-------|`);
    lines.push(`| Fresh (>30 days) | ${globalFresh} |`);
    lines.push(`| Expiring (1-30 days) | ${globalExpiring} |`);
    lines.push(`| Expired (<0 days) | ${globalExpired} |`);
    lines.push(`| **Total** | **${globalFresh + globalExpiring + globalExpired}** |`);

    return { content: lines.join('\n') };
  }
}
