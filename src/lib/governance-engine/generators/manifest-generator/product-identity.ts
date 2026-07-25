import { type Product } from '../../types/entities';

export function buildProductIdentity(product: Product): string {
  const lines: string[] = [];
  lines.push(`# MANIFEST-${product.id}`);
  lines.push('');
  lines.push('## Product Identity');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| PROD-ID | ${product.id} |`);
  lines.push(`| Name | ${product.name} |`);
  lines.push(`| Type | ${product.entityType} |`);
  lines.push(`| KA | ${product.knowledgeArea} |`);
  lines.push(`| Authority | ${product.authority} |`);
  lines.push(`| L-Level | ${product.currentLLevel} (${product.lLevelStatus}) |`);
  lines.push(`| Intent | ${product.strategicIntent} |`);
  return lines.join('\n');
}
