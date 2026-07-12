/**
 * Agent 4 — Test Intelligence
 * Coverage signals, missing tests, flaky markers, integration gaps,
 * regression risks. Findings only — does not run full test suite.
 */

import path from "node:path";
import { TESTING } from "../config.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  exists,
  abs,
  walkFiles,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";

const AGENT = "test-intelligence";

function collectTests() {
  const tests = [];
  for (const f of walkFiles(["src", "scripts"], { extensions: new Set([".ts", ".tsx", ".js"]) })) {
    const r = rel(f);
    if (
      /__tests__|\.test\.|\.spec\.|cypress\//.test(r) ||
      r.startsWith("cypress/")
    ) {
      tests.push(r);
    }
  }
  // cypress folder
  if (exists(abs("cypress"))) {
    for (const f of walkFiles(["cypress"], { extensions: new Set([".ts", ".js"]) })) {
      tests.push(rel(f));
    }
  }
  return [...new Set(tests)];
}

export async function run() {
  const findings = [];
  const sourceFiles = collectSourceFiles(["src"]).map(rel).filter((r) => {
    return (
      !/__tests__|\.test\.|\.spec\.|__mocks__/.test(r) &&
      (r.endsWith(".ts") || r.endsWith(".tsx"))
    );
  });
  const tests = collectTests();

  const actions = sourceFiles.filter((r) => r.startsWith("src/actions/") && r.endsWith(".ts"));
  const apiRoutes = sourceFiles.filter((r) => /src\/app\/api\/.*route\.ts$/.test(r));
  const libModules = sourceFiles.filter((r) => r.startsWith("src/lib/") && r.endsWith(".ts"));

  function hasTestFor(fileRel) {
    const base = path.basename(fileRel).replace(/\.(ts|tsx)$/, "");
    const dirHint = fileRel.split("/").slice(-2, -1)[0] || "";
    return tests.some(
      (t) =>
        t.includes(base) ||
        t.includes(dirHint + "/") ||
        t.toLowerCase().includes(base.toLowerCase())
    );
  }

  let missingActionTests = 0;
  for (const a of actions) {
    if (/__tests__/.test(a)) continue;
    if (!hasTestFor(a)) {
      missingActionTests += 1;
      if (missingActionTests <= 35) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "missing-tests",
            title: `No obvious test for action ${path.basename(a)}`,
            evidence: "No matching __tests__ / *.test.* filename signal",
            files: [a],
            suggestion: "Add unit/integration coverage for mutations + authz denial paths.",
          })
        );
      }
    }
  }

  let missingApiTests = 0;
  for (const r of apiRoutes) {
    if (!hasTestFor(r) && /download|export|evidence/i.test(r)) {
      missingApiTests += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "integration-gap",
          title: `Sensitive API route lacks obvious test: ${r}`,
          evidence: "download/export/evidence route without matching test name",
          files: [r],
          suggestion: "Add integration tests for auth, tenant 404, and audit log.",
        })
      );
    }
  }

  // Flaky markers
  let flaky = 0;
  for (const t of tests) {
    const content = readText(abs(t)) || "";
    if (/retries\s*:\s*[1-9]|flaky|test\.skip|describe\.skip|it\.skip|xit\(|xdescribe\(/.test(content)) {
      flaky += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "flaky-tests",
          title: `Skip/retry/flaky marker in ${t}`,
          evidence: "skip/retries/flaky keyword present",
          files: [t],
          suggestion: "Quarantine intentionally or fix root flake; avoid silent skips.",
        })
      );
    }
  }

  // Coverage artifact
  let coveragePct = null;
  const coverageSummary = abs("coverage/coverage-summary.json");
  if (exists(coverageSummary)) {
    try {
      const json = JSON.parse(readText(coverageSummary));
      coveragePct = json.total?.lines?.pct ?? json.total?.statements?.pct ?? null;
    } catch {
      coveragePct = null;
    }
  }

  if (coveragePct == null) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "coverage",
        title: "No coverage/coverage-summary.json present",
        evidence: "Coverage not measured in this run (low-load: suite not executed)",
        suggestion: "When approved, run jest with coverage and re-audit.",
      })
    );
  } else if (coveragePct < TESTING.minCoveragePct) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "high",
        category: "coverage",
        title: `Line coverage ${coveragePct}% below minimum ${TESTING.minCoveragePct}%`,
        evidence: `coverage-summary.json total lines pct=${coveragePct}`,
      })
    );
  } else if (coveragePct < TESTING.warnCoveragePct) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "coverage",
        title: `Line coverage ${coveragePct}% below warn threshold ${TESTING.warnCoveragePct}%`,
        evidence: `coverage-summary.json total lines pct=${coveragePct}`,
      })
    );
  }

  // Regression risk: recently large modules without tests
  const untestedLibs = libModules.filter((m) => !hasTestFor(m)).slice(0, 20);
  for (const m of untestedLibs) {
    const content = readText(abs(m)) || "";
    if (content.split(/\r?\n/).length < 150) continue;
    findings.push(
      finding({
        agent: AGENT,
        severity: "low",
        category: "regression-risk",
        title: `Large lib module without obvious tests: ${path.basename(m)}`,
        evidence: "≥150 LOC, no matching test filename",
        files: [m],
      })
    );
  }

  // Integration vs unit balance
  const unitCount = tests.filter((t) => /unit/.test(t)).length;
  const integrationCount = tests.filter((t) => /integration/.test(t)).length;
  if (integrationCount === 0 && tests.length > 0) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "integration-gap",
        title: "No integration test path detected",
        evidence: "No path containing 'integration' under tests",
      })
    );
  }

  // Ratio score boost when tests exist
  const ratio = sourceFiles.length ? tests.length / sourceFiles.length : 0;
  let score = scoreFromFindings(findings);
  if (ratio < 0.05) score = Math.min(score, 45);
  if (coveragePct != null) {
    score = Math.round(score * 0.6 + Math.min(100, coveragePct) * 0.4);
  }

  return writeAgentReport({
    name: "testing",
    title: "Test Intelligence Report",
    score,
    findings,
    sections: [
      {
        heading: "Inventory",
        body: [
          `- Source modules (approx): ${sourceFiles.length}`,
          `- Test files: ${tests.length}`,
          `- Server actions: ${actions.length} (missing test signals: ${missingActionTests})`,
          `- API routes: ${apiRoutes.length} (sensitive missing: ${missingApiTests})`,
          `- Unit-named tests: ${unitCount}`,
          `- Integration-named tests: ${integrationCount}`,
          `- Flaky/skip markers: ${flaky}`,
          `- Coverage %: ${coveragePct == null ? "not measured" : coveragePct}`,
        ].join("\n"),
      },
      {
        heading: "Policy",
        body: "This agent does **not** execute `npm test` (heavy). It analyzes repository structure and optional coverage artifacts only.",
      },
    ],
    meta: {
      sourceFiles: sourceFiles.length,
      tests: tests.length,
      coveragePct,
      missingActionTests,
      missingApiTests,
      flaky,
      ratio,
    },
  });
}
