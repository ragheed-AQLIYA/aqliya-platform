export function parseMarkdownTable(markdown: string, tableStart: string): string[][] {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex((line) => line.trim().startsWith(tableStart));
  if (startIndex === -1) {
    return [];
  }

  const tableLines: string[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
      break;
    }
    tableLines.push(trimmed);
  }

  const rows: string[][] = [];
  for (const line of tableLines) {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    rows.push(cells);
  }

  return rows;
}
