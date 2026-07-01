import { ID_PATTERNS } from '../types/identifiers';

export { ID_PATTERNS } from '../types/identifiers';

export function matchId(id: string): { type: string; valid: boolean } {
  for (const [type, pattern] of Object.entries(ID_PATTERNS)) {
    if (pattern.test(id)) {
      return { type, valid: true };
    }
  }
  return { type: 'UNKNOWN', valid: false };
}

export function extractMatches(text: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}
