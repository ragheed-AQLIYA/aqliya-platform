// ─── Suggestion Quality Audit ───
// Usage: npx tsx --env-file .env scripts/local-content/suggestion-quality-audit.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("FATAL: DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const organizationId = "cmqhcenx40000fopq7rpt4o31";
  
  const total = await prisma.lcPatternSuggestion.count({ where: { organizationId } });
  console.log("=== SUGGESTION QUALITY AUDIT ===");
  console.log("Total suggestions: " + total);
  
  const highConf = await prisma.lcPatternSuggestion.count({ where: { organizationId, confidence: { gt: 80 } } });
  const medConf = await prisma.lcPatternSuggestion.count({ where: { organizationId, confidence: { gte: 60, lte: 80 } } });
  const lowConf = await prisma.lcPatternSuggestion.count({ where: { organizationId, confidence: { lt: 60 } } });
  console.log("\n=== CONFIDENCE DISTRIBUTION ===");
  console.log("High (>80%):     " + highConf);
  console.log("Medium (60-80%): " + medConf);
  console.log("Low (<60%):      " + lowConf);
  
  const pending = await prisma.lcPatternSuggestion.count({ where: { organizationId, status: "pending" } });
  const approved = await prisma.lcPatternSuggestion.count({ where: { organizationId, status: "approved" } });
  const rejected = await prisma.lcPatternSuggestion.count({ where: { organizationId, status: "rejected" } });
  console.log("\n=== STATUS DISTRIBUTION ===");
  console.log("Pending:  " + pending);
  console.log("Approved: " + approved);
  console.log("Rejected: " + rejected);
  
  const lines = await prisma.lcPatternSuggestion.groupBy({
    by: ["workbookLineCode"],
    where: { organizationId },
    _count: true,
    orderBy: { _count: { workbookLineCode: "desc" } }
  });
  console.log("\n=== WORKBOOK LINE DISTRIBUTION ===");
  for (const line of lines) {
    console.log("  " + line.workbookLineCode + ": " + line._count + " suggestions");
  }
  
  const sources = await prisma.lcPatternSuggestion.groupBy({
    by: ["source"],
    where: { organizationId },
    _count: true
  });
  console.log("\n=== SOURCE DISTRIBUTION ===");
  for (const s of sources) {
    console.log("  " + s.source + ": " + s._count);
  }
  
  const allSugs = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    select: { id: true, workbookLineCode: true, reasoning: true, confidence: true, suggestedPattern: true, createdAt: true }
  });
  
  const keyed = new Map();
  for (const s of allSugs) {
    const key = s.workbookLineCode + "|" + (s.reasoning || "null") + "|" + (s.suggestedPattern || "null");
    if (!keyed.has(key)) keyed.set(key, []);
    keyed.get(key).push(s);
  }
  
  let dupCount = 0;
  let dupGroups = 0;
  for (const [key, group] of keyed) {
    if (group.length > 1) {
      dupCount += group.length;
      dupGroups++;
      console.log("\n  DUPLICATE GROUP: " + group[0].workbookLineCode);
      console.log("    Count: " + group.length);
      console.log("    Confidence: " + group.map(s => s.confidence + "%").join(", "));
      console.log("    Reasoning: " + (group[0].reasoning || "none").substring(0, 80));
      console.log("    Pattern: " + (group[0].suggestedPattern || "none").substring(0, 80));
      console.log("    IDs: " + group.map(s => s.id.substring(0, 12)).join(", "));
    }
  }
  
  const uniqueSugs = keyed.size;
  console.log("\n=== DUPLICATE ANALYSIS ===");
  console.log("Total suggestions: " + total);
  console.log("Unique (by content): " + uniqueSugs);
  console.log("Duplicate groups: " + dupGroups);
  console.log("Duplicate records: " + dupCount);
  console.log("Unique records: " + (total - dupCount + dupGroups));
  
  console.log("\n=== SAMPLE SUGGESTIONS ===");
  for (const level of ["high", "medium", "low"]) {
    let filter;
    if (level === "high") filter = { gt: 80 };
    else if (level === "medium") filter = { gte: 60, lte: 80 };
    else filter = { lt: 60 };
    const samples = await prisma.lcPatternSuggestion.findMany({
      where: { organizationId, confidence: filter },
      take: 3,
      orderBy: { createdAt: "desc" }
    });
    console.log("\n--- " + level.toUpperCase() + " confidence (showing " + samples.length + ") ---");
    for (const s of samples) {
      console.log("  [" + s.id.substring(0, 12) + "] " + s.workbookLineCode + " conf=" + s.confidence + "%");
      console.log("    src: " + s.source + " | reasoning: " + (s.reasoning || "none").substring(0, 100));
    }
  }
  
  const firstSug = allSugs[0];
  const lastSug = allSugs[allSugs.length - 1];
  const oneDayMs = 24 * 60 * 60 * 1000;
  const recentCount = allSugs.filter(s => 
    s.createdAt.getTime() > Date.now() - oneDayMs
  ).length;
  console.log("\n=== TIME ANALYSIS ===");
  console.log("First suggestion: " + (firstSug?.createdAt.toISOString() || "none"));
  console.log("Last suggestion: " + (lastSug?.createdAt.toISOString() || "none"));
  console.log("Suggestions in last 24h: " + recentCount);
  
  const mrTotal = await prisma.lcMatchReview.count({ where: { organizationId } });
  const mrPending = await prisma.lcMatchReview.count({ where: { organizationId, status: "pending" } });
  console.log("\n=== MATCH REVIEW COMPARISON ===");
  console.log("Total match reviews: " + mrTotal);
  console.log("Pending reviews: " + mrPending);
  
  const memCount = await prisma.lcOrganizationMatchMemory.count({ where: { organizationId } });
  console.log("\n=== ORGANIZATION MEMORY ===");
  console.log("Memory records: " + memCount);
  
  await prisma.$disconnect();
}

main().catch(console.error);
