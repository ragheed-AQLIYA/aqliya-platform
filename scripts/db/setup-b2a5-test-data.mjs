#!/usr/bin/env node

// ─── B2A-5 Test Data Setup ───
// Creates Org A (attacker), Org B (victim), and all test data for the cross-tenant attack proof.
// Run BEFORE cross-tenant-attack.mjs.
//
// Usage:
//   node scripts/db/setup-b2a5-test-data.mjs [--password <hash>]
//   --password: bcrypt hash for "test-password" (default: uses the seed's hash)
//
// Exit codes:
//   0 = Setup complete
//   1 = Setup failed

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// Use a generated bcrypt hash for "test-password"
const TEST_PASSWORD_HASH = process.argv.includes("--password")
  ? process.argv[process.argv.indexOf("--password") + 1]
  : null; // generated in main()

// ─── Deterministic CUIDs for test data ───
// We use these fixed IDs so the attack script knows what to target.
const IDS = {
  // Org A (attacker)
  orgA:           "c7a7a7a7a7a7a7a7a7a7a001",
  orgAUser:       "c7a7a7a7a7a7a7a7a7a7a002",
  
  // Org B (victim)
  orgB:           "c7b7b7b7b7b7b7b7b7b7b001",
  orgBUser:       "c7b7b7b7b7b7b7b7b7b7b002",
  orgBProject:    "c7b7b7b7b7b7b7b7b7b7b003",
  orgBWorkbook:   "c7b7b7b7b7b7b7b7b7b7b004",
  orgBLine1:      "c7b7b7b7b7b7b7b7b7b7b005",
  orgBLine2:      "c7b7b7b7b7b7b7b7b7b7b006",
  orgBSuggestion: "c7b7b7b7b7b7b7b7b7b7b007",
  orgBMatchReview:"c7b7b7b7b7b7b7b7b7b7b008",
  orgBRecommend:  "c7b7b7b7b7b7b7b7b7b7b009",
};

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  B2A-5 Test Data Setup                         ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Generate bcrypt hash for test password
  const passwordHash = TEST_PASSWORD_HASH || await bcrypt.hash("test-password", 10);
  console.log(`  🔑 Password hash generated for "test-password"\n`);

  // ── Step 1: Create Org A (Attacker) ──
  console.log("[1/4] Creating Org A (attacker)...");
  
  const orgA = await prisma.organization.upsert({
    where: { id: IDS.orgA },
    update: {},
    create: {
      id: IDS.orgA,
      name: "Org A (Attacker) — Test Organization",
    },
  });
  console.log(`  ✅ Org A: ${orgA.id}`);

  const orgAUser = await prisma.user.upsert({
    where: { email: "org-a-user@example.com" },
    update: {},
    create: {
      id: IDS.orgAUser,
      email: "org-a-user@example.com",
      name: "Org A Attacker User",
      passwordHash,
      role: "OPERATOR",
      organizationId: IDS.orgA,
    },
  });
  console.log(`  ✅ User: ${orgAUser.email} (${orgAUser.id})`);

  // ── Step 2: Create Org B (Victim) ──
  console.log("[2/4] Creating Org B (victim)...");

  const orgB = await prisma.organization.upsert({
    where: { id: IDS.orgB },
    update: {},
    create: {
      id: IDS.orgB,
      name: "Org B (Victim) — Test Organization",
    },
  });
  console.log(`  ✅ Org B: ${orgB.id}`);

  const orgBUser = await prisma.user.upsert({
    where: { email: "org-b-user@example.com" },
    update: {},
    create: {
      id: IDS.orgBUser,
      email: "org-b-user@example.com",
      name: "Org B Victim User",
      passwordHash,
      role: "OPERATOR",
      organizationId: IDS.orgB,
    },
  });
  console.log(`  ✅ User: ${orgBUser.email} (${orgBUser.id})`);

  // ── Step 3: Create Org B Project + Workbook + Lines ──
  console.log("[3/4] Creating Org B project and workbook...");

  const project = await prisma.localContentProject.upsert({
    where: { id: IDS.orgBProject },
    update: {},
    create: {
      id: IDS.orgBProject,
      organizationId: IDS.orgB,
      name: "Org B LC Project — Vendor Analysis Q1 2026",
      reportingPeriod: "Q1-2026",
      status: "DataCollection",
    },
  });
  console.log(`  ✅ Project: ${project.id} (${project.name})`);

  const workbook = await prisma.lcWorkbook.upsert({
    where: { id: IDS.orgBWorkbook },
    update: {},
    create: {
      id: IDS.orgBWorkbook,
      projectId: IDS.orgBProject,
      title: "Org B Q1 2026 Local Content Workbook",
      reportingPeriod: "Q1-2026",
      status: "populated",
    },
  });
  console.log(`  ✅ Workbook: ${workbook.id} (${workbook.title})`);

  // Create lines
  const line1 = await prisma.lcWorkbookLine.upsert({
    where: { id: IDS.orgBLine1 },
    update: {},
    create: {
      id: IDS.orgBLine1,
      workbookId: IDS.orgBWorkbook,
      section: "revenue",
      code: "REV-01",
      name: "Total Revenue",
      source: "manual",
      manualValue: 50000000,
    },
  });
  console.log(`  ✅ Line 1: ${line1.id} (${line1.code})`);

  const line2 = await prisma.lcWorkbookLine.upsert({
    where: { id: IDS.orgBLine2 },
    update: {},
    create: {
      id: IDS.orgBLine2,
      workbookId: IDS.orgBWorkbook,
      section: "supplier_spend",
      code: "SS-01",
      name: "Local Supplier Spend",
      source: "manual",
      manualValue: 15000000,
    },
  });
  console.log(`  ✅ Line 2: ${line2.id} (${line2.code})`);

  // ── Step 4: Create AI context data (Suggestion, MatchReview, Recommendation) ──
  console.log("[4/4] Creating AI context data...");

  const suggestion = await prisma.lcPatternSuggestion.upsert({
    where: { id: IDS.orgBSuggestion },
    update: {},
    create: {
      id: IDS.orgBSuggestion,
      organizationId: IDS.orgB,
      workbookLineCode: "SS-01",
      currentPattern: "exact_match:supplier_name",
      suggestedPattern: "range_match:supplier_category±10%",
      reasoning: "Improving supplier spend matching accuracy for Org B",
      confidence: 85,
      status: "pending",
      source: "ai",
    },
  });
  console.log(`  ✅ Suggestion: ${suggestion.id}`);

  const matchReview = await prisma.lcMatchReview.upsert({
    where: { id: IDS.orgBMatchReview },
    update: {},
    create: {
      id: IDS.orgBMatchReview,
      organizationId: IDS.orgB,
      workbookLineId: IDS.orgBLine2,
      workbookLineCode: "SS-01",
      accountCode: "5010-00",
      accountName: "Local Material Suppliers",
      patternUsed: "exact_match:supplier_name",
      matchType: "code_range",
      confidence: 92,
      riskLevel: "low",
      status: "pending",
    },
  });
  console.log(`  ✅ MatchReview: ${matchReview.id}`);

  const recommendation = await prisma.lcRecommendation.upsert({
    where: { id: IDS.orgBRecommend },
    update: {},
    create: {
      id: IDS.orgBRecommend,
      organizationId: IDS.orgB,
      workbookId: IDS.orgBWorkbook,
      category: "supplier_optimization",
      title: "Increase local supplier engagement in Org B's supply chain",
      description: "Org B has strong local supplier potential. Recommended: establish local supplier development program.",
      impactScore: 72,
      priority: "high",
      estimatedValue: 8.5,
      effort: "medium",
      status: "pending",
      source: "industry_memory",
      rationale: "Based on Org B's industry benchmark showing 82% local content potential in supplier category",
      groundingConfidence: 0.88,
    },
  });
  console.log(`  ✅ Recommendation: ${recommendation.id}`);

  // ── Summary ──
  console.log("\n" + "═".repeat(50));
  console.log("Setup complete!\n");
  console.log("Org A (attacker) user:  org-a-user@example.com / test-password");
  console.log("Org B (victim)   org:   " + IDS.orgB);
  console.log("Org B workbook:         " + IDS.orgBWorkbook);
  console.log("Org B project:          " + IDS.orgBProject);
  console.log("Org B suggestion:       " + IDS.orgBSuggestion);
  console.log("Org B line:             " + IDS.orgBLine1);
  console.log("Org B matchReview:      " + IDS.orgBMatchReview);
  console.log("Org B recommendation:   " + IDS.orgBRecommend);
  console.log("\nUpdate cross-tenant-attack.mjs ORG_B config with these IDs.\n");
}

main()
  .catch((err) => {
    console.error("❌ Setup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
