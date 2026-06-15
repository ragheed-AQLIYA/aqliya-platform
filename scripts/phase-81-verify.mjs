/**
 * Post Phase 8.1 — FS plug + reconciliation snapshot.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";
process.env.FF_AUDIT_FS_V2 = "true";
process.env.FF_AUDIT_RECONCILIATION = "true";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../src/lib/prisma.ts");
const { runReconciliationForEngagement } = await import(
  "../src/lib/audit/reconciliation/index.ts"
);
const { getMappingDisplayAmount } = await import(
  "../src/lib/audit/db/statement-builder.ts"
);

const bs = await prisma.auditFinancialStatement.findFirst({
  where: { engagementId, statementType: "balance_sheet" },
  orderBy: { updatedAt: "desc" },
});

const bsLines = Array.isArray(bs?.lines) ? bs.lines : [];
const plug = bsLines.find((l) =>
  l.label.includes("TB Closing Classification Adjustments"),
);

console.log("=== Balance Sheet (key lines) ===");
for (const line of bsLines) {
  const show =
    line.isTotal ||
    line.label.includes("TB Closing") ||
    line.label.includes("Non-Current Liab") ||
    line.label.includes("Right-of-Use") ||
    line.label.includes("ROU") ||
    line.label.includes("Actuarial") ||
    line.label.includes("Long-Term") ||
    line.label.includes("Lease Liab") ||
    line.label.includes("Zakat Provision") ||
    line.label.includes("Contract Assets");
  if (show) console.log(`${line.label}: ${line.amount.toLocaleString()}`);
}

console.log("\n=== Plug ===");
console.log(
  plug
    ? `TB Closing Classification Adjustments: ${plug.amount.toLocaleString()} SAR`
    : "No plug line (eliminated)",
);

const mappings = await prisma.auditAccountMapping.findMany({
  where: { engagementId, status: "confirmed" },
  include: { canonicalAccount: true },
});

const phase81Codes = [
  "CA-1070",
  "CA-1071",
  "CA-1080",
  "CA-2035",
  "CA-2110",
  "CA-2120",
  "CA-2130",
  "CA-2140",
  "CA-3030",
  "CA-3040",
];

console.log("\n=== Phase 8.1 canonical usage ===");
for (const code of phase81Codes) {
  const rows = mappings.filter((m) => m.canonicalAccount?.code === code);
  const total = rows.reduce((s, m) => s + getMappingDisplayAmount(m), 0);
  if (rows.length > 0) {
    console.log(
      `${code}: ${rows.length} accounts, FS total ${total.toLocaleString()} SAR`,
    );
  }
}

const recon = await runReconciliationForEngagement(engagementId);
console.log("\n=== Reconciliation ===");
console.log(
  JSON.stringify(
    {
      passed: recon.passed,
      failed: recon.checks.filter((c) => !c.passed).map((c) => c.code),
      checks: recon.checks.map((c) => ({
        code: c.code,
        passed: c.passed,
        message: c.message?.slice(0, 120),
      })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
