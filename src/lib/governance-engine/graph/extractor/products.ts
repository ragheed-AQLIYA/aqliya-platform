import { ID_PATTERNS, assertId } from '../../types/identifiers';
import type { ExtractedProduct } from '../types/extracted-registries';
import { parseTable } from './common';

export function extractProducts(markdown: string): ExtractedProduct[] {
  const rows = parseTable(markdown, '| PROD-ID', 13);
  const products: ExtractedProduct[] = [];

  for (const row of rows) {
    const [
      id,
      nameRaw,
      entityType,
      ka,
      authority,
      lLevel,
      lLevelStatus,
      strategicIntent,
      parent,
      evidenceStatus,
      manifestStatus,
      dossierStatus,
      lastVerified,
    ] = row;

    if (!id || !id.startsWith('PROD-')) continue;
    assertId(id, ID_PATTERNS.PRODUCT, 'PROD-ID');

    const nameMatch = nameRaw?.match(/^([^(]+)\s*\(([^)]+)\)$/);
    const name = nameMatch ? nameMatch[1].trim() : nameRaw?.trim() || id;
    const nameAr = nameMatch ? nameMatch[2].trim() : '';

    products.push({
      id,
      name,
      nameAr,
      entityType: entityType?.trim() || 'Product',
      ka: ka?.trim() || '',
      authority: authority?.trim() || '',
      currentLLevel: lLevel?.trim() || '',
      lLevelStatus: lLevelStatus?.trim() || 'Disputed',
      strategicIntent: strategicIntent?.trim() || 'Deferred',
      parent: parent && parent.trim() !== '—' ? parent.trim() : null,
      evidenceStatus: evidenceStatus?.trim() || 'Not Started',
      manifestStatus: manifestStatus?.trim() || 'Missing',
      dossierStatus: dossierStatus?.trim() || 'Missing',
      lastVerified: lastVerified?.trim() || '',
    });
  }

  return products;
}
