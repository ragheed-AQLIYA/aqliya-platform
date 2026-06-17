// ─── Step 2: Seed Industry Pattern Memory ───
// Take top approved patterns and store in LcIndustryPatternMemory
// npx tsx --env-file .env scripts/local-content/seed-industry-memory.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

async function main() {
  console.log("=".repeat(72));
  console.log("  STEP 2: SEED INDUSTRY PATTERN MEMORY");
  console.log("=".repeat(72));

  // Determine industry from org memory / TB data
  // Based on account names: operations & maintenance revenue, security services, environmental services
  const INDUSTRY = "services";

  // Get top approved patterns (one per line, highest confidence first)
  const suggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId: ORG_ID, status: "approved" },
    orderBy: [{ workbookLineCode: "asc" }, { confidence: "desc" }],
  });

  // Get match reviews for effectiveness data
  const reviews = await prisma.lcMatchReview.findMany({
    where: { organizationId: ORG_ID },
  });

  // Build per-line stats
  const reviewStats = {};
  for (const r of reviews) {
    if (!reviewStats[r.workbookLineCode]) {
      reviewStats[r.workbookLineCode] = { total: 0, fp: 0 };
    }
    reviewStats[r.workbookLineCode].total++;
    if (r.isFalsePositive) reviewStats[r.workbookLineCode].fp++;
  }

  console.log(`  Industry: ${INDUSTRY}`);
  console.log(`  Approved suggestions: ${suggestions.length}`);
  console.log(`  Match reviews: ${reviews.length}\n`);

  // Pick best pattern per line (first by confidence desc)
  const seenLines = new Set();
  let seeded = 0;

  for (const s of suggestions) {
    if (seenLines.has(s.workbookLineCode)) continue;
    seenLines.add(s.workbookLineCode);

    const stats = reviewStats[s.workbookLineCode] || { total: 0, fp: 0 };
    const correct = stats.total - stats.fp;
    const effectiveness = stats.total > 0 ? (correct / stats.total) * 100 : 100;

    await prisma.lcIndustryPatternMemory.create({
      data: {
        industry: INDUSTRY,
        workbookLineCode: s.workbookLineCode,
        pattern: s.suggestedPattern,
        totalMatches: stats.total,
        correctMatches: correct,
        falsePositives: stats.fp,
        effectivenessPct: Math.round(effectiveness * 10) / 10,
        notes: `Seeded from ${ORGANIZATION_NAME} TB: ${s.reasoning?.substring(0, 100) || ""}`,
        metadata: { seededFrom: ORG_ID, originalConfidence: s.confidence },
      },
    }).catch(() => {}); // skip if unique constraint violation

    seeded++;
    console.log(`  ${s.workbookLineCode.padEnd(8)} eff: ${String(Math.round(effectiveness)).padStart(3)}%  matches: ${stats.total}  FP: ${stats.fp}`);
  }

  console.log(`\n  Seeded ${seeded} industry patterns for ${INDUSTRY}`);

  // Verify
  const totalSeeded = await prisma.lcIndustryPatternMemory.count({
    where: { industry: INDUSTRY },
  });
  console.log(`  Total in DB: ${totalSeeded}`);

  // Log audit
  await prisma.lcAiAuditEvent.create({
    data: {
      organizationId: ORG_ID,
      action: "industry_memory_seeded",
      status: "success",
      providerId: "system",
      outputSummary: {
        industry: INDUSTRY,
        patternsSeeded: seeded,
        totalInDB: totalSeeded,
        linesCovered: [...seenLines],
      },
      warningCount: 0,
      durationMs: 0,
    },
  });

  console.log("\n" + "=".repeat(72));
  console.log("  INDUSTRY MEMORY SEEDING COMPLETE");
  console.log("=".repeat(72));
}

const ORGANIZATION_NAME = "شركة الابتكار التقني";
main().catch(e => { console.error(e); process.exit(1); });
