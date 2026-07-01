#!/usr/bin/env node
/**
 * Pilot Launch Closure — unified validation orchestrator
 *
 * Usage: node scripts/platform/pilot-launch-closure.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

const REPORT_DIR = resolve(root, "backups/pilot-reports");

function run(label, cmd, env = {}) {
  const started = Date.now();
  try {
    execSync(cmd, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: "pipe",
      encoding: "utf8",
    });
    return { label, ok: true, durationMs: Date.now() - started };
  } catch (err) {
    return {
      label,
      ok: false,
      durationMs: Date.now() - started,
      error: err.stderr?.toString?.() ?? err.message ?? String(err),
    };
  }
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    closureItems: [],
    evidenceCoverage: null,
    verdict: "NO GO",
  };

  // 1 — ClamAV scanner smoke
  report.closureItems.push(
    run(
      "clamav_upload_smoke",
      "node scripts/platform/pilot-upload-scanner-smoke.mjs",
      {
        SCANNER_PROVIDER: "clamav",
        CLAMAV_HOST: process.env.CLAMAV_HOST ?? "127.0.0.1",
        CLAMAV_PORT: process.env.CLAMAV_PORT ?? "3310",
        NODE_ENV: "production",
      },
    ),
  );

  // 2 — Redis rate limiter
  report.closureItems.push(
    run(
      "redis_rate_limit_load",
      "node scripts/platform/pilot-rate-limit-load.mjs",
      {
        RATE_LIMITER: "redis",
        REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
      },
    ),
  );

  // 3 — Evidence coverage
  report.closureItems.push(
    run("pilot_readiness", "npm run platform:pilot-readiness"),
  );

  // 4 — Restore drill (if backup exists)
  const backupDir = resolve(root, "backups");
  const hasBackup = existsSync(backupDir) &&
    (readdirSync(backupDir).some((f) => f.endsWith(".sql") || f.endsWith(".dump")));
  if (hasBackup) {
    const drillStart = Date.now();
    try {
      execSync("node scripts/platform/restore-drill.mjs", {
        cwd: root,
        env: process.env,
        stdio: "pipe",
      });
      report.closureItems.push({
        label: "restore_drill",
        ok: true,
        durationMs: Date.now() - drillStart,
        rtoMs: Date.now() - drillStart,
        note: "Local drill DB restore — RDS drill requires live infra runbook",
      });
    } catch (err) {
      report.closureItems.push({
        label: "restore_drill",
        ok: false,
        error: err.message,
      });
    }
  } else {
    report.closureItems.push({
      label: "restore_drill",
      ok: false,
      error: "No backup file in ./backups — run npm run db:backup first",
    });
  }

  // Parse latest pilot-readiness for coverage
  try {
    const readinessFiles = execSync(
      `powershell -Command "Get-ChildItem '${REPORT_DIR}' -Filter pilot-readiness-*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName"`,
      { encoding: "utf8" },
    ).trim();
    if (readinessFiles) {
      const data = JSON.parse(readFileSync(readinessFiles, "utf8"));
      report.evidenceCoverage = data.evidence?.coverage?.overall?.percent ?? null;
    }
  } catch {
    // ignore
  }

  // AI decision file check
  const aiDecisionPath = resolve(root, "docs/operations/PILOT_AI_SCOPE_DECISION.md");
  report.aiScopeDocumented = existsSync(aiDecisionPath);

  // On-call roster check
  const oncallPath = resolve(root, "docs/operations/PILOT_ONCALL_ROSTER.md");
  report.oncallRosterDocumented = existsSync(oncallPath);

  const fails = report.closureItems.filter((c) => !c.ok).length;
  const coverageOk = report.evidenceCoverage === 100;
  const opsDocsOk = report.aiScopeDocumented && report.oncallRosterDocumented;

  if (fails === 0 && coverageOk && opsDocsOk) {
    report.verdict = "GO";
  } else if (fails <= 1 && coverageOk) {
    report.verdict = "GO WITH CONDITIONS";
  } else {
    report.verdict = "NO GO";
  }

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const out = resolve(REPORT_DIR, `pilot-launch-closure-${Date.now()}.json`);
  writeFileSync(out, JSON.stringify(report, null, 2));

  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Pilot Launch Closure — ${report.verdict}`);
  console.log("═══════════════════════════════════════════════\n");
  for (const item of report.closureItems) {
    console.log(`  ${item.ok ? "✓" : "✗"} ${item.label}${item.durationMs ? ` (${item.durationMs}ms)` : ""}`);
  }
  console.log(`\nEvidence coverage: ${report.evidenceCoverage ?? "unknown"}%`);
  console.log(`Report: ${out}\n`);

  process.exit(report.verdict === "GO" ? 0 : 1);
}

main();
