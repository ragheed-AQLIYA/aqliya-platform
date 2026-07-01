import type { Product, EntityType, LLevelStatus, StrategicIntentValue } from '../types/entities';
import { ID_PATTERNS } from '../types/identifiers';
import { RegistryError } from '../types/errors';
import { parseMarkdownTable } from '../shared/parser';

const VALID_ENTITY_TYPES: EntityType[] = [
  'Platform',
  'Product',
  'Workspace',
  'Engine',
  'Foundation',
  'Runtime',
  'Service',
  'Library',
];

const VALID_LLEVEL_STATUSES: LLevelStatus[] = ['Verified', 'Disputed', 'Frozen'];

const VALID_STRATEGIC_INTENTS: StrategicIntentValue[] = [
  'Approved',
  'Deferred',
  'Frozen',
  'Experimental',
];

const VALID_EVIDENCE_STATUSES = ['Not Started', 'Partial', 'Complete'] as const;

const VALID_MANIFEST_STATUSES = ['Missing', 'Generated'] as const;

function isHeaderRow(row: string[]): boolean {
  return row.some((cell) => /^PROD-ID|---$/i.test(cell.trim()));
}

function parseEntityType(raw: string): EntityType {
  const trimmed = raw.trim();
  for (const t of VALID_ENTITY_TYPES) {
    if (t.toLowerCase() === trimmed.toLowerCase()) {
      return t;
    }
  }
  return 'Product';
}

function parseLLevelStatus(raw: string): LLevelStatus {
  const trimmed = raw.trim();
  for (const s of VALID_LLEVEL_STATUSES) {
    if (s.toLowerCase() === trimmed.toLowerCase()) {
      return s;
    }
  }
  return 'Disputed';
}

function parseStrategicIntent(raw: string): StrategicIntentValue {
  const trimmed = raw.trim();
  for (const s of VALID_STRATEGIC_INTENTS) {
    if (s.toLowerCase() === trimmed.toLowerCase()) {
      return s;
    }
  }
  return 'Experimental';
}

function parseEvidenceStatus(raw: string): 'Not Started' | 'Partial' | 'Complete' {
  const trimmed = raw.trim().toLowerCase();
  for (const s of VALID_EVIDENCE_STATUSES) {
    if (s.toLowerCase() === trimmed) {
      return s;
    }
  }
  return 'Not Started';
}

function parseManifestOrDossierStatus(raw: string): 'Missing' | 'Generated' {
  const trimmed = raw.trim().toLowerCase();
  for (const s of VALID_MANIFEST_STATUSES) {
    if (s.toLowerCase() === trimmed) {
      return s;
    }
  }
  return 'Missing';
}

function tryParseProductRow(row: string[]): Product | null {
  const prodId = row[0]?.trim() ?? '';
  if (!prodId || !ID_PATTERNS.PRODUCT.test(prodId)) {
    return null;
  }

  const get = (idx: number): string => (idx >= 0 && idx < row.length ? (row[idx] ?? '').trim() : '');
  const cols = row.length;

  if (cols < 8) {
    return null;
  }

  const product: Product = {
    id: prodId,
    name: get(1),
    nameAr: get(1),
    entityType: parseEntityType(get(2)),
    knowledgeArea: get(3),
    authority: get(4),
    currentLLevel: get(5),
    lLevelStatus: parseLLevelStatus(get(6)),
    strategicIntent: parseStrategicIntent(get(7)),
    parentSystem: cols >= 9 ? (get(8) !== '—' ? get(8) : undefined) : undefined,
    evidenceStatus: parseEvidenceStatus(cols >= 10 ? get(9) : ''),
    manifestStatus: parseManifestOrDossierStatus(cols >= 11 ? get(10) : ''),
    dossierStatus: parseManifestOrDossierStatus(cols >= 12 ? get(11) : ''),
    lastVerification: cols >= 13 ? get(12) : new Date().toISOString(),
  };

  return product;
}

export function parseProductRegistry(markdown: string): Product[] {
  if (!markdown || markdown.trim().length === 0) {
    throw new RegistryError('Empty markdown content for product-registry.md', 'product-registry.md');
  }

  const products: Product[] = [];
  const seenIds = new Set<string>();

  const table = parseMarkdownTable(markdown, '| PROD-ID');
  const dataRows = table.filter((row) => !isHeaderRow(row));

  for (const row of dataRows) {
    const product = tryParseProductRow(row);
    if (product === null) {
      continue;
    }

    if (seenIds.has(product.id)) {
      throw new RegistryError(`Duplicate PROD-ID: ${product.id}`, 'product-registry.md');
    }
    seenIds.add(product.id);

    products.push(product);
  }

  return products;
}
