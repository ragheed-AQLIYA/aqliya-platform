// Quick test for tb-loader.ts
const { parseTbXlsxWithStats } = require('./src/lib/local-content/workbook/tb-loader');
try {
  const { lines, stats } = parseTbXlsxWithStats('TB 31-12-2025 Final.xlsx');
  console.log(JSON.stringify({ stats }, null, 2));
  console.log('Total accounts:', lines.length);
  console.log('First 3:', JSON.stringify(lines.slice(0, 3)));
} catch (e) {
  console.error('FAIL:', e instanceof Error ? e.message : e);
}
