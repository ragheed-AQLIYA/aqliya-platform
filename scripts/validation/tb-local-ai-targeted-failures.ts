#!/usr/bin/env tsx
/** Run Local AI on specific account codes for targeted benchmark */
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

config({ path: resolve(__dirname, "../../.env") });
process.env.FF_AI_REAL_PROVIDERS = "true";

const CODES = [
  "1106010001", "1106010021", "3101070016", "3101070017", "3101070032",
  "3101070045", "3203010001", "3204010001", "3204010091", "3301010011", "3301010011-1",
];

const XLSX = require("xlsx");
const wb = XLSX.readFile(resolve(__dirname, "../../TB 31-12-2025 Final.xlsx"));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

const accounts = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r[0] || !CODES.includes(String(r[0]).trim())) continue;
  accounts.push({
    accountCode: String(r[0]).trim(),
    accountName: String(r[1] || "").trim(),
    balance: parseFloat(String(r[9] || "0")) || 0,
    erpStatementSide: String(r[12] || "").trim(),
    classificationHints: [String(r[13] || "").trim(), String(r[14] || "").trim()].filter(Boolean),
  });
}

async function main() {
const { classifyAccountLocalOnly } = await import("@/lib/tb-intelligence");
const { loadCanonicalCandidates } = await import("@/lib/tb-intelligence/coa-loader");
const { prisma } = await import("@/lib/prisma");

const candidates = await loadCanonicalCandidates();
const maps = await prisma.auditAccountMapping.findMany({
  where: { engagementId: "eng-shalfa-2025", status: "confirmed" },
  include: { canonicalAccount: true },
});
const truth = new Map(maps.map((m) => [m.sourceAccountCode, m.canonicalAccount!.code]));
const det = JSON.parse(readFileSync(resolve(__dirname, "../../docs/audits/evidence/tb-local-ai-benchmark-full.json"), "utf8"));
const detByCode = new Map(det.deterministic.metrics.map((m: { accountCode: string }) => [m.accountCode, m]));

const results = [];
for (const acc of accounts) {
  const t0 = Date.now();
  const result = await classifyAccountLocalOnly({
    organizationId: "tb-benchmark-org",
    engagementId: "benchmark-local-targeted",
    accountCode: acc.accountCode,
    accountName: acc.accountName,
    debitAmount: acc.balance >= 0 ? acc.balance : 0,
    creditAmount: acc.balance < 0 ? Math.abs(acc.balance) : 0,
    enableCloudAi: false,
    erpStatementSide: acc.erpStatementSide?.includes("Balance Sheet") ? "balance_sheet" : "income_statement",
    classificationHints: acc.classificationHints.length > 0 ? acc.classificationHints : undefined,
  }, candidates);
  const d = detByCode.get(acc.accountCode);
  results.push({
    accountCode: acc.accountCode,
    accountName: acc.accountName,
    expected: truth.get(acc.accountCode),
    deterministic: d?.canonicalCode,
    detCorrect: d?.canonicalCode === truth.get(acc.accountCode),
    localAi: result?.canonicalCode ?? null,
    localCorrect: result?.canonicalCode === truth.get(acc.accountCode),
    localConfidence: result?.confidence ?? 0,
    latencyMs: Date.now() - t0,
  });
  console.log(JSON.stringify(results[results.length - 1]));
}

writeFileSync(
  resolve(__dirname, "../../docs/audits/evidence/tb-local-ai-targeted-failures.json"),
  JSON.stringify({ runAt: new Date().toISOString(), results }, null, 2),
);
await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
