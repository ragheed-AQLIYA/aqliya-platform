#!/usr/bin/env node
// Smoke test script for staging verification
// Usage: node scripts/smoke-test.mjs [base-url]
// Example: node scripts/smoke-test.mjs http://localhost:3000

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");

const endpoints = [
  { path: "/api/platform/health", label: "Health endpoint", required: true },
  { path: "/decisions", label: "DecisionOS", required: false },
  { path: "/sales", label: "SalesOS", required: false },
  { path: "/local-content", label: "LocalContentOS", required: false },
  { path: "/contacts", label: "LocalContactOS", required: false },
  { path: "/audit", label: "AuditOS workspace", required: false },
];

async function checkEndpoint(url, label) {
  const start = Date.now();
  try {
    const resp = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
    const ms = Date.now() - start;
    const status = resp.status;
    const ok = status < 500;
    return { url, label, status, ms, ok, error: null };
  } catch (err) {
    const ms = Date.now() - start;
    return { url, label, status: 0, ms, ok: false, error: err.message };
  }
}

async function main() {
  console.log(`\n=== AQLIYA Staging Smoke Test ===`);
  console.log(`Base URL: ${BASE}\n`);

  const results = await Promise.all(
    endpoints.map((e) => checkEndpoint(`${BASE}${e.path}`, e.label)),
  );

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.ok ? "PASS" : r.error ? "FAIL" : "FAIL";
    const statusInfo = r.status ? `HTTP ${r.status}` : "NO RESPONSE";
    const timeInfo = `${r.ms}ms`;
    console.log(`  [${icon}] ${r.label}`);
    console.log(`         ${r.url} — ${statusInfo} — ${timeInfo}`);
    if (r.error) {
      console.log(`         Error: ${r.error}`);
    }

    if (r.ok) {
      passed++;
    } else {
      failed++;
    }
  }

  // Health endpoint is required — fail hard if it doesn't respond
  const healthResult = results.find((r) => r.path === "/api/platform/health");
  if (!healthResult || !healthResult.ok) {
    console.log(`\n  CRITICAL: Health endpoint is not responding.`);
    process.exit(1);
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log("  All checks passed.");
    process.exit(0);
  } else {
    // Non-critical failures (dashboard routes may redirect to login) are warnings
    console.log("  Non-critical endpoints failed (expected if not authenticated).");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
