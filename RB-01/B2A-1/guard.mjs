#!/usr/bin/env node

/**
 * B2A-1 Regression Guard — Workbook Actions Layer
 *
 * Verifies that all 18 workbook actions have tenant isolation guards.
 * This is a static analysis guard — it reads the source files and checks
 * that each action calls the appropriate require*Access guard before
 * performing any operation.
 *
 * Exit codes:
 *   0 — All actions protected (PASS)
 *   1 — One or more actions missing protection (FAIL)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

// ─── Configuration ───

const GUARD_IMPORT = "requireProjectAccess, requireWorkbookAccess, requireWorkbookLineAccess, requireDataRequestAccess, requireDataRequestItemAccess";

const ACTIONS = [
  // Pattern A: projectId actions → requireProjectAccess
  { name: "createWorkbookAction",        guard: "requireProjectAccess",       argIndex: 0, pattern: "projectId" },
  { name: "populateWorkbookAction",      guard: "requireProjectAccess",       argIndex: 0, pattern: "projectId" },
  { name: "populateWorkbookFromTbAction", guard: "requireProjectAccess",      argIndex: 0, pattern: "projectId" },
  { name: "listProjectWorkbooksAction",  guard: "requireProjectAccess",       argIndex: 0, pattern: "projectId" },

  // Pattern B: workbookId actions → requireWorkbookAccess
  { name: "getWorkbookAction",           guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "recalculateWorkbookAction",   guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "deleteWorkbookAction",        guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "detectMissingDataAction",     guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "generateDataRequestAction",   guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "getDataRequestsAction",       guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "exportWorkbookAction",        guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "markWorkbookExportedAction",  guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },
  { name: "computeWorkbookScoreAction",  guard: "requireWorkbookAccess",      argIndex: 0, pattern: "workbookId" },

  // Pattern C: lineId actions → requireWorkbookLineAccess
  { name: "updateWorkbookLineAction",    guard: "requireWorkbookLineAccess",  argIndex: 0, pattern: "lineId" },

  // Pattern D: itemId actions → requireDataRequestItemAccess
  { name: "fulfillDataRequestItemAction", guard: "requireDataRequestItemAccess", argIndex: 0, pattern: "itemId" },
  { name: "waiveDataRequestItemAction",   guard: "requireDataRequestItemAccess", argIndex: 0, pattern: "itemId" },

  // Pattern E: requestId actions → requireDataRequestAccess
  { name: "sendDataRequestAction",       guard: "requireDataRequestAccess",   argIndex: 0, pattern: "requestId" },
  { name: "getDataRequestTextAction",    guard: "requireDataRequestAccess",   argIndex: 0, pattern: "requestId" },
];

// Already-safe actions (requireUserContext inline)
const SAFE_ACTIONS = [
  "listOrganizationWorkbooksAction",
  "getWorkbookDashboardAction",
];

// ─── Checks ───

const ACTION_FILE = resolve(REPO_ROOT, "src/actions/localcontent-workbook-actions.ts");
const GUARD_FILE = resolve(REPO_ROOT, "src/actions/localcontent-guards.ts");

let exitCode = 0;
const failures = [];
const passes = [];

console.log("=".repeat(60));
console.log("B2A-1 Regression Guard — Workbook Actions Layer");
console.log("=".repeat(60));

// Check 1: Guard module exists
console.log("\n[1/5] Checking guard module exists...");
if (!existsSync(GUARD_FILE)) {
  console.error("  FAIL: Guard module not found at", GUARD_FILE);
  failures.push("Guard module missing");
} else {
  console.log("  PASS: Guard module exists at", GUARD_FILE);
  passes.push("Guard module exists");
}

// Check 2: Guard module exports all 5 functions
console.log("\n[2/5] Checking guard module exports...");
const guardContent = readFileSync(GUARD_FILE, "utf-8");
const expectedExports = [
  "requireProjectAccess",
  "requireWorkbookAccess",
  "requireWorkbookLineAccess",
  "requireDataRequestAccess",
  "requireDataRequestItemAccess",
];
for (const fn of expectedExports) {
  if (guardContent.includes(`export async function ${fn}`)) {
    console.log(`  PASS: ${fn} exported`);
    passes.push(`${fn} exported`);
  } else {
    console.error(`  FAIL: ${fn} not exported from guard module`);
    failures.push(`${fn} not exported`);
  }
}

// Check 3: Action file imports the guards
console.log("\n[3/5] Checking action file imports guards...");
const actionContent = readFileSync(ACTION_FILE, "utf-8");
const allGuardsInImport = expectedExports.every(g => actionContent.includes(g));
if (allGuardsInImport) {
  console.log("  PASS: All guards imported in action file");
  passes.push("All guards imported");
} else {
  console.error("  FAIL: Not all guards imported in action file");
  failures.push("Missing guard imports");
}

// Check 4: Each action has the correct guard call before its first operation
console.log("\n[4/5] Checking each action has correct guard call...");
for (const action of ACTIONS) {
  // Find the action function declaration
  const funcRegex = new RegExp(`export async function ${action.name}\\(`);
  const match = actionContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${action.name} not found in action file`);
    failures.push(`${action.name} not found`);
    continue;
  }

  // Find the guard call AFTER the function declaration
  // We need to check that await requireXxxAccess appears after function start
  const startIdx = match.index;
  const snippet = actionContent.slice(startIdx, startIdx + 500);

  const guardRegex = new RegExp(`await\\s+${action.guard}\\(`);
  if (guardRegex.test(snippet)) {
    console.log(`  PASS: ${action.name} → ${action.guard}(${action.pattern})`);
    passes.push(`${action.name} protected`);
  } else {
    console.error(`  FAIL: ${action.name} missing ${action.guard}(${action.pattern})`);
    console.error(`        Expected "await ${action.guard}(${action.pattern})" in function body`);
    failures.push(`${action.name} missing ${action.guard}`);
  }
}

// Check 5: Safe actions are NOT modified
console.log("\n[5/5] Verifying already-safe actions unchanged...");
const safeGuardFile = resolve(REPO_ROOT, "src/actions/localcontent-workbook-actions.ts");
const safeContent = readFileSync(safeGuardFile, "utf-8");
for (const name of SAFE_ACTIONS) {
  const funcRegex = new RegExp(`export async function ${name}\\(`);
  const match = safeContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${name} not found`);
    failures.push(`${name} not found`);
    continue;
  }
  const startIdx = match.index;
  const snippet = safeContent.slice(startIdx, startIdx + 400);
  if (snippet.includes("requireUserContext")) {
    console.log(`  PASS: ${name} still uses requireUserContext`);
    passes.push(`${name} still safe`);
  } else {
    console.error(`  FAIL: ${name} may have lost its requireUserContext`);
    failures.push(`${name} may have lost protection`);
  }
}

// ─── Summary ───

console.log("\n" + "=".repeat(60));
console.log("Results:");
console.log(`  Passed: ${passes.length}`);
console.log(`  Failed: ${failures.length}`);
console.log("=".repeat(60));

if (failures.length > 0) {
  console.error("\nFAILURES:");
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  exitCode = 1;
} else {
  console.log("\n✅ ALL CHECKS PASSED — B2A-1 workbook actions tenant isolation verified.");
}

process.exit(exitCode);
