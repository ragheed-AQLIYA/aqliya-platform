export function isHeaderRow(row: string[]): boolean {
  return row.some((cell) => /^(CLM-ID|EV-ID|SRC-ID|---)$/i.test(cell.trim()));
}

export function findClaimTableHeaders(markdown: string): string[] {
  const headers: string[] = [];
  const seen = new Set<string>();
  const lineRegex = /^\|?\s*CLM-ID\s*\|/m;

  let match: RegExpExecArray | null;
  const globalRegex = new RegExp(lineRegex.source, 'gm');
  while ((match = globalRegex.exec(markdown)) !== null) {
    const lineStart = match[0];
    const normalized = lineStart.trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      headers.push(normalized);
    }
  }

  return headers.length > 0 ? headers : ['| CLM-ID'];
}

export function findTableStarts(markdown: string, colName: string): string[] {
  const starts: string[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`| ${colName} `) || trimmed.startsWith(`|${colName}`)) {
      starts.push(trimmed);
    }
  }
  return starts.length > 0 ? [...new Set(starts)] : [`| ${colName} |`];
}
