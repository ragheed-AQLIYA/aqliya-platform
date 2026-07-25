import { ID_PATTERNS, assertId } from '../../types/identifiers';
import type { ExtractedAuthority } from '../types/extracted-registries';
import { parseTable } from './common';

export function extractAuthorities(markdown: string): ExtractedAuthority[] {
  const rows = parseTable(markdown, '| AUTH ID', 8);
  const authorities: ExtractedAuthority[] = [];

  for (const row of rows) {
    const rawId = row[0]?.trim();
    if (!rawId || !rawId.startsWith('AUTH-')) continue;
    assertId(rawId, ID_PATTERNS.AUTHORITY, 'AUTH-ID');

    const areaId = row[1]?.trim() || '';
    const gapRaw = row[6]?.trim() || '';
    const gap = gapRaw && gapRaw !== '—' && gapRaw !== '-' ? gapRaw : null;
    const notesRaw = row[7]?.trim() || '';
    const notes = notesRaw && notesRaw !== '—' && notesRaw !== '-' ? notesRaw : null;
    const typeRaw = row[4]?.trim().toLowerCase() || 'reference';
    const type: 'Authority' | 'Reference' = typeRaw === 'authority' ? 'Authority' : 'Reference';

    const secondaryRefsRaw = row[5]?.trim() || '';
    const secondaryRefs = secondaryRefsRaw
      ? secondaryRefsRaw
          .split(/[,;]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    authorities.push({
      id: rawId,
      areaId,
      knowledgeArea: row[2]?.trim() || '',
      document: row[3]?.trim() || '',
      type,
      secondaryRefs,
      gap,
      notes,
    });
  }

  return authorities;
}
