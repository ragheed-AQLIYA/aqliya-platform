import { type Product, type Claim, type Evidence, type GovernanceRegistries } from '../../types/entities';
import { type ExecutionContext } from '../../context/execution-context';
import { isExpired } from '../../shared/date';

export function buildAppendices(
  product: Product,
  _claims: Claim[],
  evidence: Evidence[],
  manifestHash: string,
  registries: GovernanceRegistries,
  ctx: ExecutionContext,
): string {
  const segments: string[] = [];
  segments.push('## Appendices');
  segments.push('');

  segments.push('### A. Manifest Hash');
  segments.push('');
  segments.push(`\`\`\`\n${manifestHash}\n\`\`\``);

  segments.push('### B. Evidence Map');
  segments.push('');
  segments.push('| EV-ID | Tier | Strength | Source |');
  segments.push('|-------|------|----------|--------|');
  if (evidence.length === 0) {
    segments.push('| — | — | — | — |');
  } else {
    for (const ev of evidence) {
      segments.push(`| ${ev.id} | ${ev.tier} | ${ev.strength} | ${ev.sourceRef} |`);
    }
  }

  segments.push('### C. Freshness');
  segments.push('');
  segments.push('| EV-ID | Evidence Date | Expires | Status |');
  segments.push('|-------|--------------|---------|--------|');
  if (evidence.length === 0) {
    segments.push('| — | — | — | — |');
  } else {
    for (const ev of evidence) {
      const expired = isExpired(ev.freshness.expires);
      const status = expired ? 'Expired' : 'Active';
      segments.push(`| ${ev.id} | ${ev.freshness.evidenceDate} | ${ev.freshness.expires} | ${status} |`);
    }
  }

  segments.push('### D. Decision History');
  segments.push('');
  const productClaimIds = new Set(
    (ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id))
      .map((c) => c.id),
  );
  const allDecisions = [...ctx.decisions.byId.values()];
  const productDecisions = (allDecisions.length > 0 ? allDecisions : registries.decisions)
    .filter((d) => d.affectedClaims.some((ac) => productClaimIds.has(ac)))
    .sort((a, b) => a.id.localeCompare(b.id));

  segments.push('| DEC-ID | Type | Status | Date |');
  segments.push('|--------|------|--------|------|');
  if (productDecisions.length === 0) {
    segments.push('| — | — | — | — |');
  } else {
    for (const d of productDecisions) {
      segments.push(`| ${d.id} | ${d.type} | ${d.status} | ${d.decisionDate} |`);
    }
  }

  return segments.join('\n');
}
