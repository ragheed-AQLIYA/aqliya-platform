#!/usr/bin/env node
/**
 * AQLIYA — Pilot Execution Readiness Check (Phase 7)
 *
 * Usage: node scripts/platform/pilot-readiness-check.mjs
 * Writes: backups/pilot-reports/pilot-readiness-<timestamp>.json
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

import { prisma } from "../db-utils/prisma.mjs";

const REPORT_DIR = resolve(root, "backups/pilot-reports");

function check(id, status, detail) {
  return { id, status, detail };
}

async function evidenceCoverage() {
  const auditTotal = await prisma.auditEvidence.count();
  const lcTotal = await prisma.localContentEvidence.count();
  const auditCore = await prisma.coreEvidence.count({
    where: { productSlug: "audit" },
  });
  const lcCore = await prisma.coreEvidence.count({
    where: { productSlug: "local_content" },
  });
  const productTotal = auditTotal + lcTotal;
  const coreTotal = auditCore + lcCore;
  const percent =
    productTotal === 0 ? 100 : Math.round((coreTotal / productTotal) * 100);
  return {
    audit: { productTotal: auditTotal, coreTotal: auditCore },
    localContent: { productTotal: lcTotal, coreTotal: lcCore },
    overall: { productTotal, coreTotal, percent },
  };
}

function envChecks() {
  const results = [];

  results.push(
    check(
      "ENV_DATABASE_URL",
      process.env.DATABASE_URL ? "pass" : "fail",
      process.env.DATABASE_URL ? "set" : "missing",
    ),
  );

  const authOk = Boolean(
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  );
  results.push(
    check(
      "ENV_AUTH_SECRET",
      authOk ? "pass" : "fail",
      authOk ? "AUTH_SECRET or NEXTAUTH_SECRET set" : "missing",
    ),
  );

  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (authSecret && authSecret.length < 32) {
    results.push(
      check("ENV_AUTH_SECRET_LENGTH", "warn", "shorter than 32 characters"),
    );
  }

  results.push(
    check(
      "ENV_SCANNER_PROVIDER",
      process.env.SCANNER_PROVIDER === "clamav" ? "pass" : "warn",
      process.env.SCANNER_PROVIDER || "not set (uploads blocked in production)",
    ),
  );

  results.push(
    check(
      "ENV_AI_CLOUD",
      process.env.AI_CLOUD_API_KEY ? "pass" : "warn",
      process.env.AI_CLOUD_API_KEY ? "configured" : "AI assistive features need key",
    ),
  );

  results.push(
    check(
      "ENV_RATE_LIMITER",
      process.env.RATE_LIMITER === "redis" ? "pass" : "warn",
      process.env.RATE_LIMITER || "memory (single-instance only)",
    ),
  );

  results.push(
    check(
      "ENV_REDIS_URL",
      process.env.REDIS_URL ? "pass" : "warn",
      process.env.REDIS_URL ? "configured" : "missing",
    ),
  );

  return results;
}

async function main() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  AQLIYA Pilot Execution Readiness — Phase 7");
  console.log("═══════════════════════════════════════════════\n");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: envChecks(),
    evidence: null,
    migration: null,
    backup: null,
    summary: {},
  };

  try {
    report.evidence = { coverage: await evidenceCoverage() };
    const pct = report.evidence.coverage.overall.percent;
    report.environment.push(
      check(
        "EVIDENCE_BACKFILL_COVERAGE",
        pct === 100 ? "pass" : "fail",
        `${pct}% (${report.evidence.coverage.overall.coreTotal}/${report.evidence.coverage.overall.productTotal})`,
      ),
    );
    console.log(`Evidence backfill coverage: ${pct}%`);
  } catch (err) {
    report.environment.push(
      check(
        "EVIDENCE_BACKFILL_COVERAGE",
        "fail",
        err instanceof Error ? err.message : String(err),
      ),
    );
  }

  try {
    const status = execSync("npx prisma migrate status", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const pending = status.includes("Following migration") && !status.includes("Database schema is up to date");
    report.migration = {
      status: pending ? "pending" : "up_to_date",
      output: status.split("\n").slice(-5).join("\n"),
    };
    report.environment.push(
      check(
        "PRISMA_MIGRATIONS",
        pending ? "fail" : "pass",
        pending ? "pending migrations" : "up to date",
      ),
    );
    console.log(`Migrations: ${pending ? "PENDING" : "up to date"}`);
  } catch (err) {
    report.migration = { status: "error", output: String(err) };
    report.environment.push(check("PRISMA_MIGRATIONS", "fail", "could not verify"));
  }

  report.backup = {
    backupDirExists: existsSync(resolve(root, "backups")),
    evidenceReportsDir: existsSync(resolve(root, "backups/evidence-reports")),
    restoreDrillScript: existsSync(
      resolve(root, "scripts/platform/restore-drill.mjs"),
    ),
    dbBackupScript: existsSync(resolve(root, "scripts/platform/db-backup.ts")),
  };
  report.environment.push(
    check(
      "BACKUP_AUTOMATION_SCRIPTS",
      report.backup.dbBackupScript && report.backup.restoreDrillScript
        ? "pass"
        : "warn",
      "scripts present; live RDS drill not verified locally",
    ),
  );

  const fails = report.environment.filter((c) => c.status === "fail").length;
  const warns = report.environment.filter((c) => c.status === "warn").length;
  report.summary = { fails, warns, passes: report.environment.length - fails - warns };

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const outPath = resolve(REPORT_DIR, `pilot-readiness-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\nSummary: ${report.summary.passes} pass, ${report.summary.warns} warn, ${report.summary.fails} fail`);
  console.log(`Report: ${outPath}\n`);

  await prisma.$disconnect();
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
