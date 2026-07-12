#!/usr/bin/env node
/**
 * AQLIYA Execution Programs runner
 *
 * Programs A–E + Delivery Planner + ROI Optimizer + Enterprise Readiness
 * Agent freeze after this layer — see AGENT_FREEZE.md
 */

import {
  writeProgramAStatus,
  writeProgramBStatus,
  writeProgramDStatus,
  ensureProgramsDirs,
} from "./registry.mjs";
import {
  writeDeliveryBoardMd,
  transitionDelivery,
  loadDeliveryBoard,
} from "./delivery-governance.mjs";
import { runDeliveryPlanner } from "./delivery-planner.mjs";
import { runRoiOptimizer } from "./roi-optimizer.mjs";
import { runEnterpriseReadiness } from "./enterprise-readiness.mjs";
import { engPath, writeText, isoNow } from "../lib/fs-utils.mjs";

function parseArgs(argv) {
  const args = { mode: "full", id: null, wave: null, state: null, topN: 15 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--delivery") {
      args.mode = "delivery";
      args.state = argv[++i];
    } else if (a === "--id") args.id = argv[++i];
    else if (a === "--wave") args.wave = argv[++i];
    else if (a === "--plan") args.mode = "plan";
    else if (a === "--roi") {
      args.mode = "roi";
      if (argv[i + 1] && !argv[i + 1].startsWith("-")) args.topN = Number(argv[++i]) || 15;
    } else if (a === "--enterprise") args.mode = "enterprise";
    else if (a === "--help" || a === "-h") args.mode = "help";
  }
  return args;
}

function help() {
  console.log(`
AQLIYA Execution Programs

  npm run eng:programs                 Full: A–E status + planner + ROI + enterprise
  npm run eng:programs -- --plan       Delivery Planner only
  npm run eng:programs -- --roi 15     ROI Optimizer Top N
  npm run eng:programs -- --enterprise Enterprise Readiness
  npm run eng:programs -- --delivery assign --id <fp> --wave Wave-9
  npm run eng:programs -- --delivery measured --id <fp>

Agent freeze: engineering/programs/AGENT_FREEZE.md
`);
}

function writeProgramCStatus() {
  const md = [
    "# Program C — Engineering Excellence",
    "",
    `**Updated:** ${isoNow()}`,
    "",
    "EngineeringOS is **frozen** as the quality operating system.",
    "",
    "| Responsibility | Surface |",
    "| -------------- | ------- |",
    "| KPIs | `engineering/os/KPI.md` |",
    "| Compliance | `engineering/os/COMPLIANCE.md` |",
    "| Findings + verify | `engineering/os/FINDING_LIFECYCLE.md` |",
    "| Release readiness | `engineering/os/RELEASE_READINESS.md` |",
    "",
    "See `AGENT_FREEZE.md` — no new agents without Governance ADR.",
    "",
  ].join("\n");
  writeText(engPath("programs", "c-engineering.md"), md);
}

async function runFull() {
  ensureProgramsDirs();
  console.log("══════════════════════════════════════════════");
  console.log(" AQLIYA Execution Programs");
  console.log(` ${isoNow()}`);
  console.log(" A–E · Planner · ROI · Enterprise Readiness");
  console.log("══════════════════════════════════════════════");

  console.log("\n▶ Program A — Platform");
  writeProgramAStatus();

  console.log("▶ Program B — Products");
  const products = writeProgramBStatus();
  for (const p of products.slice(0, 5)) {
    console.log(`  ${p.product} ${p.bar} ${p.pct}%`);
  }

  writeProgramCStatus();
  console.log("▶ Program C — Engineering Excellence (frozen agents)");

  console.log("▶ Program D — Architecture Governance");
  writeProgramDStatus();

  console.log("\n▶ Delivery Planner");
  const plan = await runDeliveryPlanner({ waveCount: 3, maxPerWave: 8 });
  for (const w of plan.waves) {
    console.log(
      `  ${w.id} · ${w.product} · ${w.findingCount} findings · ROI ${w.roi} · ${w.risk} · ${w.effortDays}d`
    );
  }

  console.log("\n▶ ROI Optimizer");
  const roi = await runRoiOptimizer({ topN: 15 });
  console.log(
    `  Health ${roi.currentHealth} → ${roi.projectedHealth} (+${roi.projectedLift}) · effort ${roi.totalEffort}d`
  );

  console.log("\n▶ Enterprise Readiness");
  const ent = await runEnterpriseReadiness();
  console.log(`  Enterprise Readiness ${ent.enterpriseReadiness}%`);

  writeDeliveryBoardMd();

  console.log("\n══════════════════════════════════════════════");
  console.log(" PROGRAMS.md · DELIVERY_PLAN.md · ROI_OPTIMIZER.md");
  console.log(" ENTERPRISE_READINESS.md · DELIVERY_BOARD.md");
  console.log(" AGENT_FREEZE.md — stop adding agents; complete products");
  console.log("══════════════════════════════════════════════\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.mode === "help") {
    help();
    return;
  }
  if (args.mode === "plan") {
    const plan = await runDeliveryPlanner();
    console.log(`Planned ${plan.waves.length} waves → programs/DELIVERY_PLAN.md`);
    return;
  }
  if (args.mode === "roi") {
    const roi = await runRoiOptimizer({ topN: args.topN });
    console.log(`${roi.currentHealth} → ${roi.projectedHealth}`);
    return;
  }
  if (args.mode === "enterprise") {
    const ent = await runEnterpriseReadiness();
    console.log(`Enterprise Readiness ${ent.enterpriseReadiness}%`);
    return;
  }
  if (args.mode === "delivery") {
    if (!args.state || args.state === "sync") {
      writeDeliveryBoardMd();
      console.log("Delivery board refreshed");
      return;
    }
    if (!args.id) {
      console.error("Requires --id <fingerprint>");
      process.exitCode = 1;
      return;
    }
    const item = transitionDelivery(args.id, args.state, { wave: args.wave });
    console.log(`${item.id}: ${item.state}${item.wave ? " @ " + item.wave : ""}`);
    return;
  }
  await runFull();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
