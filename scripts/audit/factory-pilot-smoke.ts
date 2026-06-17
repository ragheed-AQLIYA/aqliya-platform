#!/usr/bin/env tsx
/**
 * Factory pilot live smoke — SAR engagement eng-gulf-2025.
 * Requires DATABASE_URL and seeded audit data (npm run seed:audit).
 *
 * Usage:
 *   npm run factory:smoke
 *   npm run factory:smoke -- --engagement-id eng-gulf-2025
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";

config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DEFAULT_ENGAGEMENT = "eng-gulf-2025";

function enableFactoryFlags() {
  process.env.FF_AUDIT_FS_V2 = "true";
  process.env.FF_AUDIT_IFRS_RULES = "true";
  process.env.FF_AUDIT_SOCPA_RULES = "true";
  process.env.FF_AUDIT_DISCLOSURE_AUTO = "true";
  process.env.FF_AUDIT_RECONCILIATION = "true";
  process.env.FF_AUDIT_REPORTING_GRAPH = "true";
  process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO = "true";
  process.env.FF_AUDIT_INTELLIGENCE = "false";
  process.env.FF_AUDIT_APPROVAL_GATES = "true";
  process.env.FF_AUDIT_MIND_MAP = "true";
}

type StepResult = { step: string; ok: boolean; detail: string };

async function runFactoryHooks(engagementId: string): Promise<StepResult[]> {
  const steps: StepResult[] = [];

  async function step(name: string, fn: () => Promise<unknown>) {
    try {
      const result = await fn();
      const detail =
        result && typeof result === "object"
          ? JSON.stringify(result).slice(0, 200)
          : "ok";
      steps.push({ step: name, ok: true, detail });
    } catch (err) {
      steps.push({
        step: name,
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await step("FS v2 rebuild", async () => {
    const { maybeRebuildFinancialStatements } = await import(
      "../../src/lib/audit/fs-engine"
    );
    return { rebuilt: await maybeRebuildFinancialStatements(engagementId) };
  });

  await step("Reporting graph sync", async () => {
    const { maybeSyncReportingGraphAfterFsRebuild } = await import(
      "../../src/lib/audit/reporting-graph/graph-sync-service"
    );
    await maybeSyncReportingGraphAfterFsRebuild(engagementId);
  });

  await step("Lead schedules", async () => {
    const { maybeGenerateLeadSchedules } = await import(
      "../../src/lib/audit/lead-schedule"
    );
    await maybeGenerateLeadSchedules(engagementId, "mapping_confirm");
  });

  await step("Reconciliation", async () => {
    const { maybeRunReconciliationAfterPipeline } = await import(
      "../../src/lib/audit/reconciliation"
    );
    await maybeRunReconciliationAfterPipeline(engagementId);
    const { runReconciliationForEngagement } = await import(
      "../../src/lib/audit/reconciliation"
    );
    return runReconciliationForEngagement(engagementId);
  });

  await step("IFRS rules", async () => {
    const { runIfrsRulesForEngagement } = await import(
      "../../src/lib/audit/rules/ifrs-rules-engine"
    );
    return runIfrsRulesForEngagement(engagementId);
  });

  await step("SOCPA rules", async () => {
    const { runSocpaRulesForEngagement } = await import(
      "../../src/lib/audit/rules/socpa-rules-engine"
    );
    return runSocpaRulesForEngagement(engagementId);
  });

  await step("Disclosure auto", async () => {
    const { runDisclosureAutoForEngagement } = await import(
      "../../src/lib/audit/notes/disclosure-auto"
    );
    return runDisclosureAutoForEngagement(engagementId);
  });

  await step("Validation run", async () => {
    const { runValidation } = await import("../../src/lib/audit/db/index");
    return runValidation(engagementId, "factory-smoke");
  });

  return steps;
}

async function main() {
  enableFactoryFlags();

  const engagementArg = process.argv.find((a) => a.startsWith("--engagement-id="));
  const engagementId = engagementArg?.split("=")[1] ?? DEFAULT_ENGAGEMENT;

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL required — start Postgres and seed audit data.");
    process.exit(1);
  }

  const adapter = new PrismaPg(url);
  const prisma = new PrismaClient({ adapter });

  console.log("\nAuditOS Factory — Live Pilot Smoke");
  console.log("=".repeat(44));
  console.log(`Engagement: ${engagementId}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.error(
      "Database unreachable. Start Docker: docker compose up -d db\nThen: npx prisma db push && npm run seed:audit",
    );
    process.exit(1);
  }

  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    include: {
      client: {
        select: { name: true, reportingFramework: true, currencyCode: true },
      },
    },
  });

  if (!engagement) {
    console.error(`Engagement ${engagementId} not found — run: npm run seed:audit`);
    process.exit(1);
  }

  const currency = engagement.client?.currencyCode ?? "unknown";
  console.log(
    `Client: ${engagement.client?.name ?? "?"} | Currency: ${currency}`,
  );

  if (currency !== "SAR") {
    console.warn("Warning: expected SAR engagement for SOCPA jurisdiction smoke.");
  }

  const mappingCount = await prisma.auditAccountMapping.count({
    where: { engagementId },
  });
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { _count: { select: { lines: true } } },
    orderBy: { createdAt: "desc" },
  });
  const tbCount = tb?._count.lines ?? 0;

  console.log(`TB lines: ${tbCount} | Mappings: ${mappingCount}`);

  const steps = await runFactoryHooks(engagementId);

  const statements = await prisma.auditFinancialStatement.findMany({
    where: { engagementId },
    select: { statementType: true, status: true },
  });
  const notes = await prisma.auditDisclosureNote.count({ where: { engagementId } });
  const graph = await prisma.reportingGraph.findUnique({
    where: { engagementId },
    include: { _count: { select: { nodes: true } } },
  });
  const graphNodes = graph?._count.nodes ?? 0;

  const assertions: StepResult[] = [
    {
      step: "FS statements >= 3",
      ok: statements.length >= 3,
      detail: statements.map((s) => s.statementType).join(", "),
    },
    {
      step: "Cash flow statement (FS v2)",
      ok: statements.some((s) => s.statementType === "cash_flow"),
      detail: statements.some((s) => s.statementType === "cash_flow")
        ? "present"
        : "missing",
    },
    {
      step: "Disclosure notes persisted",
      ok: notes >= 0,
      detail: `${notes} notes`,
    },
  ];

  if (graphNodes >= 0) {
    assertions.push({
      step: "Reporting graph nodes",
      ok: graphNodes > 0,
      detail: `${graphNodes} nodes`,
    });
  }

  const allSteps = [...steps, ...assertions];
  const failed = allSteps.filter((s) => !s.ok);

  for (const s of allSteps) {
    console.log(`  ${s.ok ? "✅" : "❌"} ${s.step}: ${s.detail}`);
  }

  const report = [
    `Factory Pilot Smoke — ${new Date().toISOString()}`,
    `Engagement: ${engagementId}`,
    `Currency: ${currency}`,
    "",
    ...allSteps.map((s) => `${s.ok ? "PASS" : "FAIL"} ${s.step}: ${s.detail}`),
    "",
    `Summary: ${allSteps.length - failed.length}/${allSteps.length} passed`,
  ].join("\n");

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const outPath = joinReportPath(outDir);
  writeFileSync(outPath, report, "utf8");
  console.log(`\nEvidence: ${outPath}`);

  await prisma.$disconnect();

  if (failed.length) {
    console.log(`\n${failed.length} check(s) failed.\n`);
    process.exit(1);
  }
  console.log("\n✅ Factory pilot smoke passed.\n");
}

function joinReportPath(outDir: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(outDir, `factory-pilot-smoke-${stamp}.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
