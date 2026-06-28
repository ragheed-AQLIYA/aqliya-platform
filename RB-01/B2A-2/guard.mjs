#!/usr/bin/env node

/**
 * B2A-2 Regression Guard — Review/V3 Actions Layer
 *
 * Verifies that all 10 review/v3 actions (E13-E21) have tenant isolation guards.
 * Static analysis guard — reads source files and checks guard call presence.
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

// ─── Config: new B2A-2 guards ───

const NEW_GUARDS = [
  "requireOrganizationAccess",
  "requirePatternSuggestionAccess",
  "requireMatchReviewAccess",
];

// ─── Review Actions (E13-E15, E21) ───

const REVIEW_ACTIONS = [
  // E13: reviewSuggestionAction → requirePatternSuggestionAccess(suggestionId)
  { name: "reviewSuggestionAction",   guard: "requirePatternSuggestionAccess",  arg: "suggestionId",  file: "localcontent-review-actions.ts" },
  // E14: reviewExplanationAction → requireMatchReviewAccess(matchReviewId)
  { name: "reviewExplanationAction",  guard: "requireMatchReviewAccess",       arg: "matchReviewId",  file: "localcontent-review-actions.ts" },
  // E15: batchReviewAction → requirePatternSuggestionAccess(id) / requireMatchReviewAccess(id)
  { name: "batchReviewAction",        guard: "requirePatternSuggestionAccess", arg: "id (suggestion)", file: "localcontent-review-actions.ts" },
  { name: "batchReviewAction",        guard: "requireMatchReviewAccess",       arg: "id (match)",     file: "localcontent-review-actions.ts" },
  // E21: getReviewQueueAction → requireOrganizationAccess(organizationId)
  { name: "getReviewQueueAction",     guard: "requireOrganizationAccess",      arg: "organizationId", file: "localcontent-review-actions.ts" },
];

// ─── V3 AI Advisor Actions (E16-E20) ───

const V3_ACTIONS = [
  // E16: runWorkbookAiReviewAction → requireOrganizationAccess + requireWorkbookAccess
  { name: "runWorkbookAiReviewAction",         guard1: "requireOrganizationAccess", guard2: "requireWorkbookAccess", file: "localcontent-ai-advisor-v3-actions.ts" },
  // E17: getWorkbookReviewStatusAction → requireOrganizationAccess + requireWorkbookAccess
  { name: "getWorkbookReviewStatusAction",     guard1: "requireOrganizationAccess", guard2: "requireWorkbookAccess", file: "localcontent-ai-advisor-v3-actions.ts" },
  // E18: generateRecommendationsAction → requireOrganizationAccess + requireWorkbookAccess
  { name: "generateRecommendationsAction",     guard1: "requireOrganizationAccess", guard2: "requireWorkbookAccess", file: "localcontent-ai-advisor-v3-actions.ts" },
  // E19: runSimulationAction → requireOrganizationAccess + requireWorkbookAccess
  { name: "runSimulationAction",               guard1: "requireOrganizationAccess", guard2: "requireWorkbookAccess", file: "localcontent-ai-advisor-v3-actions.ts" },
  // E20: getWorkbookAiDashboardDataAction → requireOrganizationAccess + requireWorkbookAccess
  { name: "getWorkbookAiDashboardDataAction", guard1: "requireOrganizationAccess", guard2: "requireWorkbookAccess", file: "localcontent-ai-advisor-v3-actions.ts" },
];

// ─── File paths ───

const GUARD_FILE = resolve(REPO_ROOT, "src/actions/localcontent-guards.ts");
const REVIEW_FILE = resolve(REPO_ROOT, "src/actions/localcontent-review-actions.ts");
const V3_FILE = resolve(REPO_ROOT, "src/actions/localcontent-ai-advisor-v3-actions.ts");

let exitCode = 0;
const failures = [];
const passes = [];

console.log("=".repeat(60));
console.log("B2A-2 Regression Guard — Review/V3 Actions Layer");
console.log("=".repeat(60));

// ─── Check 1: Guard module exists ───

console.log("\n[1/6] Checking guard module exists...");
if (!existsSync(GUARD_FILE)) {
  console.error("  FAIL: Guard module not found at", GUARD_FILE);
  failures.push("Guard module missing");
} else {
  console.log("  PASS: Guard module exists");
  passes.push("Guard module exists");
}

// ─── Check 2: New guards exported ───

console.log("\n[2/6] Checking new guard functions exported...");
const guardContent = readFileSync(GUARD_FILE, "utf-8");
for (const fn of NEW_GUARDS) {
  if (guardContent.includes(`export async function ${fn}`)) {
    console.log(`  PASS: ${fn} exported`);
    passes.push(`${fn} exported`);
  } else {
    console.error(`  FAIL: ${fn} not exported from guard module`);
    failures.push(`${fn} not exported`);
  }
}

// ─── Check 3: Review actions file imports guards ───

console.log("\n[3/6] Checking review-actions.ts imports guards...");
if (!existsSync(REVIEW_FILE)) {
  console.error("  FAIL: review-actions.ts not found");
  failures.push("review-actions.ts not found");
} else {
  const reviewContent = readFileSync(REVIEW_FILE, "utf-8");
  const hasGuardImport = reviewContent.includes("localcontent-guards");
  if (hasGuardImport) {
    console.log("  PASS: review-actions.ts imports from localcontent-guards");
    passes.push("review-actions imports guards");
  } else {
    console.error("  FAIL: review-actions.ts does not import guards");
    failures.push("review-actions missing guard import");
  }
}

// ─── Check 4: Review action guard calls ───

console.log("\n[4/6] Checking review action guard calls...");
const reviewContent = readFileSync(REVIEW_FILE, "utf-8");
for (const action of REVIEW_ACTIONS) {
  const funcRegex = new RegExp(`export async function ${action.name}\\(`);
  const match = reviewContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${action.name} not found in review-actions.ts`);
    failures.push(`${action.name} not found`);
    continue;
  }

  const startIdx = match.index;
  const snippet = reviewContent.slice(startIdx, startIdx + 2000);

  const guardRegex = new RegExp(`await\\s+${action.guard}\\(`);
  if (guardRegex.test(snippet)) {
    console.log(`  PASS: ${action.name} → ${action.guard}(${action.arg})`);
    passes.push(`${action.name} → ${action.guard}`);
  } else {
    console.error(`  FAIL: ${action.name} missing ${action.guard}(${action.arg})`);
    console.error(`        Expected "await ${action.guard}(...)" in function body`);
    failures.push(`${action.name} missing ${action.guard}`);
  }
}

// ─── Check 5: V3 actions file imports guards ───

console.log("\n[5/6] Checking v3-actions.ts imports guards...");
if (!existsSync(V3_FILE)) {
  console.error("  FAIL: v3-actions.ts not found");
  failures.push("v3-actions.ts not found");
} else {
  const v3Content = readFileSync(V3_FILE, "utf-8");
  const hasGuardImport = v3Content.includes("localcontent-guards");
  if (hasGuardImport) {
    console.log("  PASS: v3-actions.ts imports from localcontent-guards");
    passes.push("v3-actions imports guards");
  } else {
    console.error("  FAIL: v3-actions.ts does not import guards");
    failures.push("v3-actions missing guard import");
  }
}

// ─── Check 6: V3 action guard calls ───

console.log("\n[6/6] Checking v3 action guard calls...");
const v3Content = readFileSync(V3_FILE, "utf-8");
for (const action of V3_ACTIONS) {
  const funcRegex = new RegExp(`export async function ${action.name}\\(`);
  const match = v3Content.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${action.name} not found in v3-actions.ts`);
    failures.push(`${action.name} not found`);
    continue;
  }

  const startIdx = match.index;
  const snippet = v3Content.slice(startIdx, startIdx + 2000);

  const guard1Regex = new RegExp(`await\\s+${action.guard1}\\(`);
  const guard2Regex = new RegExp(`await\\s+${action.guard2}\\(`);

  const hasGuard1 = guard1Regex.test(snippet);
  const hasGuard2 = guard2Regex.test(snippet);

  if (hasGuard1 && hasGuard2) {
    console.log(`  PASS: ${action.name} → ${action.guard1} + ${action.guard2}`);
    passes.push(`${action.name} → ${action.guard1} + ${action.guard2}`);
  } else if (!hasGuard1 && !hasGuard2) {
    console.error(`  FAIL: ${action.name} missing both ${action.guard1} and ${action.guard2}`);
    failures.push(`${action.name} missing both guards`);
  } else if (!hasGuard1) {
    console.error(`  FAIL: ${action.name} missing ${action.guard1}`);
    failures.push(`${action.name} missing ${action.guard1}`);
  } else {
    console.error(`  FAIL: ${action.name} missing ${action.guard2}`);
    failures.push(`${action.name} missing ${action.guard2}`);
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
  console.log("\n✅ ALL CHECKS PASSED — B2A-2 review/v3 actions tenant isolation verified.");
}

process.exit(exitCode);
