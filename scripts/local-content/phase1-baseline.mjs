// Phase 1: Document current state before cleanup
// npx tsx --env-file .env scripts/local-content/phase1-baseline.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({
  adapter: new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"),
});

const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

console.log("=== PRE-CLEANUP BASELINE ===");

// All counts
const baseline = {
  totalSuggestions: await p.lcPatternSuggestion.count({ where: { organizationId: ORG_ID } }),
  pendingSuggestions: await p.lcPatternSuggestion.count({ where: { organizationId: ORG_ID, status: "pending" } }),
  approvedSuggestions: await p.lcPatternSuggestion.count({ where: { organizationId: ORG_ID, status: "approved" } }),
  rejectedSuggestions: await p.lcPatternSuggestion.count({ where: { organizationId: ORG_ID, status: "rejected" } }),
  orgMemoryRecords: await p.lcOrganizationMatchMemory.count({ where: { organizationId: ORG_ID } }),
  healthRecords: await p.lcPatternHealthRecord.count({ where: { organizationId: ORG_ID } }),
  matchReviews: await p.lcMatchReview.count({ where: { organizationId: ORG_ID } }),
  reviewRuns: await p.lcAiReviewRun.count({ where: { organizationId: ORG_ID } }),
  auditEvents: await p.lcAiAuditEvent.count({ where: { organizationId: ORG_ID } }),
};

console.log(JSON.stringify(baseline, null, 2));

// Suggestion distribution by workbook line code
const byCode = await p.lcPatternSuggestion.groupBy({
  by: ["workbookLineCode"],
  where: { organizationId: ORG_ID },
  _count: true,
});
console.log("\n=== SUGGESTIONS BY WORKBOOK LINE ===");
for (const c of byCode.sort((a, b) => (b._count || 0) - (a._count || 0))) {
  console.log("  " + c.workbookLineCode + ": " + c._count);
}

// Confidence distribution
const byConfidence = await p.lcPatternSuggestion.findMany({
  where: { organizationId: ORG_ID },
  select: { confidence: true },
});
const confRanges = { "50": 0, "60-70": 0, "80-90": 0, "100": 0 };
for (const s of byConfidence) {
  if (s.confidence >= 100) confRanges["100"]++;
  else if (s.confidence >= 80) confRanges["80-90"]++;
  else if (s.confidence >= 60) confRanges["60-70"]++;
  else confRanges["50"]++;
}
console.log("\n=== CONFIDENCE DISTRIBUTION ===");
console.log(JSON.stringify(confRanges));

// Sample suggestion content quality
const samples = await p.lcPatternSuggestion.findMany({
  where: { organizationId: ORG_ID },
  orderBy: { createdAt: "desc" },
  take: 5,
  select: {
    id: true,
    workbookLineCode: true,
    suggestedPattern: true,
    reasoning: true,
    confidence: true,
    source: true,
    status: true,
  },
});
console.log("\n=== SAMPLE SUGGESTIONS (first 5) ===");
for (const s of samples) {
  console.log("---");
  console.log("  id: " + s.id.slice(0, 12));
  console.log("  code: " + s.workbookLineCode);
  console.log("  conf: " + s.confidence);
  console.log("  source: " + s.source);
  console.log("  status: " + s.status);
  console.log("  pattern: " + (s.suggestedPattern || "(empty)").substring(0, 120));
  console.log("  reason: " + (s.reasoning || "").substring(0, 120));
}

// Org memory
const memory = await p.lcOrganizationMatchMemory.findMany({
  where: { organizationId: ORG_ID },
  select: { workbookLineCode: true, manualOverride: true, overrideReason: true },
  orderBy: { workbookLineCode: "asc" },
});
console.log("\n=== ORG MEMORY (" + memory.length + ") ===");
for (const m of memory) {
  console.log("  " + m.workbookLineCode + " | override=" + m.manualOverride + " | " + (m.overrideReason || "").substring(0, 60));
}

await p.$disconnect();
