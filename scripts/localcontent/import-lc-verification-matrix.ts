/**
 * Import Local Content verification audit matrix XLSX → knowledge JSON.
 *
 * Usage:
 *   npx tsx scripts/import-lc-verification-matrix.ts [xlsxPath]
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

interface VerificationItem {
  id: string;
  section: string;
  criteria: string;
  action: string;
  document: string;
  scale: string;
  workingPaperRef: string;
}

const SECTION_MAP: Record<string, string> = {
  "2. Workforce Verification": "workforce",
  "3. Supply Chain Verification": "supply_chain",
  "4. Capex, Capacity & Assets": "capex_capacity",
  "5. Close-out Checklist": "closeout",
};

function parseSheet(
  sheetName: string,
  rows: unknown[][],
): VerificationItem[] {
  const headerIdx = rows.findIndex((r) => {
    const first = String(r[0] ?? "").trim();
    return /^(Proc ID|Step ID|Ref ID|Item ID)$/i.test(first);
  });
  if (headerIdx < 0) return [];

  const items: VerificationItem[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const id = String(row[0] ?? "").trim();
    if (!id || id.startsWith("Section")) continue;
    items.push({
      id,
      section: SECTION_MAP[sheetName] ?? sheetName,
      criteria: String(row[1] ?? "").trim(),
      action: String(row[2] ?? "").trim(),
      document: String(row[3] ?? "").trim(),
      scale: String(row[4] ?? "").trim(),
      workingPaperRef: String(row[5] ?? "").trim(),
    });
  }
  return items;
}

function main() {
  const input =
    process.argv[2] ??
    path.join(process.cwd(), "Local_Content_Verification_Audit_Matrix_v1.xlsx");
  const resolved = path.resolve(input);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(resolved);
  const allItems: VerificationItem[] = [];

  for (const sheetName of wb.SheetNames) {
    if (sheetName.startsWith("1.")) continue;
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]!, {
      header: 1,
      defval: "",
    }) as unknown[][];
    allItems.push(...parseSheet(sheetName, rows));
  }

  const outDir = path.join(process.cwd(), "knowledge", "local-content");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "verification-audit-matrix-v1.json");

  const payload = {
    version: "1.0",
    source: path.basename(resolved),
    importedAt: new Date().toISOString(),
    itemCount: allItems.length,
    items: allItems,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${allItems.length} items → ${outPath}`);
  const bySection: Record<string, number> = {};
  for (const item of allItems) {
    bySection[item.section] = (bySection[item.section] ?? 0) + 1;
  }
  console.log("By section:", bySection);
}

main();
