// ─── Post-Review: Pattern Health Check Script ───
// Generates LcPatternHealthRecord entries from review feedback
// npx tsx --env-file .env scripts/local-content/generate-health-records.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

async function main() {
  console.log("=".repeat(72));
  console.log("  POST-REVIEW HEALTH CHECK — Generate Pattern Health Records");
  console.log("=".repeat(72));

  // 1. Get all suggestions grouped by workbook line
  const suggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId: ORG_ID },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n  Found ${suggestions.length} suggestions across the organization`);

  const byLine = {};
  for (const s of suggestions) {
    if (!byLine[s.workbookLineCode]) {
      byLine[s.workbookLineCode] = { total: 0, accepted: 0, rejected: 0, patterns: [] };
    }
    byLine[s.workbookLineCode].total++;
    byLine[s.workbookLineCode].patterns.push(s.suggestedPattern);
    if (s.status === "approved") byLine[s.workbookLineCode].accepted++;
    else if (s.status === "rejected") byLine[s.workbookLineCode].rejected++;
  }

  // 2. Get false positive counts from match reviews
  const fpReviews = await prisma.lcMatchReview.findMany({
    where: { organizationId: ORG_ID, isFalsePositive: true },
  });
  const fpByLine = {};
  for (const r of fpReviews) {
    fpByLine[r.workbookLineCode] = (fpByLine[r.workbookLineCode] || 0) + 1;
  }

  // 3. Get total match reviews per line
  const totalReviewsByLine = {};
  const allReviews = await prisma.lcMatchReview.findMany({
    where: { organizationId: ORG_ID },
  });
  for (const r of allReviews) {
    totalReviewsByLine[r.workbookLineCode] = (totalReviewsByLine[r.workbookLineCode] || 0) + 1;
  }

  // 4. Get org memory patterns per line
  const orgMemories = await prisma.lcOrganizationMatchMemory.findMany({
    where: { organizationId: ORG_ID },
    select: { workbookLineCode: true, previousResult: true },
  });
  const rejectedMemoriesByLine = {};
  for (const m of orgMemories) {
    if (m.previousResult === "overridden" || m.previousResult === "rejected") {
      rejectedMemoriesByLine[m.workbookLineCode] = (rejectedMemoriesByLine[m.workbookLineCode] || 0) + 1;
    }
  }

  // 5. Generate health records
  let created = 0;
  for (const [lineCode, data] of Object.entries(byLine)) {
    const acceptanceRate = data.total > 0 ? (data.accepted / data.total) : 0;
    const fpRate = (totalReviewsByLine[lineCode] || 0) > 0
      ? (fpByLine[lineCode] || 0) / (totalReviewsByLine[lineCode] || 1)
      : 0;

    const healthScore = Math.round(
      (acceptanceRate * 50) +
      ((1 - fpRate) * 30) +
      20  // baseline for having any data
    );

    let status = "active";
    if (acceptanceRate >= 0.8 && fpRate <= 0.1) status = "high_performing";
    else if (acceptanceRate <= 0.3) status = "decaying";

    await prisma.lcPatternHealthRecord.create({
      data: {
        organizationId: ORG_ID,
        workbookLineCode: lineCode,
        pattern: data.patterns[0] || "",
        healthScore,
        acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
        successRate: parseFloat(acceptanceRate.toFixed(2)),
        falsePositiveRate: parseFloat(fpRate.toFixed(2)),
        decayScore: 1.0,
        totalSuggestions: data.total,
        totalAccepted: data.accepted,
        totalSuccessful: data.accepted,
        status,
      },
    });
    created++;
  }

  console.log(`\n  Created ${created} health records`);
  console.log(`  Lines covered: ${Object.keys(byLine).length}`);

  // Summary
  console.log(`\n  ${"Line".padEnd(10)} Health  Accept  FP  Status`);
  console.log(`  ${"-".repeat(50)}`);
  for (const [lineCode, data] of Object.entries(byLine).sort()) {
    const h = Math.round((data.total > 0 ? (data.accepted / data.total) : 0) * 50 +
      ((1 - ((totalReviewsByLine[lineCode] || 0) > 0
        ? (fpByLine[lineCode] || 0) / (totalReviewsByLine[lineCode] || 1) : 0)) * 30) + 20);
    console.log(`  ${lineCode.padEnd(10)} ${String(h).padStart(3)}%    ${String(Math.round((data.accepted/data.total)*100)).padStart(3)}%   ${String(fpByLine[lineCode] || 0).padStart(2)}  ${h >= 80 ? "high_performing" : h >= 50 ? "active" : "decaying"}`);
  }

  // Log audit event
  await prisma.lcAiAuditEvent.create({
    data: {
      organizationId: ORG_ID,
      action: "health_check_completed",
      status: "success",
      providerId: "system",
      outputSummary: { recordsCreated: created, linesCovered: Object.keys(byLine).length },
      warningCount: 0,
      durationMs: 0,
    },
  });
  console.log("\n  Audit event logged.");
}

main().catch((err) => {
  console.error("FATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
