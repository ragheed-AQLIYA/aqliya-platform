#!/usr/bin/env node
/**
 * EngineeringOS — operating system for engineering quality lifecycle
 *
 * Links analysis → execution → verification → closure.
 * Never modifies application source.
 *
 * Usage:
 *   node engineering/os/run.mjs
 *   node engineering/os/run.mjs --impact enforce
 *   node engineering/os/run.mjs --impact src/lib/authorization
 *   node engineering/os/run.mjs --adr
 *   node engineering/os/run.mjs --lifecycle sync
 *   node engineering/os/run.mjs --lifecycle assign --fp XXX --wave Wave-8
 *   node engineering/os/run.mjs --lifecycle verified --fp XXX
 */

import { buildKnowledgeGraph } from "./knowledge-graph.mjs";
import { analyzeChangeImpact } from "./change-impact.mjs";
import { runComplianceEngine } from "./compliance.mjs";
import { runProductLifecycleMonitor } from "./product-lifecycle.mjs";
import { runReleaseReadiness } from "./release-readiness.mjs";
import { runKpiEngine } from "./kpi.mjs";
import { runAdrValidation } from "./adr-validation.mjs";
import {
  runFindingLifecycle,
  transitionFinding,
  writeLifecycleReport,
  loadLifecycle,
} from "./finding-lifecycle.mjs";
import { buildExecutivePortal } from "./executive-portal.mjs";
import { ensureOsDirs } from "./lib.mjs";
import { isoNow } from "../lib/fs-utils.mjs";

function parseArgs(argv) {
  const args = { mode: "full", target: null, fp: null, wave: null, state: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--impact") {
      args.mode = "impact";
      args.target = argv[++i] || "enforce";
    } else if (a === "--adr") args.mode = "adr";
    else if (a === "--compliance") args.mode = "compliance";
    else if (a === "--lifecycle") {
      args.mode = "lifecycle";
      args.state = argv[++i] || "sync";
    } else if (a === "--fp") args.fp = argv[++i];
    else if (a === "--wave") args.wave = argv[++i];
    else if (a === "--help" || a === "-h") args.mode = "help";
  }
  return args;
}

function help() {
  console.log(`
EngineeringOS — AQLIYA

  npm run eng:os                         Full OS run
  npm run eng:os -- --impact enforce     Change impact for symbol/path
  npm run eng:os -- --adr                Validate ADRs against code
  npm run eng:os -- --compliance         Compliance only
  npm run eng:os -- --lifecycle sync     Sync finding board
  npm run eng:os -- --lifecycle assign --fp <id> --wave Wave-8
  npm run eng:os -- --lifecycle implemented --fp <id>
  npm run eng:os -- --lifecycle verified --fp <id>
  npm run eng:os -- --lifecycle closed --fp <id>

Finding lifecycle:
  Finding → Priority → Assigned Wave → Implemented → Verified → Closed → Archived
`);
}

async function runFull() {
  ensureOsDirs();
  console.log("══════════════════════════════════════════════");
  console.log(" AQLIYA EngineeringOS");
  console.log(` ${isoNow()}`);
  console.log(" Analysis → Execution → Verification → Closure");
  console.log("══════════════════════════════════════════════");

  console.log("\n▶ 1/8 Knowledge Graph");
  const graph = await buildKnowledgeGraph();
  console.log(`  nodes=${graph.stats.nodes} edges=${graph.stats.edges} enforce≈${graph.stats.enforceUsages}`);

  console.log("\n▶ 2/8 Change Impact (default: enforce)");
  const impact = await analyzeChangeImpact({ target: "enforce" });
  console.log(`  risk=${impact.riskLevel} products=${impact.products.length} files=${impact.affectedFiles.length}`);

  console.log("\n▶ 3/8 Architectural Compliance");
  const comp = await runComplianceEngine();
  console.log(`  compliance=${comp.overall}%`);

  console.log("\n▶ 4/8 Product Lifecycle");
  const life = await runProductLifecycleMonitor();
  console.log(`  products=${life.products.length}`);

  console.log("\n▶ 5/8 Release Readiness");
  const rel = await runReleaseReadiness();
  console.log(`  cards=${rel.cards.length}`);

  console.log("\n▶ 6/8 KPI Engine");
  await runKpiEngine();
  console.log("  KPI.md written");

  console.log("\n▶ 7/8 ADR Validation");
  const adr = await runAdrValidation();
  console.log(`  ADR compliance=${adr.overall}%`);

  console.log("\n▶ Finding Lifecycle sync");
  const board = runFindingLifecycle();
  console.log(`  tracked=${Object.keys(board.items || {}).length}`);

  console.log("\n▶ 8/8 Executive Portal");
  const portal = await buildExecutivePortal();
  console.log(`  platform=${portal.overall} pilotReady=${portal.pilotReady} prodReady=${portal.productionReady}`);

  console.log("\n══════════════════════════════════════════════");
  console.log(" Artifacts: engineering/os/*.md");
  console.log(" Portal:    engineering/os/EXECUTIVE_PORTAL.md");
  console.log(" Board:     engineering/os/FINDING_LIFECYCLE.md");
  console.log("══════════════════════════════════════════════\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.mode === "help") {
    help();
    return;
  }
  if (args.mode === "impact") {
    await buildKnowledgeGraph();
    const r = await analyzeChangeImpact({ target: args.target, wave: args.wave });
    console.log(`Impact ${args.target}: ${r.riskLevel} (${r.risk}) → engineering/os/IMPACT_REPORT.md`);
    return;
  }
  if (args.mode === "adr") {
    const r = await runAdrValidation();
    console.log(`ADR validation: ${r.overall}%`);
    return;
  }
  if (args.mode === "compliance") {
    const r = await runComplianceEngine();
    console.log(`Compliance: ${r.overall}%`);
    return;
  }
  if (args.mode === "lifecycle") {
    if (args.state === "sync") {
      runFindingLifecycle();
      console.log("Lifecycle board synced → engineering/os/FINDING_LIFECYCLE.md");
      return;
    }
    const map = {
      assign: "assigned",
      assigned: "assigned",
      prioritized: "prioritized",
      implemented: "implemented",
      verified: "verified",
      closed: "closed",
      archived: "archived",
      finding: "finding",
    };
    const next = map[args.state];
    if (!next) {
      console.error("Unknown lifecycle action:", args.state);
      process.exitCode = 1;
      return;
    }
    if (!args.fp) {
      console.error("Requires --fp <fingerprint>");
      process.exitCode = 1;
      return;
    }
    if (next === "assigned" && !args.wave) {
      console.error("assign requires --wave Wave-N");
      process.exitCode = 1;
      return;
    }
    const item = transitionFinding(args.fp, next, { wave: args.wave, actor: "cli" });
    console.log(`${item.fingerprint}: ${next}${item.wave ? " @ " + item.wave : ""}`);
    return;
  }

  await runFull();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
