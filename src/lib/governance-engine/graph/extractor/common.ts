import { RegistryError } from '../../types/errors';
import { parseMarkdownTable } from '../../shared/parser';

export const GOVERNANCE_DIR = 'docs/governance';
export const EVIDENCE_CATALOG_DIR = 'docs/governance/evidence-catalog';

export const SOURCE_FILES = {
  claims: 'CLAIM_REGISTRY.md',
  products: 'product-registry.md',
  decisions: 'decision-registry.md',
  evidence: 'evidence-index.md',
  authorities: 'AUTHORITY_MATRIX.md',
} as const;

export const OUTPUT_DIR = 'build/governance';
export const OUTPUT_FILE = 'extracted-registries.json';

export async function readMarkdown(projectRoot: string, filePath: string): Promise<string> {
  const fullPath = projectRoot.endsWith('/') || projectRoot.endsWith('\\')
    ? `${projectRoot}${filePath}`
    : `${projectRoot}/${filePath}`;
  try {
    const fs = await import('node:fs/promises');
    return await fs.readFile(fullPath, { encoding: 'utf-8' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RegistryError(`Failed to read ${fullPath}: ${message}`, fullPath);
  }
}

export function parseTable(
  markdown: string,
  tableHeaderStart: string,
  requiredColumns: number,
): string[][] {
  const raw = parseMarkdownTable(markdown, tableHeaderStart);
  const dataRows = raw.filter((row) => {
    if (row.length === 0) return false;
    if (row.some((cell) => /^-+\s*$/.test(cell))) return false;
    if (row.some((cell) => /^(PROD-ID|CLM-ID|EV-ID|DEC-ID|AUTH ID)$/i.test(cell.trim()))) return false;
    return true;
  });
  return dataRows.filter((row) => row.length >= requiredColumns);
}

export function countEntities(entities: unknown[]): number {
  return entities.length;
}

export function joinSegments(...parts: string[]): string {
  return parts.filter((p) => p.length > 0).join('/');
}
