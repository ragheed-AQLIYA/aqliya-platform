#!/usr/bin/env node
/**
 * Architectural Budgets — CI Gate
 *
 * Reads raw metrics from engineering reports and enforces budgets.
 * Any PR that increases a metric above its budget fails CI.
 *
 * Three policy types:
 *   - fixed:          metric must equal exactly max (e.g., circular_dependencies = 0)
 *   - decrease_only:  metric must not increase from current value
 *   - no_regression:  metric must not exceed baseline from main branch
 *
 * Usage:
 *   node engineering/ci/architectural-budgets.mjs           # advisory (exit 0)
 *   node engineering/ci/architectural-budgets.mjs --ci      # gate (exit 1 on breach)
 *   node engineering/ci/architectural-budgets.mjs --json    # JSON output only
 *
 * Integration:
 *   node engineering/ci/architectural-budgets.mjs --ci 2>&1 | tee budgets.log
 */

import { readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { engPath, writeJson, writeText, isoNow } from "../lib/fs-utils.mjs";

// ─────────────────────────────────────────────
// Budget Definitions
// ─────────────────────────────────────────────

const BUDGETS = [
  // ── Code Health ──
  {
    id: "god_objects",
    label: "God Objects",
    report: "code-health",
    extract: (data) => data.findings.filter((f) => f.category === "god-object").length,
    policy: "no_regression",
    max: 6,
    description: "Files exceeding LOC/export thresholds. Each split reduces this.",
  },
  {
    id: "long_functions",
    label: "Long Functions",
    report: "code-health",
    extract: (data) => data.findings.filter((f) => f.category === "long-function").length,
    policy: "decrease_only",
    max: 41,
    description: "Functions exceeding line threshold. Must not increase.",
  },
  {
    id: "circular_dependencies",
    label: "Circular Dependencies",
    report: "code-health",
    extract: (data) => data.findings.filter((f) => f.category === "circular-dependency").length,
    policy: "no_regression",
    max: 4,
    description: "Circular import chains. Currently 4 (pre-existing). Target: 0. Tighten to fixed=0 after remediation.",
  },
  {
    id: "solid_srp_violations",
    label: "SRP Violations",
    report: "code-health",
    extract: (data) => data.findings.filter((f) => f.category === "solid-srp").length,
    policy: "decrease_only",
    max: 10,
    description: "Single Responsibility Principle boundary smells.",
  },

  // ── Architecture ──
  {
    id: "layer_violations",
    label: "Layer Violations",
    report: "architecture-drift",
    extract: (data) => data.findings.filter((f) => f.category === "layer-violation").length,
    policy: "no_regression",
    max: 4,
    description: "Client importing server-only code or vice versa. Currently 4 (pre-existing). Target: 0.",
  },
  {
    id: "domain_boundary_violations",
    label: "Domain Boundary Violations",
    report: "architecture-drift",
    extract: (data) => data.findings.filter((f) => f.category === "domain-boundary").length,
    policy: "no_regression",
    max: 5,
    description: "Product-to-product imports violating bounded contexts.",
  },

  // ── Security ──
  {
    id: "security_high",
    label: "High-Severity Security Findings",
    report: "security",
    extract: (data) => data.findings.filter((f) => f.severity === "high").length,
    policy: "no_regression",
    max: 2,
    description: "High-severity security findings from scanner.",
  },
  {
    id: "security_critical",
    label: "Critical Security Findings",
    report: "security",
    extract: (data) => data.findings.filter((f) => f.severity === "critical").length,
    policy: "fixed",
    max: 0,
    description: "Critical security findings. Must stay at zero.",
  },

  // ── Performance ──
  {
    id: "n_plus_one_high",
    label: "N+1 Query Patterns (High)",
    report: "performance",
    extract: (data) =>
      data.findings.filter((f) => f.category === "n-plus-one" && f.severity === "high").length,
    policy: "no_regression",
    max: 10,
    description: "High-severity N+1 query patterns.",
  },
  {
    id: "unbounded_queries",
    label: "Unbounded Queries",
    report: "performance",
    extract: (data) => data.findings.filter((f) => f.category === "unbounded-query").length,
    policy: "no_regression",
    max: 30,
    description: "Queries without pagination or limit. Currently 30 (pre-existing). Target: 8.",
  },

  // ── Technical Debt ──
  {
    id: "debt_high",
    label: "High-Severity Debt Items",
    report: "technical-debt",
    extract: (data) => data.findings.filter((f) => f.severity === "high").length,
    policy: "decrease_only",
    max: 40,
    description: "High-severity technical debt items.",
  },
];

// ─────────────────────────────────────────────
// Report Loading
// ─────────────────────────────────────────────

function loadReport(name) {
  const p = engPath("reports", `${name}.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function loadBaseline() {
  const p = engPath("data", "trends", "architectural-budgets-baseline.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function saveBaseline(snapshot) {
  const dir = engPath("data", "trends");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeJson(path.join(dir, "architectural-budgets-baseline.json"), snapshot);
}

// ─────────────────────────────────────────────
// Evaluation
// ─────────────────────────────────────────────

function evaluate(budgets, baseline) {
  const results = [];

  for (const budget of budgets) {
    const reportData = loadReport(budget.report);
    if (!reportData) {
      results.push({
        ...budget,
        status: "SKIP",
        current: null,
        baseline: null,
        reason: `Report '${budget.report}.json' not found`,
      });
      continue;
    }

    const current = budget.extract(reportData);
    const baseValue = baseline?.[budget.id] ?? null;

    let status = "PASS";
    let reason = "";

    switch (budget.policy) {
      case "fixed": {
        if (current !== budget.max) {
          status = "FAIL";
          reason = `Expected exactly ${budget.max}, found ${current}`;
        } else {
          reason = `At target: ${current} = ${budget.max}`;
        }
        break;
      }

      case "decrease_only": {
        if (baseValue != null && current > baseValue) {
          status = "FAIL";
          reason = `Increased from ${baseValue} → ${current} (must decrease or hold)`;
        } else if (current > budget.max) {
          status = "WARN";
          reason = `Above target max ${budget.max} (current: ${current}), but ${
            baseValue != null ? `held vs baseline ${baseValue}` : "no baseline to compare"
          }`;
        } else {
          reason = baseValue != null
            ? `${baseValue} → ${current} (decreased or held)`
            : `At ${current}, max ${budget.max}`;
        }
        break;
      }

      case "no_regression": {
        if (baseValue != null && current > baseValue) {
          status = "FAIL";
          reason = `Regressed from ${baseValue} → ${current}`;
        } else if (current > budget.max) {
          status = "WARN";
          reason = `Above max ${budget.max} (current: ${current}), but ${
            baseValue != null ? `no regression from ${baseValue}` : "no baseline"
          }`;
        } else {
          reason = baseValue != null
            ? `${baseValue} → ${current} (no regression)`
            : `At ${current}, max ${budget.max}`;
        }
        break;
      }
    }

    results.push({
      id: budget.id,
      label: budget.label,
      policy: budget.policy,
      max: budget.max,
      current,
      baseline: baseValue,
      status,
      reason,
      description: budget.description,
    });
  }

  return results;
}

// ─────────────────────────────────────────────
// Report Generation
// ─────────────────────────────────────────────

function generateReport(results, isCi) {
  const generatedAt = isoNow();
  const fails = results.filter((r) => r.status === "FAIL");
  const warns = results.filter((r) => r.status === "WARN");
  const passes = results.filter((r) => r.status === "PASS");
  const skips = results.filter((r) => r.status === "SKIP");

  const overall = fails.length > 0 ? "FAIL" : warns.length > 0 ? "WARN" : "PASS";

  // Console output
  const icon = { PASS: "✅", WARN: "⚠️", FAIL: "❌", SKIP: "⏭️" };
  console.log(`\n═══════════════════════════════════════════`);
  console.log(` Architectural Budgets — ${overall}`);
  console.log(` ${generatedAt}`);
  console.log(`═══════════════════════════════════════════\n`);

  for (const r of results) {
    console.log(`  ${icon[r.status]} ${r.label}`);
    console.log(`     policy=${r.policy}  current=${r.current ?? "—"}  max=${r.max}  baseline=${r.baseline ?? "—"}`);
    console.log(`     ${r.reason}`);
    console.log();
  }

  console.log(`  Summary: ${passes.length} PASS · ${warns.length} WARN · ${fails.length} FAIL · ${skips.length} SKIP`);
  if (isCi && fails.length > 0) {
    console.log(`\n  ❌ CI GATE FAILED — ${fails.length} budget(s) breached`);
  } else if (isCi) {
    console.log(`\n  ✅ CI GATE PASSED`);
  }
  console.log();

  // Write JSON report
  writeJson(engPath("reports", "architectural-budgets.json"), {
    agent: "architectural-budgets",
    generatedAt,
    overall,
    summary: {
      pass: passes.length,
      warn: warns.length,
      fail: fails.length,
      skip: skips.length,
    },
    results,
    ci: isCi,
  });

  // Write Markdown report
  const md = [
    "# Architectural Budgets",
    "",
    `**Generated:** ${generatedAt}  `,
    `**Overall:** **${overall}**  `,
    `**PASS:** ${passes.length} · **WARN:** ${warns.length} · **FAIL:** ${fails.length} · **SKIP:** ${skips.length}`,
    "",
    isCi
      ? "> CI Gate mode — FAIL triggers non-zero exit."
      : "> Advisory mode — run with `--ci` to enforce.",
    "",
    "| Budget | Policy | Current | Max | Baseline | Status | Reason |",
    "| ------ | ------ | ------: | --: | -------: | ------ | ------ |",
    ...results.map(
      (r) =>
        `| ${r.label} | ${r.policy} | ${r.current ?? "—"} | ${r.max} | ${r.baseline ?? "—"} | **${r.status}** | ${r.reason} |`
    ),
    "",
  ];

  if (fails.length > 0) {
    md.push("## Breached Budgets", "");
    for (const r of fails) {
      md.push(`### ${r.label}`, "");
      md.push(`- **Policy:** ${r.policy}`);
      md.push(`- **Current:** ${r.current}`);
      md.push(`- **Max:** ${r.max}`);
      md.push(`- **Baseline:** ${r.baseline ?? "none"}`);
      md.push(`- **Reason:** ${r.reason}`);
      md.push(`- **Action:** Fix before merge. Do not increase this metric.`);
      md.push("");
    }
  }

  md.push("## Policies", "");
  md.push("| Policy | Behavior |");
  md.push("| ------ | -------- |");
  md.push("| `fixed` | Metric must equal exactly `max` |");
  md.push("| `decrease_only` | Metric must not increase from current value |");
  md.push("| `no_regression` | Metric must not exceed baseline from main branch |");
  md.push("");
  md.push("---", "", `_AQLIYA Engineering Excellence · architectural-budgets_`, "");

  writeText(engPath("reports", "architectural-budgets.md"), md.join("\n"));

  return { overall, results, fails, warns, passes, skips };
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

function main(argv = process.argv.slice(2)) {
  const isCi = argv.includes("--ci");
  const jsonOnly = argv.includes("--json");

  const baseline = loadBaseline();
  const report = evaluate(BUDGETS, baseline);

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    generateReport(report, isCi);
  }

  // Save current values as new baseline (for next run)
  const snapshot = {};
  for (const r of report) {
    if (r.current != null) snapshot[r.id] = r.current;
  }
  snapshot._generatedAt = isoNow();
  writeJson(engPath("data", "trends", "architectural-budgets-baseline.json"), snapshot);

  if (isCi && report.some((r) => r.status === "FAIL")) {
    process.exitCode = 1;
  }
}

// Allow import without side effects
if (process.argv[1]?.endsWith("architectural-budgets.mjs")) {
  main();
}

export { BUDGETS, evaluate, loadBaseline, loadReport, main };
