#!/usr/bin/env node
// ─── B2A-4 Regression Guard ───
// Verifies that all B2A-4 targets are properly org-scoped.
// Exit code 0 = PASS, 1 = FAIL
//
// Scope: 7 critical findUnique→findFirst migrations across 4 files
// Checks:
//   G4-01: ai-auto-review.ts — findFirst with organizationId scope
//   G4-02: ai-advisor.ts line 136 — findFirst with project.organizationId scope  
//   G4-03: ai-advisor.ts line 380 — findFirst with project.organizationId scope
//   G4-04: ai-advisor.ts line 591 — findFirst with organizationId + func has orgId param
//   G4-05: ai-advisor.ts line 684 — reviewFalsePositive call passes 5 args
//   G4-06: ai-advisor.ts line 896 — findFirst with project.organizationId scope
//   G4-07: ai-advisor.ts line 1083 — findFirst with organizationId + func has orgId param
//   G4-08: recommendation-engine.ts line 642 — findFirst with organizationId + func has orgId param
//   G4-09: No findUnique remains in B2A-4 scope
//   G4-10: All action callers pass organizationId

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "src");
const VERBOSE = process.argv.includes("--verbose");

let passed = 0;
let failed = 0;
const checks = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    checks.push({ name, status: "PASS", detail });
  } else {
    failed++;
    checks.push({ name, status: "FAIL", detail });
  }
  if (VERBOSE || !condition) {
    console.log(`  ${condition ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function read(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

console.log("\n🔍 B2A-4 Regression Guard\n");

// ─── G4-01: ai-auto-review.ts:86 ───
const aiAutoReview = read(resolve(ROOT, "lib", "local-content", "workbook", "ai-auto-review.ts"));
if (aiAutoReview) {
  check(
    "G4-01",
    aiAutoReview.includes('findFirst({\n      where: { id: workbookId, project: { organizationId } },\n      select: { projectId: true },\n    })'),
    "ai-auto-review.ts:86 → findFirst with project.organizationId scope",
  );
} else {
  check("G4-01", false, "Could not read ai-auto-review.ts");
}

// ─── G4-02: ai-advisor.ts:136 ───
const aiAdvisor = read(resolve(ROOT, "lib", "local-content", "workbook", "ai-advisor.ts"));
if (aiAdvisor) {
  // Check that suggestPatternImprovements has scoped findFirst
  check(
    "G4-02",
    aiAdvisor.includes('findFirst({\n      where: { id: workbookId, project: { organizationId } },\n      include: { lines: { orderBy: { displayOrder: "asc" } } },\n    })') ||
    aiAdvisor.includes('findFirst({\n      where: { id: workbookId, project: { organizationId } },\n      include: { lines: { orderBy: { displayOrder: "asc" } } }\n    })'),
    "ai-advisor.ts:136 (suggestPatternImprovements) → findFirst with project.organizationId scope",
  );
} else {
  check("G4-02", false, "Could not read ai-advisor.ts");
}

// ─── G4-03: ai-advisor.ts:380 (explainAccountMatches) ───
if (aiAdvisor) {
  const countFindFirst = (aiAdvisor.match(/findFirst\(\{[\s\S]*?where: \{ id: workbookId, project: \{ organizationId \} \}[\s\S]*?include: \{ lines: \{ orderBy: \{ displayOrder: "asc" \} \} \}/g) || []).length;
  check(
    "G4-03",
    countFindFirst >= 2,
    `ai-advisor.ts:380 (explainAccountMatches) → findFirst with project.organizationId scope (expected ≥2, found ${countFindFirst})`,
  );
}

// ─── G4-04: ai-advisor.ts:591 (reviewFalsePositive — orgId param + scoped findFirst) ───
if (aiAdvisor) {
  const hasOrgParam = aiAdvisor.includes("export async function reviewFalsePositive(\n  organizationId: string,");
  const hasScopedFind = aiAdvisor.includes("findFirst({\n      where: { id: matchReviewId, organizationId },\n    })");
  check(
    "G4-04",
    hasOrgParam && hasScopedFind,
    `ai-advisor.ts:591 → reviewFalsePositive has orgId param=${hasOrgParam}, scoped findFirst=${hasScopedFind}`,
  );
}

// ─── G4-05: ai-advisor.ts:684 (batchReviewFalsePositives passes orgId) ───
if (aiAdvisor) {
  const passesOrgId = aiAdvisor.includes("reviewFalsePositive(organizationId, id, decision, reviewNotes, reviewerId)");
  check(
    "G4-05",
    passesOrgId,
    `ai-advisor.ts:684 → batchReviewFalsePositives passes orgId=${passesOrgId}`,
  );
}

// ─── G4-06: ai-advisor.ts:896 (calibrateWorkbookConfidence — scoped findFirst) ───
// This is the 3rd occurrence; should exist along with the 2 counted in G4-03
if (aiAdvisor) {
  const totalScoped = (aiAdvisor.match(/findFirst\(\{[\s\S]*?where: \{ id: workbookId, project: \{ organizationId \} \}[\s\S]*?\}\);/g) || []).length;
  check(
    "G4-06",
    totalScoped >= 3,
    `ai-advisor.ts:896 (calibrateWorkbookConfidence) → all lcWorkbook findFirst scoped (expected ≥3, found ${totalScoped})`,
  );
}

// ─── G4-07: ai-advisor.ts:1083 (reviewPatternSuggestion — orgId param + scoped findFirst) ───
if (aiAdvisor) {
  const hasOrgParam = aiAdvisor.includes("export async function reviewPatternSuggestion(\n  organizationId: string,");
  const hasScopedFind = aiAdvisor.includes("findFirst({\n      where: { id: suggestionId, organizationId },\n    })");
  check(
    "G4-07",
    hasOrgParam && hasScopedFind,
    `ai-advisor.ts:1083 → reviewPatternSuggestion has orgId param=${hasOrgParam}, scoped findFirst=${hasScopedFind}`,
  );
}

// ─── G4-08: recommendation-engine.ts:642 ───
const recEngine = read(resolve(ROOT, "lib", "local-content", "workbook", "recommendation-engine.ts"));
if (recEngine) {
  const hasOrgParam = recEngine.includes("export async function reviewRecommendation(\n  organizationId: string,");
  const hasScopedFind = /findFirst\(\{[\s\S]*?where:\s*\{ id: recommendationId, organizationId \},?\s*\}/.test(recEngine);
  check(
    "G4-08",
    hasOrgParam && hasScopedFind,
    `recommendation-engine.ts:642 → reviewRecommendation has orgId param=${hasOrgParam}, scoped findFirst=${hasScopedFind}`,
  );
} else {
  check("G4-08", false, "Could not read recommendation-engine.ts");
}

// ─── G4-09: No findUnique in scoped area ───
// Verify no findUnique on these models remains in the modified files
if (aiAutoReview) {
  const wbFindUnique = aiAutoReview.match(/lcWorkbook\.findUnique/g);
  check("G4-09a", !wbFindUnique, `ai-auto-review.ts: lcWorkbook.findUnique remaining = ${wbFindUnique?.length ?? 0}`);
}
if (aiAdvisor) {
  const lcWbFindUnique = aiAdvisor.match(/lcWorkbook\.findUnique/g);
  const lcMrFindUnique = aiAdvisor.match(/lcMatchReview\.findUnique/g);
  const lcPsFindUnique = aiAdvisor.match(/lcPatternSuggestion\.findUnique/g);
  const total = (lcWbFindUnique?.length ?? 0) + (lcMrFindUnique?.length ?? 0) + (lcPsFindUnique?.length ?? 0);
  check("G4-09b", total === 0, `ai-advisor.ts: findUnique on scoped models remaining = ${total}`);
}
if (recEngine) {
  const recFindUnique = recEngine.match(/lcRecommendation\.findUnique/g);
  check("G4-09c", !recFindUnique, `recommendation-engine.ts: lcRecommendation.findUnique remaining = ${recFindUnique?.length ?? 0}`);
}

// ─── G4-10: Action callers pass orgId ───
const aiAdvisorActions = read(resolve(ROOT, "actions", "localcontent-ai-advisor-actions.ts"));
const reviewActions = read(resolve(ROOT, "actions", "localcontent-review-actions.ts"));
const v3Actions = read(resolve(ROOT, "actions", "localcontent-ai-advisor-v3-actions.ts"));

if (aiAdvisorActions) {
  const fpCall = aiAdvisorActions.includes("reviewFalsePositive(\n      user.organizationId,");
  const psCall = aiAdvisorActions.includes("reviewPatternSuggestion(\n      user.organizationId,");
  check("G4-10a", fpCall && psCall, `localcontent-ai-advisor-actions.ts: FP call passes orgId=${fpCall}, PS call passes orgId=${psCall}`);
} else {
  check("G4-10a", false, "Could not read localcontent-ai-advisor-actions.ts");
}

if (reviewActions) {
  const psCall = reviewActions.includes("reviewPatternSuggestion(\n      orgId,");
  const fpCall = reviewActions.includes("reviewFalsePositive(\n      orgId,");
  const batchPsCall = reviewActions.includes("reviewPatternSuggestion(pOrgId,");
  const batchFpCall = reviewActions.includes("reviewFalsePositive(mOrgId,");
  check("G4-10b", psCall && fpCall && batchPsCall && batchFpCall,
    `localcontent-review-actions.ts: PS call passes orgId=${psCall}, FP call=${fpCall}, batchPS=${batchPsCall}, batchFP=${batchFpCall}`);
} else {
  check("G4-10b", false, "Could not read localcontent-review-actions.ts");
}

if (v3Actions) {
  const recCall = v3Actions.includes("reviewRecommendation(user.organizationId,");
  check("G4-10c", recCall, `localcontent-ai-advisor-v3-actions.ts: reviewRecommendation passes orgId=${recCall}`);
} else {
  check("G4-10c", false, "Could not read localcontent-ai-advisor-v3-actions.ts");
}

// ─── Summary ───
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);

if (failed > 0) {
  console.log("❌ GATE FAILED — Some B2A-4 targets are NOT properly scoped");
  process.exit(1);
} else {
  console.log("✅ GATE PASSED — All B2A-4 targets properly org-scoped");
  process.exit(0);
}
