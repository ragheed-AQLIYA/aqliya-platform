// ─── Step 1: Re-score Confidence ───
// Move from uniform 50% to gradient based on 95% acceptance rate
// npx tsx --env-file .env scripts/local-content/confidence-rescore.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

async function main() {
  console.log("=".repeat(72));
  console.log("  STEP 1: RE-SCORE CONFIDENCE (50% uniform → gradient)");
  console.log("=".repeat(72));

  // Load all health records for per-line baseline
  const healthRecords = await prisma.lcPatternHealthRecord.findMany({
    where: { organizationId: ORG_ID },
  });
  const healthByLine = {};
  for (const hr of healthRecords) {
    healthByLine[hr.workbookLineCode] = hr;
  }

  // Load all suggestions
  const suggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId: ORG_ID },
    orderBy: { workbookLineCode: "asc" },
  });

  console.log(`  Loaded ${suggestions.length} suggestions, ${healthRecords.length} health records\n`);

  let updated = 0;
  for (const s of suggestions) {
    let newConfidence = s.confidence; // start at current (50%)

    // Status-based adjustment
    if (s.status === "approved") {
      newConfidence = 85; // base approved
      // Bonus from health record if available
      const hr = healthByLine[s.workbookLineCode];
      if (hr && hr.healthScore) {
        newConfidence = Math.round(hr.healthScore * 0.9); // 90% of health score
      }
    } else if (s.status === "rejected") {
      newConfidence = 25; // base rejected
    } else {
      // pending — use health record baseline or stay at 50
      const hr = healthByLine[s.workbookLineCode];
      if (hr && hr.healthScore) {
        newConfidence = Math.round(hr.healthScore * 0.5); // 50% of health score for pending
      }
    }

    // Reasoning bonus: +5 if reasoning has specific account names
    if (s.reasoning && s.reasoning.length > 30) newConfidence = Math.min(newConfidence + 5, 100);
    // Rejected penalty: -10 if has review notes explaining why
    if (s.status === "rejected" && s.reviewNotes && s.reviewNotes.length > 20) {
      newConfidence = Math.max(newConfidence - 10, 5);
    }

    // Clamp
    newConfidence = Math.max(5, Math.min(100, Math.round(newConfidence)));

    if (newConfidence !== s.confidence) {
      await prisma.lcPatternSuggestion.update({
        where: { id: s.id },
        data: { confidence: newConfidence },
      });
      updated++;
    }
  }

  console.log(`  Updated ${updated}/${suggestions.length} suggestions with new confidence scores\n`);

  // Distribution after rescore
  const updatedSuggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId: ORG_ID },
    orderBy: { workbookLineCode: "asc" },
  });

  const buckets = {};
  for (const s of updatedSuggestions) {
    const b = Math.floor(s.confidence / 10) * 10;
    buckets[b] = (buckets[b] || 0) + 1;
  }

  console.log("  New confidence distribution:");
  for (const [bucket, count] of Object.entries(buckets).sort((a, b) => a[0] - b[0])) {
    const bar = "█".repeat(count);
    console.log(`    ${bucket}%  ${bar} ${count}`);
  }

  const avgConf = Math.round(
    updatedSuggestions.reduce((s, x) => s + x.confidence, 0) / updatedSuggestions.length
  );
  console.log(`\n  Average confidence: ${avgConf}% (was 50%)`);
  console.log(`  Gradient achieved: ${Object.keys(buckets).length} distinct levels\n`);

  // Update health records with new confidence data
  let healthUpdated = 0;
  for (const [lineCode, hr] of Object.entries(healthByLine)) {
    const lineSuggestions = updatedSuggestions.filter(s => s.workbookLineCode === lineCode);
    if (lineSuggestions.length === 0) continue;

    const avgLineConf = Math.round(
      lineSuggestions.reduce((s, x) => s + x.confidence, 0) / lineSuggestions.length
    );

    await prisma.lcPatternHealthRecord.update({
      where: { id: hr.id },
      data: {
        healthScore: avgLineConf,
        notes: `Re-scored from uniform 50% to gradient (avg ${avgLineConf}%) based on ${lineSuggestions.length} suggestions`
      },
    });
    healthUpdated++;
  }
  console.log(`  Updated ${healthUpdated} health records with new scores\n`);

  // Log audit
  await prisma.lcAiAuditEvent.create({
    data: {
      organizationId: ORG_ID,
      action: "confidence_rescored",
      status: "success",
      providerId: "system",
      outputSummary: {
        total: updatedSuggestions.length,
        updated,
        avgConfidenceBefore: 50,
        avgConfidenceAfter: avgConf,
        buckets: Object.keys(buckets).length,
      },
      warningCount: 0,
      durationMs: 0,
    },
  });

  console.log("=".repeat(72));
  console.log("  CONFIDENCE RE-SCORE COMPLETE");
  console.log(`  ${updated} suggestions updated, avg ${avgConf}%`);
  console.log("=".repeat(72));
}

main().catch(e => { console.error(e); process.exit(1); });
