import { type Product, type GovernanceRegistries } from '../../types/entities';
import { type ExecutionContext } from '../../context/execution-context';

export function buildStrategicIntent(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string {
  const lines: string[] = [];
  lines.push('## Strategic Intent');
  lines.push('');
  lines.push(`**Intent:** ${product.strategicIntent}`);
  lines.push('');

  const productClaimIds = new Set(
    (ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id))
      .map((c) => c.id),
  );
  const allDecisions = [...ctx.decisions.byId.values()];
  const relatedDecisions = (allDecisions.length > 0 ? allDecisions : registries.decisions)
    .filter((d) => d.affectedClaims.some((ac) => productClaimIds.has(ac)))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (relatedDecisions.length > 0) {
    lines.push('| DEC-ID | Type | Status | Date |');
    lines.push('|--------|------|--------|------|');
    for (const d of relatedDecisions) {
      lines.push(`| ${d.id} | ${d.type} | ${d.status} | ${d.decisionDate} |`);
    }
  } else {
    lines.push('No decisions registered for this product.');
  }

  return lines.join('\n');
}
