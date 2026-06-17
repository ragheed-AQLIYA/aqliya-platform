/**
 * Extract Local Content signals from latest AuditOS TB on an engagement.
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/lc-signals-from-engagement.ts [engagementId]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

async function main() {
  const engagementId = process.argv[2] ?? "eng-gulf-2025";
  const {
    extractLocalContentSignalsFromEngagement,
    estimateLocalContentPercent,
    summarizeLocalContentSignals,
  } = await import("@/lib/local-content-intelligence");

  const signals = await extractLocalContentSignalsFromEngagement(engagementId);
  const summary = summarizeLocalContentSignals(signals);
  const estimate = estimateLocalContentPercent(signals, 0.65);

  console.log(`Engagement: ${engagementId}`);
  console.log(`LC-relevant accounts: ${signals.length}`);
  console.log(`Total LC-relevant amount: SAR ${summary.totalAmount.toLocaleString()}`);
  console.log(`Estimated local content % (assumptive): ${estimate}%`);
  console.log("\nBy category:");
  for (const [cat, stats] of Object.entries(summary.byCategory)) {
    console.log(
      `  ${cat}: ${stats.count} accounts, SAR ${stats.amount.toLocaleString()}`,
    );
  }

  console.log("\nSample signals:");
  signals.slice(0, 8).forEach((s) => {
    console.log(
      `  ${s.accountCode} — ${s.accountName} [${s.category}]${s.lcMappingHint ? ` (${s.lcMappingHint})` : ""}`,
    );
  });

  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
