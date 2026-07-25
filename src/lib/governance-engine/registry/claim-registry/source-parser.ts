import { parseMarkdownTable } from '../../shared/parser';
import { parseArrayField } from './common';
import { findTableStarts } from './table-utils';

export interface RawSource {
  id: string;
  type: string;
  location: string;
  producesEvidence: string[];
}

export function parseSourcesFromClaimRegistry(markdown: string): RawSource[] {
  if (!markdown || markdown.trim().length === 0) {
    return [];
  }

  const sources: RawSource[] = [];
  const seenIds = new Set<string>();

  const sourceHeaders = findTableStarts(markdown, 'SRC-ID');
  for (const head of sourceHeaders) {
    const table = parseMarkdownTable(markdown, head);
    const dataRows = table.filter((row) => /^SRC-[A-Z]+-\d{4}$/.test(row[0]?.trim()));

    for (const row of dataRows) {
      const srcId = row[0].trim();
      if (seenIds.has(srcId)) {
        continue;
      }
      seenIds.add(srcId);

      sources.push({
        id: srcId,
        type: (row[1]?.trim() ?? '').toUpperCase(),
        location: row[2]?.trim() ?? '',
        producesEvidence: row[3] ? parseArrayField(row[3]) : [],
      });
    }
  }

  return sources;
}
