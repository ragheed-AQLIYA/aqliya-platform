/**
 * List TB lines without confirmed mappings + ERP Mapping 1 hints.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import XLSX from "xlsx";

const engagementId = process.argv[2] ?? "eng-gulf-2025";
const tbFile = process.env.TB_FILE ?? process.argv[3];
if (!tbFile) {
  console.error("TB file required: set TB_FILE env or pass as third CLI argument.");
  process.exit(1);
}

const { prisma } = await import("../src/lib/prisma.ts");

const mappedCodes = new Set(
  (
    await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      select: { sourceAccountCode: true },
    })
  ).map((m) => m.sourceAccountCode),
);

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  include: { lines: true },
});

const wb = XLSX.readFile(tbFile);
const sheetRows = XLSX.utils.sheet_to_json(
  wb.Sheets[wb.SheetNames[0]],
  { defval: "" },
);
const map1Key = Object.keys(sheetRows[0] ?? {}).find((k) => k.trim() === "Mapping 1");
const hintByCode = new Map();
for (const r of sheetRows) {
  const code = String(r["رقم الحساب"] ?? "").trim();
  if (!code) continue;
  hintByCode.set(code, {
    map1: String(r[map1Key ?? "Mapping 1"] ?? "").trim(),
    bs: String(r["BS/IS"] ?? "").trim(),
  });
}

const unmapped = tb.lines.filter((l) => !mappedCodes.has(l.accountCode));
const byMap1 = {};
for (const line of unmapped) {
  const h = hintByCode.get(line.accountCode) ?? { map1: "?", bs: "?" };
  const key = h.map1 || "(empty)";
  byMap1[key] = (byMap1[key] ?? 0) + 1;
}

console.log(`TB lines: ${tb.lines.length}, mapped: ${mappedCodes.size}, unmapped: ${unmapped.length}`);
console.log("\nUnmapped by Mapping 1:");
console.log(
  Object.entries(byMap1)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${v}\t${k}`),
);

await prisma.$disconnect();
