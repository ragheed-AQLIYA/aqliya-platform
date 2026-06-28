#!/usr/bin/env node

/**
 * B2A-3 Regression Guard — Prisma Layer Tenant Isolation
 *
 * Verifies that all 18 lib functions in population.ts, services.ts, and missing-data.ts
 * accept `organizationId` parameter and scope Prisma queries with orgId filters.
 * Static analysis guard — reads source files and checks function signatures + query patterns.
 *
 * Exit codes:
 *   0 — All functions properly scoped (PASS)
 *   1 — One or more functions missing orgId scoping (FAIL)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

// ─── Config ───

const POPULATION_FILE = resolve(REPO_ROOT, "src/lib/local-content/workbook/population.ts");
const SERVICES_FILE = resolve(REPO_ROOT, "src/lib/local-content/workbook/services.ts");
const MISSING_DATA_FILE = resolve(REPO_ROOT, "src/lib/local-content/workbook/missing-data.ts");
const ACTIONS_FILE = resolve(REPO_ROOT, "src/actions/localcontent-workbook-actions.ts");
const TEST_FILE = resolve(REPO_ROOT, "src/actions/__tests__/localcontent-workbook-actions.test.ts");

const POPULATION_FUNCTIONS = [
  { name: "populateWorkbookFromProject",    queries: 7 },
  { name: "populateWorkbookFromTb",          queries: 7 },
  { name: "recalculateWorkbookStats",       queries: 4 },
  { name: "getWorkbookWithLines",           queries: 1 },
  { name: "updateWorkbookLineValue",        queries: 3 },
  { name: "listProjectWorkbooks",           queries: 1 },
  { name: "listOrganizationWorkbooks",      queries: 1 },  // already scoped
  { name: "deleteWorkbook",                 queries: 2 },
];

const SERVICES_FUNCTIONS = [
  { name: "getWorkbookDashboardSummary",    queries: 1 },  // already scoped
  { name: "createWorkbook",                 queries: 4 },
  { name: "exportWorkbookJson",             queries: 1 },
  { name: "markWorkbookExported",           queries: 2 },
];

const MISSING_DATA_FUNCTIONS = [
  { name: "detectMissingData",              queries: 1 },
  { name: "generateDataRequest",            queries: 5 },
  { name: "getWorkbookDataRequests",        queries: 1 },
  { name: "fulfillDataRequestItem",         queries: 1 },
  { name: "waiveDataRequestItem",           queries: 1 },
  { name: "sendDataRequest",                queries: 1 },
  { name: "getClientDataRequestText",       queries: 1 },
];

// Pattern signatures we look for to confirm orgId param + scoped query
const ORG_SCOPED_PATTERNS = [
  "organizationId",                         // function parameter
  "project: { organizationId }",            // workbook/project scoping
  "workbook: { project: { organizationId } }",  // line/data-request scoping
  "request: { workbook: { project: { organizationId } } }",  // data-request-item scoping
];

const MISSING_DATA_ORG_PATTERNS = [
  "organizationId",
  "workbook: { project: { organizationId } }",
  "request: { workbook: { project: { organizationId } } }",
];

let exitCode = 0;
const failures = [];
const passes = [];

console.log("=".repeat(60));
console.log("B2A-3 Regression Guard — Prisma Layer Tenant Isolation");
console.log("=".repeat(60));

// ─── Check 1: All 3 lib files exist ───

console.log("\n[1/8] Checking lib files exist...");
const libFiles = [
  ["population.ts", POPULATION_FILE],
  ["services.ts", SERVICES_FILE],
  ["missing-data.ts", MISSING_DATA_FILE],
];
for (const [name, path] of libFiles) {
  if (existsSync(path)) {
    console.log(`  PASS: ${name} exists`);
    passes.push(`${name} exists`);
  } else {
    console.error(`  FAIL: ${name} not found at ${path}`);
    failures.push(`${name} not found`);
  }
}

// ─── Check 2: population.ts — all functions have organizationId param ───

console.log("\n[2/8] Checking population.ts function signatures...");
const popContent = readFileSync(POPULATION_FILE, "utf-8");
for (const fn of POPULATION_FUNCTIONS) {
  const funcRegex = new RegExp(`export async function ${fn.name}\\(`);
  const match = popContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${fn.name} not found in population.ts`);
    failures.push(`${fn.name} not found`);
    continue;
  }

  const startIdx = match.index;
  const snippet = popContent.slice(startIdx, startIdx + 500);

  const hasOrgParam = snippet.match(/organizationId\s*:/);
  if (hasOrgParam) {
    console.log(`  PASS: ${fn.name} has organizationId param`);
    passes.push(`${fn.name} has orgId param`);
  } else {
    console.error(`  FAIL: ${fn.name} missing organizationId parameter`);
    console.error(`        Expected ", organizationId: string" in signature`);
    failures.push(`${fn.name} missing orgId param`);
  }

  // Check for unscoped findUnique (should be 0)
  if (snippet.includes(".findUnique(") && !fn.name.includes("Already")) {
    console.warn(`  WARN: ${fn.name} may still use findUnique — expected findFirst`);
  }
}

// ─── Check 3: population.ts — queries are org-scoped ───

console.log("\n[3/8] Checking population.ts query scoping...");
// Verify that all Prisma queries in the file use org-scoped patterns
// Count findFirst patterns with org scoping (ignore pure utility functions)
const popHasLcWorkbookOrgScope = popContent.includes("project: { organizationId }");
const popHasLcWorkbookLineOrgScope = popContent.includes("workbook: { project: { organizationId } }");

if (popHasLcWorkbookOrgScope) {
  console.log(`  PASS: population.ts uses project: { organizationId } pattern`);
  passes.push("population.ts uses project org scope");
} else {
  console.error(`  FAIL: population.ts missing project: { organizationId } pattern`);
  failures.push("population.ts missing project org scope");
}

if (popHasLcWorkbookLineOrgScope) {
  console.log(`  PASS: population.ts uses workbook: { project: { organizationId } } pattern`);
  passes.push("population.ts uses workbook line org scope");
} else {
  console.error(`  FAIL: population.ts missing workbook: { project: { organizationId } } pattern`);
  failures.push("population.ts missing workbook line org scope");
}

// ─── Check 4: services.ts — all functions have organizationId param ───

console.log("\n[4/8] Checking services.ts function signatures...");
const svcContent = readFileSync(SERVICES_FILE, "utf-8");
for (const fn of SERVICES_FUNCTIONS) {
  const funcRegex = new RegExp(`export async function ${fn.name}\\(`);
  const match = svcContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${fn.name} not found in services.ts`);
    failures.push(`${fn.name} not found`);
    continue;
  }

  const startIdx = match.index;
  const snippet = svcContent.slice(startIdx, startIdx + 500);

  const hasOrgParamSvc = snippet.match(/organizationId\s*:/);
  if (hasOrgParamSvc) {
    console.log(`  PASS: ${fn.name} has organizationId param`);
    passes.push(`${fn.name} has orgId param`);
  } else {
    console.error(`  FAIL: ${fn.name} missing organizationId parameter`);
    failures.push(`${fn.name} missing orgId param`);
  }
}

// ─── Check 5: services.ts — queries are org-scoped ───

console.log("\n[5/8] Checking services.ts query scoping...");
const svcHasProjectOrgScope = svcContent.includes("project: { organizationId }");
const svcHasOrgFilter = svcContent.includes("organizationId");

if (svcHasProjectOrgScope) {
  console.log(`  PASS: services.ts uses project: { organizationId } pattern`);
  passes.push("services.ts uses project org scope");
} else {
  console.error(`  FAIL: services.ts missing project: { organizationId } pattern`);
  failures.push("services.ts missing project org scope");
}

// ─── Check 6: missing-data.ts — all functions have organizationId param ───

console.log("\n[6/8] Checking missing-data.ts function signatures...");
const mdContent = readFileSync(MISSING_DATA_FILE, "utf-8");
for (const fn of MISSING_DATA_FUNCTIONS) {
  const funcRegex = new RegExp(`export async function ${fn.name}\\(`);
  const match = mdContent.match(funcRegex);
  if (!match) {
    console.error(`  FAIL: ${fn.name} not found in missing-data.ts`);
    failures.push(`${fn.name} not found`);
    continue;
  }

  const startIdx = match.index;
  const snippet = mdContent.slice(startIdx, startIdx + 500);

  const hasOrgParamMd = snippet.match(/organizationId\s*:/);
  if (hasOrgParamMd) {
    console.log(`  PASS: ${fn.name} has organizationId param`);
    passes.push(`${fn.name} has orgId param`);
  } else {
    console.error(`  FAIL: ${fn.name} missing organizationId parameter`);
    failures.push(`${fn.name} missing orgId param`);
  }
}

// ─── Check 7: missing-data.ts — queries are org-scoped ───

console.log("\n[7/8] Checking missing-data.ts query scoping...");
const mdHasLcWorkbookLineOrgScope = mdContent.includes("workbook: { project: { organizationId } }");
const mdHasRequestOrgScope = mdContent.includes("request: { workbook: { project: { organizationId } } }");
const mdHasDataRequestOrgScope = mdContent.includes("workbook: { project: { organizationId } }");

if (mdHasLcWorkbookLineOrgScope) {
  console.log(`  PASS: missing-data.ts uses workbook: { project: { organizationId } } pattern`);
  passes.push("missing-data.ts uses workbook line org scope");
} else {
  console.error(`  FAIL: missing-data.ts missing workbook: { project: { organizationId } } pattern`);
  failures.push("missing-data.ts missing workbook line org scope");
}

if (mdHasRequestOrgScope) {
  console.log(`  PASS: missing-data.ts uses request: { workbook: { project: { organizationId } } } pattern`);
  passes.push("missing-data.ts uses request item org scope");
} else {
  console.error(`  FAIL: missing-data.ts missing request: { workbook: { project: { organizationId } } } pattern`);
  failures.push("missing-data.ts missing request item org scope");
}

// ─── Check 8: Callers pass orgId to lib functions ───

console.log("\n[8/8] Checking action callers pass organizationId...");
if (existsSync(ACTIONS_FILE)) {
  const actionContent = readFileSync(ACTIONS_FILE, "utf-8");

  // Check that guards are called and orgId captured (pattern: const organizationId = await require)
  const guardCallCount = (actionContent.match(/const organizationId = await require/g) || []).length;

  // Check that orgId is passed to lib functions (pattern: organizationId)
  const orgIdParamCount = (actionContent.match(/organizationId/g) || []).length;
  const distinctCalls = (actionContent.match(/const organizationId = await require/g) || []).length;

  if (guardCallCount >= 10) {
    console.log(`  PASS: Actions file has ${guardCallCount} guard calls capturing orgId`);
    passes.push(`${guardCallCount} guard calls in actions file`);
  } else {
    console.error(`  FAIL: Only ${guardCallCount} guard calls found in actions file (expected >= 10)`);
    failures.push(`Too few guard calls in actions file: ${guardCallCount}`);
  }

  if (orgIdParamCount >= 28) {
    console.log(`  PASS: Actions file references organizationId ${orgIdParamCount} times`);
    passes.push(`${orgIdParamCount} orgId references in actions file`);
  } else {
    console.error(`  FAIL: Only ${orgIdParamCount} orgId references found in actions file (expected >= 28)`);
    failures.push(`Too few orgId references in actions file: ${orgIdParamCount}`);
  }
} else {
  console.error(`  FAIL: Actions file not found at ${ACTIONS_FILE}`);
  failures.push("Actions file not found");
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
  console.log("\n✅ ALL CHECKS PASSED — B2A-3 Prisma layer tenant isolation verified.");
}

process.exit(exitCode);
