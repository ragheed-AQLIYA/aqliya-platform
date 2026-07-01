#!/usr/bin/env tsx
/**
 * Firm Memory Learning Validation — proves correction → feedback → pattern → reuse.
 *
 * Simulates:
 *   1. Classify account (no firm memory)
 *   2. Record manual correction (wasAccepted=false when suggestion differs)
 *   3. Re-classify same account (firm_memory hit)
 *
 * Usage:
 *   npm run firm-memory:validate-learning
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const TEST_CODE = "FM-LEARN-TEST-001";
const TEST_NAME = "حساب اختبار ذاكرة المكتب";

async function main() {
  const { prisma } = await import("../../src/lib/prisma");
  const { classifyTrialBalanceAccount } = await import(
    "../../src/lib/tb-intelligence/engine"
  );
  const { recordReviewMappingFeedback } = await import(
    "../../src/lib/tb-intelligence/firm-memory"
  );

  const platformOrg = await prisma.platformOrganization.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!platformOrg) {
    console.error("No platform organization — seed database first");
    process.exit(1);
  }

  let org = await prisma.organization.findFirst({
    where: { platformOrganizationId: platformOrg.id },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Firm Memory Validation Org",
        platformOrganizationId: platformOrg.id,
      },
    });
  }

  let wrongCanonical = await prisma.auditCanonicalAccount.findFirst({
    where: { category: "expense" },
    orderBy: { code: "asc" },
  });
  let correctCanonical = await prisma.auditCanonicalAccount.findFirst({
    where: { category: "asset" },
    orderBy: { code: "asc" },
  });

  if (!wrongCanonical) {
    wrongCanonical = await prisma.auditCanonicalAccount.create({
      data: {
        id: "fm-val-wrong-expense",
        code: "FM-VAL-WRONG",
        name: "Validation Wrong Expense",
        category: "expense",
        statementType: "income_statement",
        displayOrder: 9001,
        reportingFramework: "ifrs_for_smes",
        version: "1",
      },
    });
  }
  if (!correctCanonical) {
    correctCanonical = await prisma.auditCanonicalAccount.create({
      data: {
        id: "fm-val-correct-asset",
        code: "FM-VAL-CORRECT",
        name: "Validation Correct Asset",
        category: "asset",
        statementType: "balance_sheet",
        displayOrder: 9002,
        reportingFramework: "ifrs_for_smes",
        version: "1",
      },
    });
  }

  await prisma.tBMappingPattern.deleteMany({
    where: {
      organizationId: org.id,
      clientAccountCode: TEST_CODE,
    },
  });
  await prisma.tBMappingFeedback.deleteMany({
    where: {
      organizationId: org.id,
      clientAccountCode: TEST_CODE,
    },
  });

  const before = await classifyTrialBalanceAccount({
    organizationId: org.id,
    accountCode: TEST_CODE,
    accountName: TEST_NAME,
    enableCloudAi: false,
  });

  const { wasAccepted } = await recordReviewMappingFeedback({
    organizationId: org.id,
    engagementId: "firm-memory-validation",
    clientAccountCode: TEST_CODE,
    clientAccountName: TEST_NAME,
    suggestedCanonicalId: wrongCanonical.id,
    acceptedCanonicalId: correctCanonical.id,
    reviewerId: "firm-memory-validation-reviewer",
  });

  const pattern = await prisma.tBMappingPattern.findUnique({
    where: {
      organizationId_clientAccountCode: {
        organizationId: org.id,
        clientAccountCode: TEST_CODE,
      },
    },
    include: { organization: false },
  });

  const after = await classifyTrialBalanceAccount({
    organizationId: org.id,
    accountCode: TEST_CODE,
    accountName: TEST_NAME,
    enableCloudAi: false,
  });

  const feedback = await prisma.tBMappingFeedback.findFirst({
    where: {
      organizationId: org.id,
      clientAccountCode: TEST_CODE,
    },
    orderBy: { createdAt: "desc" },
  });

  const passed =
    (before === null || before.source !== "firm_memory") &&
    wasAccepted === false &&
    feedback?.wasAccepted === false &&
    pattern?.canonicalAccountId === correctCanonical.id &&
    after !== null &&
    after.source === "firm_memory" &&
    after.canonicalAccountId === correctCanonical.id;

  const artifact = {
    validation: "firm_memory_learning_loop",
    measuredAt: new Date().toISOString(),
    testAccountCode: TEST_CODE,
    organizationId: org.id,
    steps: {
      beforeClassification: before
        ? { source: before.source, canonicalCode: before.canonicalCode }
        : { source: null, canonicalCode: null, note: "no pipeline match (expected)" },
      manualCorrection: {
        suggestedCanonicalId: wrongCanonical.id,
        acceptedCanonicalId: correctCanonical.id,
        wasAccepted,
      },
      patternWritten: {
        canonicalAccountId: pattern?.canonicalAccountId ?? null,
        hitCount: pattern?.hitCount ?? 0,
      },
      afterClassification: after
        ? {
            source: after.source,
            canonicalCode: after.canonicalCode,
            canonicalAccountId: after.canonicalAccountId,
          }
        : { source: null, canonicalCode: null, canonicalAccountId: null },
    },
    passed,
    verdict: passed
      ? "Correction → feedback → pattern → firm_memory reuse PROVEN"
      : "FAILED — loop incomplete",
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "firm-memory-learning-validation.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  console.log("=== Firm Memory Learning Validation ===");
  console.log(
    `before: ${before?.source ?? "none"} → ${before?.canonicalCode ?? "—"}`,
  );
  console.log(`correction: wasAccepted=${wasAccepted}`);
  console.log(
    `after: ${after?.source ?? "none"} → ${after?.canonicalCode ?? "—"}`,
  );
  console.log(`verdict: ${artifact.verdict}`);
  console.log(`artifact: ${jsonPath}`);

  await prisma.$disconnect();
  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
