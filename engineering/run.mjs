#!/usr/bin/env node
/**
 * AQLIYA Engineering Intelligence Platform — Continuous Audit
 *
 * Flow:
 *   Audit → Data Lake (append) → History → Trend → Root Cause
 *        → Prediction → Recommendation → Smart Gates → Dashboards
 *
 * NEVER modifies application source.
 *
 * Usage:
 *   node engineering/run.mjs
 *   node engineering/run.mjs --agent security
 *   node engineering/run.mjs --intel
 *   node engineering/run.mjs --weekly
 *   node engineering/run.mjs --gates
 *   node engineering/run.mjs --ci
 *   node engineering/run.mjs --compare
 */

import { AGENTS, INTEL_AGENTS } from "./config.mjs";
import { agentModules } from "./agents/index.mjs";
import { resetFindingSeq } from "./lib/findings.mjs";
import { ensureDir, engPath, writeJson, isoNow } from "./lib/fs-utils.mjs";
import { ensureDataLake } from "./lib/data-lake.mjs";
import { ingestCurrentAudit } from "./lib/ingest.mjs";
import { generateDashboard } from "./dashboard/generate.mjs";
import { writeExecutiveDashboard } from "./dashboard/scorecards.mjs";
import { writeMetrics, calculateMetrics } from "./metrics/calculate.mjs";
import { evaluateGates, writeGatesReport } from "./gates/quality-gates.mjs";
import { generateRefactorSuggestions } from "./refactors/generate-refactors.mjs";
import { updateKnowledgeBase } from "./knowledge/update.mjs";
import { generateWeeklyReport } from "./reports/weekly-report.mjs";
import { writeArchitectureMemoryReport } from "./intelligence/architecture-memory/sync.mjs";

async function runEngineeringOs() {
  const { buildKnowledgeGraph } = await import("./os/knowledge-graph.mjs");
  const { runComplianceEngine } = await import("./os/compliance.mjs");
  const { runProductLifecycleMonitor } = await import("./os/product-lifecycle.mjs");
  const { runReleaseReadiness } = await import("./os/release-readiness.mjs");
  const { runKpiEngine } = await import("./os/kpi.mjs");
  const { runAdrValidation } = await import("./os/adr-validation.mjs");
  const { runFindingLifecycle } = await import("./os/finding-lifecycle.mjs");
  const { buildExecutivePortal } = await import("./os/executive-portal.mjs");
  await buildKnowledgeGraph();
  await runComplianceEngine();
  await runProductLifecycleMonitor();
  await runReleaseReadiness();
  await runKpiEngine();
  await runAdrValidation();
  runFindingLifecycle();
  await buildExecutivePortal();
}

function parseArgs(argv) {
  const args = {
    agent: null,
    weeklyOnly: false,
    gatesOnly: false,
    intelOnly: false,
    compare: false,
    ci: false,
    skipPost: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--agent" || a === "-a") args.agent = argv[++i];
    else if (a === "--weekly") args.weeklyOnly = true;
    else if (a === "--gates") args.gatesOnly = true;
    else if (a === "--intel") args.intelOnly = true;
    else if (a === "--compare") args.compare = true;
    else if (a === "--ci") args.ci = true;
    else if (a === "--skip-post") args.skipPost = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`
AQLIYA Engineering Intelligence Platform

  node engineering/run.mjs                 Full audit + intelligence
  node engineering/run.mjs --agent <name>  Single agent
  node engineering/run.mjs --intel         Intelligence agents only (needs prior audit)
  node engineering/run.mjs --compare       Regression detector only
  node engineering/run.mjs --weekly        Weekly report
  node engineering/run.mjs --gates         Smart quality gates
  node engineering/run.mjs --ci            Exit 1 on FAIL gates

Base agents:
  ${AGENTS.join("\n  ")}

Intelligence agents:
  ${INTEL_AGENTS.join("\n  ")}

Hard rule: findings only — never auto-modify application code.
OpenCode = Implementation Authority.

Also: npm run eng:os   (EngineeringOS — graph, compliance, lifecycle, release, KPI)
`);
}

async function runAgent(name) {
  const mod = agentModules[name];
  if (!mod?.run) {
    throw new Error(`Unknown agent: ${name}. Known: ${Object.keys(agentModules).join(", ")}`);
  }
  console.log(`\n▶ Running agent: ${name}`);
  const started = Date.now();
  const result = await mod.run();
  const ms = Date.now() - started;
  console.log(
    `  ✓ ${name} — score ${result.score}/100 · findings ${result.summary?.total ?? "?"} · ${ms}ms`
  );
  return { name, ...result, ms };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  ensureDir(engPath("reports"));
  ensureDir(engPath("refactors"));
  ensureDir(engPath("metrics"));
  ensureDir(engPath("dashboard"));
  ensureDir(engPath("knowledge"));
  ensureDir(engPath("intelligence"));
  ensureDataLake();

  if (args.gatesOnly) {
    const summary = writeGatesReport(evaluateGates());
    if (args.ci && summary.fails > 0) process.exitCode = 1;
    return;
  }

  if (args.weeklyOnly) {
    generateWeeklyReport();
    return;
  }

  if (args.compare) {
    await runAgent("regression-detector");
    return;
  }

  if (args.intelOnly) {
    console.log("══════════════════════════════════════════════");
    console.log(" Engineering Intelligence (history → trends)");
    console.log("══════════════════════════════════════════════");
    for (const name of INTEL_AGENTS) {
      try {
        await runAgent(name);
      } catch (err) {
        console.error(`  ✗ ${name}:`, err?.message || err);
      }
    }
    writeArchitectureMemoryReport();
    writeExecutiveDashboard(calculateMetrics().scores);
    generateDashboard();
    return;
  }

  resetFindingSeq();
  const startedAt = isoNow();
  const agentList = args.agent ? [args.agent] : AGENTS;
  const results = [];

  console.log("══════════════════════════════════════════════");
  console.log(" AQLIYA Engineering Intelligence Audit");
  console.log(` Started: ${startedAt}`);
  console.log(" Mode: READ-ONLY · Audit → Lake → Learn");
  console.log("══════════════════════════════════════════════");

  for (const name of agentList) {
    try {
      results.push(await runAgent(name));
    } catch (err) {
      console.error(`  ✗ ${name} failed:`, err?.message || err);
      results.push({ name, score: 0, error: String(err?.message || err) });
    }
  }

  if (!args.skipPost && !args.agent) {
    console.log("\n▶ Ingest → data lake (append-only)");
    writeMetrics(calculateMetrics());
    const finishedAt = isoNow();
    const ingest = ingestCurrentAudit({
      startedAt,
      finishedAt,
      agentResults: results.map((r) => ({
        name: r.name,
        score: r.score,
        findings: r.summary?.total,
        ms: r.ms,
        error: r.error || null,
      })),
      gates: null,
    });
    console.log(`  ✓ audit ${ingest.auditId} · findings fingerprinted: ${ingest.findingCount}`);

    console.log("\n▶ Intelligence layer");
    const intelResults = [];
    for (const name of INTEL_AGENTS) {
      try {
        intelResults.push(await runAgent(name));
      } catch (err) {
        console.error(`  ✗ ${name}:`, err?.message || err);
      }
    }

    console.log("\n▶ Architecture memory · smart gates · dashboards · EngineeringOS");
    writeArchitectureMemoryReport();
    writeMetrics(calculateMetrics());
    const gateSummary = writeGatesReport(evaluateGates());
    generateRefactorSuggestions();
    updateKnowledgeBase();
    generateDashboard();
    writeExecutiveDashboard(calculateMetrics().scores);
    generateWeeklyReport();

    console.log("\n▶ EngineeringOS (graph · compliance · lifecycle · release · KPI · ADR · portal)");
    try {
      await runEngineeringOs();
    } catch (err) {
      console.error("  ✗ EngineeringOS:", err?.message || err);
    }

    writeJson(engPath("reports", "audit-run.json"), {
      startedAt,
      finishedAt: isoNow(),
      auditId: ingest.auditId,
      agents: results,
      intelligence: intelResults.map((r) => ({
        name: r.name,
        score: r.score,
        findings: r.summary?.total,
      })),
      gates: gateSummary,
    });

    console.log("\n══════════════════════════════════════════════");
    console.log(` Data lake audit: ${ingest.auditId}`);
    console.log(
      ` Gates: PASS=${gateSummary.passes} WARNING=${gateSummary.warns} FAIL=${gateSummary.fails}`
    );
    console.log(" Intelligence: engineering/intelligence/");
    console.log(" Executive: engineering/dashboard/EXECUTIVE.md");
    console.log("══════════════════════════════════════════════\n");

    if (args.ci && gateSummary.fails > 0) process.exitCode = 1;
  } else if (args.agent) {
    writeMetrics(calculateMetrics());
    if (INTEL_AGENTS.includes(args.agent)) {
      /* already ran */
    } else {
      // single base agent — light ingest of available reports
      ingestCurrentAudit({
        startedAt,
        finishedAt: isoNow(),
        agentResults: results,
        gates: null,
      });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
