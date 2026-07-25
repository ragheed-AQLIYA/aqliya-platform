import { type Product } from '../../types/entities';

export function buildProductIdentity(product: Product): string {
  const lines: string[] = [];
  lines.push('## Product Identity');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| PROD-ID | ${product.id} |`);
  lines.push(`| Name | ${product.name} |`);
  lines.push(`| Name (Ar) | ${product.nameAr} |`);
  lines.push(`| Type | ${product.entityType} |`);
  lines.push(`| KA | ${product.knowledgeArea} |`);
  lines.push(`| Authority | ${product.authority} |`);
  lines.push(`| L-Level | ${product.currentLLevel} |`);
  lines.push(`| Status | ${product.lLevelStatus} |`);
  lines.push(`| Intent | ${product.strategicIntent} |`);
  lines.push(`| Evidence Status | ${product.evidenceStatus} |`);
  lines.push(`| Manifest | ${product.manifestStatus} |`);
  lines.push(`| Dossier | ${product.dossierStatus} |`);
  return lines.join('\n');
}
