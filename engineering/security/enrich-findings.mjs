/**
 * Enrich security findings with risk register data.
 *
 * Marks findings that are in the risk register as "accepted"
 * and separates them from true/false positives.
 *
 * Usage:
 *   import { enrichFindings, loadRiskRegister } from "./enrich-findings.mjs";
 *   const riskRegister = loadRiskRegister();
 *   const result = enrichFindings(findings, riskRegister);
 *   // result = { truePositives, falsePositives, acceptedRisks, suppressed }
 *
 * This module does NOT modify application code or the scanner.
 * It is a post-scan enrichment utility for reporting and dashboards.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {object} RiskRegisterEntry
 * @property {string} riskId       - Stable ID (SR-001, etc.)
 * @property {string} findingRef   - Scanner finding ID (F-0006, etc.)
 * @property {string} category     - Risk category
 * @property {string} description  - What the risk is
 * @property {string} file         - Affected file path
 * @property {string} reason       - Why accepted
 * @property {string} owner        - Responsible team
 * @property {string} mitigation   - Mitigation in place
 * @property {string} status       - Active / Closed / Expired
 */

/**
 * @typedef {object} EnrichedResult
 * @property {Array} truePositives  - Findings that need fixing
 * @property {Array} falsePositives - Findings that are scanner noise
 * @property {Array} acceptedRisks  - Findings covered by risk register
 * @property {Array} suppressed     - Findings suppressed by policy
 */

/**
 * Load the risk summary JSON generated from the risk register.
 * Returns an empty structure if the file doesn't exist.
 */
export function loadRiskSummary() {
  const summaryPath = path.join(__dirname, "risk-summary.json");
  try {
    const raw = fs.readFileSync(summaryPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { risks: [], totalFindings: 0, breakdown: { truePositives: 0, falsePositives: 0, acceptedRisks: 0, suppressed: 0 } };
  }
}

/**
 * Build a lookup map from the risk register for O(1) findingRef checks.
 * @param {RiskRegisterEntry[]} riskRegister
 * @returns {Map<string, RiskRegisterEntry>}
 */
function buildRiskMap(riskRegister) {
  const map = new Map();
  for (const entry of riskRegister) {
    if (entry.status === "Active") {
      map.set(entry.findingRef, entry);
    }
  }
  return map;
}

/**
 * Enrich security findings with risk register data.
 *
 * Classifies each finding into one of four buckets:
 * - acceptedRisks:  Covered by an active risk register entry
 * - falsePositives:  Scanner heuristic fired on a safe pattern (heuristic-only)
 * - truePositives:   Actual security issue requiring remediation
 * - suppressed:      Excluded by policy (e.g., test files, excluded patterns)
 *
 * @param {Array} findings - Raw findings from the security scanner
 * @param {RiskRegisterEntry[]} riskRegister - Active risk register entries
 * @returns {EnrichedResult}
 */
export function enrichFindings(findings, riskRegister) {
  const riskMap = buildRiskMap(riskRegister);

  const result = {
    truePositives: [],
    falsePositives: [],
    acceptedRisks: [],
    suppressed: [],
  };

  for (const f of findings) {
    // Check if this finding is covered by the risk register
    const riskEntry = riskMap.get(f.id);
    if (riskEntry) {
      result.acceptedRisks.push({
        ...f,
        riskRegister: {
          riskId: riskEntry.riskId,
          reason: riskEntry.reason,
          mitigation: riskEntry.mitigation,
          owner: riskEntry.owner,
          expiry: riskEntry.expiry,
        },
      });
      continue;
    }

    // Classify remaining findings
    // Info-severity findings are informational, not actionable
    if (f.severity === "info") {
      result.falsePositives.push({ ...f, classification: "informational" });
      continue;
    }

    // Known safe patterns: $queryRaw with SELECT 1 in health endpoints
    if (
      f.title?.includes("$queryRaw") &&
      f.evidence?.includes("raw-sql") &&
      isHealthEndpoint(f.files)
    ) {
      // Should already be in risk register, but catch any we missed
      result.acceptedRisks.push({
        ...f,
        riskRegister: {
          riskId: "UNREGISTERED",
          reason: "Health endpoint $queryRaw SELECT 1 — should be in risk register",
          mitigation: "Parameterized query",
          owner: "Platform Infrastructure",
          expiry: "REVIEW_NEEDED",
        },
      });
      continue;
    }

    // Default: treat as true positive needing review
    result.truePositives.push({ ...f, classification: "needs_review" });
  }

  return result;
}

/**
 * Check if a file path looks like a health/readiness endpoint.
 * @param {string[]} files
 * @returns {boolean}
 */
function isHealthEndpoint(files) {
  if (!files?.length) return false;
  return files.some(
    (f) =>
      /health|ready|monitoring|probe/i.test(f) &&
      !/test|spec|mock|__tests__/i.test(f),
  );
}

/**
 * Generate a human-readable summary of enriched findings.
 * @param {EnrichedResult} enriched
 * @returns {string}
 */
export function summarizeEnriched(enriched) {
  const total =
    enriched.truePositives.length +
    enriched.falsePositives.length +
    enriched.acceptedRisks.length +
    enriched.suppressed.length;

  const lines = [
    `## Security Findings Enrichment`,
    ``,
    `| Category | Count |`,
    `| --- | --- |`,
    `| True Positives (needs review) | ${enriched.truePositives.length} |`,
    `| False Positives / Informational | ${enriched.falsePositives.length} |`,
    `| Accepted Risks (in register) | ${enriched.acceptedRisks.length} |`,
    `| Suppressed | ${enriched.suppressed.length} |`,
    `| **Total** | **${total}** |`,
    ``,
  ];

  if (enriched.acceptedRisks.length > 0) {
    lines.push("### Accepted Risks Detail", "");
    for (const r of enriched.acceptedRisks) {
      lines.push(
        `- **${r.id}** (${r.riskRegister.riskId}): ${r.title}`,
        `  - Reason: ${r.riskRegister.reason}`,
        `  - Mitigation: ${r.riskRegister.mitigation}`,
        `  - Owner: ${r.riskRegister.owner}`,
        "",
      );
    }
  }

  if (enriched.truePositives.length > 0) {
    lines.push("### True Positives (require attention)", "");
    for (const tp of enriched.truePositives) {
      lines.push(`- **${tp.id}**: ${tp.title} (${tp.severity}) — ${tp.files?.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
