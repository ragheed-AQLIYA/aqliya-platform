// Phase 1: Clean baseline — delete old garbage suggestions, reset health records
// npx tsx --env-file .env scripts/local-content/phase1-clean.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({
  adapter: new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"),
});

const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

console.log("=== PHASE 1: CLEAN BASELINE ===");

// Step 1: Delete old pattern suggestions
const deletedSuggestions = await p.lcPatternSuggestion.deleteMany({
  where: { organizationId: ORG_ID },
});
console.log("Deleted suggestions: " + deletedSuggestions.count);

// Step 2: Delete pattern health records (they track old garbage)
const deletedHealth = await p.lcPatternHealthRecord.deleteMany({
  where: { organizationId: ORG_ID },
});
console.log("Deleted health records: " + deletedHealth.count);

// Step 3: Keep org memory (organizational learning should persist)
const memCount = await p.lcOrganizationMatchMemory.count({ where: { organizationId: ORG_ID } });
console.log("Org memory preserved: " + memCount);

// Step 4: Update org memory records to reflect that we're re-running
const updatedMem = await p.lcOrganizationMatchMemory.updateMany({
  where: { organizationId: ORG_ID },
  data: {
    overrideReason: "Old suggestions deleted (generic AI output). Re-run pending.",
  },
});
console.log("Updated org memory records: " + updatedMem.count);

// Step 5: Verify state
const postState = {
  suggestions: await p.lcPatternSuggestion.count({ where: { organizationId: ORG_ID } }),
  healthRecords: await p.lcPatternHealthRecord.count({ where: { organizationId: ORG_ID } }),
  orgMemory: await p.lcOrganizationMatchMemory.count({ where: { organizationId: ORG_ID } }),
  matchReviews: await p.lcMatchReview.count({ where: { organizationId: ORG_ID } }),
  reviewRuns: await p.lcAiReviewRun.count({ where: { organizationId: ORG_ID } }),
};

console.log("\n=== POST-CLEAN STATE ===");
console.log(JSON.stringify(postState, null, 2));

await p.$disconnect();
