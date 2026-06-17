/**
 * Preview TB classification for an XLSX/CSV export (Saudi Arabic column layout).
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-classification-preview.ts "path/to/TB.xlsx"
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

const CANONICAL_SEED = [
  {
    id: "ca-15",
    code: "CA-5010",
    name: "Cost of Sales",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 600,
  },
  {
    id: "ca-16",
    code: "CA-5020",
    name: "Employee Benefits",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 610,
  },
  {
    id: "ca-17",
    code: "CA-5030",
    name: "Occupancy Expenses",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 620,
  },
  {
    id: "ca-18",
    code: "CA-5040",
    name: "Utilities",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 630,
  },
  {
    id: "ca-19",
    code: "CA-5050",
    name: "Depreciation and Amortisation",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 640,
  },
  {
    id: "ca-20",
    code: "CA-5060",
    name: "Professional and Consulting Fees",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 650,
  },
  {
    id: "ca-21",
    code: "CA-5070",
    name: "General and Administrative Expenses",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 660,
  },
  {
    id: "ca-23",
    code: "CA-2050",
    name: "Finance Cost",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 680,
  },
  {
    id: "ca-13",
    code: "CA-4010",
    name: "Revenue - Sale of Goods",
    category: "Revenue",
    statementType: "income_statement",
    displayOrder: 500,
  },
] as const;

function parseFile(filePath: string): Array<Record<string, unknown>> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".xlsx" || ext === ".xls") {
    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    return XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Array<
      Record<string, unknown>
    >;
  }
  if (ext === ".csv") {
    const wb = XLSX.read(fs.readFileSync(filePath), { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    return XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Array<
      Record<string, unknown>
    >;
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Usage: npx tsx scripts/tb-classification-preview.ts <path-to-TB.xlsx>",
    );
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const { classifyTrialBalanceRows } = await import("@/lib/tb-intelligence");
  const { prisma } = await import("@/lib/prisma");

  const originalFindMany = prisma.auditCanonicalAccount.findMany.bind(
    prisma.auditCanonicalAccount,
  );
  prisma.auditCanonicalAccount.findMany = (async () =>
    CANONICAL_SEED.map((a) => ({
      ...a,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))) as typeof prisma.auditCanonicalAccount.findMany;

  const noop = async () => null;
  const noopCreate = async (args: { data: unknown }) => ({
    id: "preview",
    ...args.data,
  });
  if (prisma.tBMappingPattern) {
    prisma.tBMappingPattern.findUnique =
      noop as typeof prisma.tBMappingPattern.findUnique;
  }
  if (prisma.tBClassificationHistory) {
    prisma.tBClassificationHistory.create =
      noopCreate as typeof prisma.tBClassificationHistory.create;
  }

  const rows = parseFile(resolved);
  const codeKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("رقم الحساب")) ??
    "Account Code";
  const nameKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("اسم الحساب")) ??
    "Account Name";
  const debitKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("حركة الفترة مدين")) ??
    "Debit";
  const creditKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("حركة الفترة دائن")) ??
    "Credit";
  const closeDebitKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("الرصيد الحالي مدين")) ??
    null;
  const closeCreditKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("الرصيد الحالي دائن")) ??
    null;

  const hintKeys = Object.keys(rows[0] ?? {}).filter((k) =>
    /mapping|lc mapping/i.test(k.trim()),
  );

  const tbRows = rows
    .map((r) => {
      const accountCode = String(r[codeKey] ?? "").trim();
      const accountName = String(r[nameKey] ?? "").trim();
      if (!accountCode || !accountName) return null;
      let debit = parseAmount(r[debitKey]);
      let credit = parseAmount(r[creditKey]);
      if (debit === 0 && credit === 0 && closeDebitKey && closeCreditKey) {
        debit = parseAmount(r[closeDebitKey]);
        credit = parseAmount(r[closeCreditKey]);
      }
      const classificationHints = hintKeys
        .map((k) => String(r[k] ?? "").trim())
        .filter(Boolean);
      return {
        accountCode,
        accountName,
        debitAmount: debit,
        creditAmount: credit,
        classificationHints,
      };
    })
    .filter(Boolean) as Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
  }>;

  console.log(`File: ${path.basename(resolved)}`);
  console.log(`Sheet: Arabic TB export (ميزان المراجعة)`);
  console.log(`Accounts: ${tbRows.length}`);

  const classified = await classifyTrialBalanceRows(
    "preview-org",
    "preview-engagement",
    tbRows,
    { enableCloudAi: false },
  );

  const bySource: Record<string, number> = {};
  let mapped = 0;
  for (const row of classified) {
    const src = row.classification?.source ?? "none";
    bySource[src] = (bySource[src] ?? 0) + 1;
    if (row.classification?.canonicalAccountId) mapped++;
  }

  console.log("\nClassification by source:");
  for (const [source, count] of Object.entries(bySource).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`  ${source}: ${count}`);
  }
  console.log(
    `\nMapped: ${mapped}/${tbRows.length} (${Math.round((mapped / tbRows.length) * 100)}%)`,
  );

  const unmapped = classified
    .filter((r) => !r.classification)
    .slice(0, 10)
    .map((r) => `${r.row.accountCode} — ${r.row.accountName}`);
  if (unmapped.length > 0) {
    console.log("\nSample unmapped (first 10):");
    unmapped.forEach((line) => console.log(`  ${line}`));
  }

  prisma.auditCanonicalAccount.findMany = originalFindMany;
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
