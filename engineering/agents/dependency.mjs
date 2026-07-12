/**
 * Agent 7 — Dependency
 * Graph signals, dead/duplicate/unused packages, licenses, advisories (lockfile).
 */

import {
  loadPackageJson,
  loadLockPackages,
  readText,
  abs,
  exists,
  collectSourceFiles,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";

const AGENT = "dependency";

const RISKY_LICENSES = /\b(GPL-3|AGPL|SSPL|Commons Clause)\b/i;

export async function run() {
  const findings = [];
  const pkg = loadPackageJson();
  if (!pkg) {
    return writeAgentReport({
      name: "dependencies",
      title: "Dependency Report",
      score: 0,
      findings: [
        finding({
          agent: AGENT,
          severity: "critical",
          title: "package.json unreadable",
          evidence: "Failed to parse package.json",
        }),
      ],
    });
  }

  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const depNames = Object.keys(deps);

  // Duplicate package names across deps/devDeps
  const prod = new Set(Object.keys(pkg.dependencies || {}));
  const dev = new Set(Object.keys(pkg.devDependencies || {}));
  for (const name of prod) {
    if (dev.has(name)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "duplicate-packages",
          title: `Package listed in both dependencies and devDependencies: ${name}`,
          evidence: `${pkg.dependencies[name]} vs ${pkg.devDependencies[name]}`,
          files: ["package.json"],
        })
      );
    }
  }

  // Unused dependency heuristic — name never appears in source imports
  const sources = collectSourceFiles(["src", "scripts", "prisma"]);
  let corpus = "";
  for (const f of sources) {
    corpus += readText(f) || "";
    if (corpus.length > 25_000_000) break; // safety
  }
  // also include config files
  for (const extra of ["next.config.mjs", "jest.config.js", "jest.config.ts", "tailwind.config.ts", "postcss.config.mjs", "middleware.ts"]) {
    corpus += readText(abs(extra)) || readText(abs("src/" + extra)) || "";
  }

  let unused = 0;
  const alwaysKeep = new Set([
    "react",
    "react-dom",
    "next",
    "typescript",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "eslint",
    "prettier",
    "husky",
    "lint-staged",
    "prisma",
    "@prisma/client",
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "jest",
    "ts-jest",
    "cypress",
    "dotenv",
    "server-only",
    "zod",
  ]);

  for (const name of depNames) {
    if (alwaysKeep.has(name)) continue;
    if (name.startsWith("@types/")) continue;
    // scoped package import forms
    const bare = name.startsWith("@") ? name : name;
    const mentioned =
      corpus.includes(`from "${bare}"`) ||
      corpus.includes(`from '${bare}'`) ||
      corpus.includes(`require("${bare}")`) ||
      corpus.includes(`require('${bare}')`) ||
      corpus.includes(`${bare}/`) ||
      // binary tools referenced in package scripts
      JSON.stringify(pkg.scripts || {}).includes(name.replace(/^@.*\//, ""));

    if (!mentioned) {
      unused += 1;
      if (unused <= 40) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "unused-packages",
            title: `Possibly unused package: ${name}`,
            evidence: "No import/require/script reference detected in scanned corpus",
            files: ["package.json"],
            suggestion: "Confirm before removal — may be used by config or transitive tooling.",
          })
        );
      }
    }
  }

  // Lockfile duplicate versions (same package multiple versions)
  const lock = loadLockPackages();
  const versionMap = new Map();
  if (lock?.packages) {
    for (const [key, meta] of Object.entries(lock.packages)) {
      if (!key || key === "") continue;
      const parts = key.split("node_modules/");
      const name = parts[parts.length - 1];
      if (!name || !meta.version) continue;
      if (!versionMap.has(name)) versionMap.set(name, new Set());
      versionMap.get(name).add(meta.version);
    }
  }
  let dupVersions = 0;
  for (const [name, versions] of versionMap) {
    if (versions.size > 1) {
      dupVersions += 1;
      if (dupVersions <= 25) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "duplicate-packages",
            title: `Multiple versions installed: ${name}`,
            evidence: [...versions].join(", "),
            suggestion: "Deduplicate via overrides/resolutions when safe.",
          })
        );
      }
    }
  }

  // License issues — package-lock license field when present
  let licenseRisks = 0;
  if (lock?.packages) {
    for (const [key, meta] of Object.entries(lock.packages)) {
      const lic = meta.license;
      if (lic && RISKY_LICENSES.test(String(lic))) {
        licenseRisks += 1;
        if (licenseRisks <= 15) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "high",
              category: "license",
              title: `Restrictive license: ${key || "root"}`,
              evidence: String(lic),
              suggestion: "Legal review before distribution; prefer MIT/Apache-2.0.",
            })
          );
        }
      }
    }
  }

  // Security advisories — npm audit JSON if present (do not run npm audit here)
  if (exists(abs("engineering/reports/npm-audit.json"))) {
    try {
      const audit = JSON.parse(readText(abs("engineering/reports/npm-audit.json")));
      const vulns = audit.metadata?.vulnerabilities || {};
      const crit = vulns.critical || 0;
      const high = vulns.high || 0;
      if (crit + high > 0) {
        findings.push(
          finding({
            agent: AGENT,
            severity: crit ? "critical" : "high",
            category: "security-advisories",
            title: `npm audit cache: ${crit} critical, ${high} high`,
            evidence: "engineering/reports/npm-audit.json",
            suggestion: "OpenCode/security owners remediate; re-export audit JSON after fix.",
          })
        );
      }
    } catch {
      /* ignore */
    }
  } else {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "security-advisories",
        title: "No cached npm-audit.json — advisories not scored this run",
        evidence: "Place npm audit --json output at engineering/reports/npm-audit.json when approved",
      })
    );
  }

  // Dependency graph summary
  const graphSummary = [
    `Direct dependencies: ${Object.keys(pkg.dependencies || {}).length}`,
    `Dev dependencies: ${Object.keys(pkg.devDependencies || {}).length}`,
    `Lock packages entries: ${lock?.packages ? Object.keys(lock.packages).length : 0}`,
    `Multi-version packages: ${dupVersions}`,
    `Unused candidates: ${unused}`,
  ].join("\n");

  const score = scoreFromFindings(findings);

  return writeAgentReport({
    name: "dependencies",
    title: "Dependency Report",
    score,
    findings,
    sections: [
      { heading: "Dependency Graph (summary)", body: graphSummary },
      {
        heading: "Policy",
        body: "Does not run `npm audit` or install packages (low-load / approval gates). Consumes optional cached audit JSON only.",
      },
    ],
    meta: {
      direct: Object.keys(pkg.dependencies || {}).length,
      dev: Object.keys(pkg.devDependencies || {}).length,
      unused,
      dupVersions,
      licenseRisks,
    },
  });
}
