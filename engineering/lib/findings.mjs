/**
 * Finding model + severity helpers for Engineering Excellence.
 */

export const SEVERITY = Object.freeze({
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
});

/**
 * @typedef {object} Finding
 * @property {string} id
 * @property {string} agent
 * @property {'critical'|'high'|'medium'|'low'|'info'} severity
 * @property {string} title
 * @property {string} evidence
 * @property {string[]} [files]
 * @property {string} [category]
 * @property {string} [suggestion]
 * @property {number} [scoreImpact]
 */

let seq = 0;

export function finding(partial) {
  seq += 1;
  return {
    id: partial.id || `F-${String(seq).padStart(4, "0")}`,
    agent: partial.agent || "unknown",
    severity: partial.severity || "info",
    title: partial.title || "Untitled finding",
    evidence: partial.evidence || "",
    files: partial.files || [],
    category: partial.category || "general",
    suggestion: partial.suggestion || "",
    scoreImpact: partial.scoreImpact ?? severityImpact(partial.severity),
  };
}

export function severityImpact(severity) {
  switch (severity) {
    case "critical":
      return 15;
    case "high":
      return 8;
    case "medium":
      return 3;
    case "low":
      return 1;
    default:
      return 0;
  }
}

export function scoreFromFindings(findings, { base = 100, floor = 0, maxDeduction = 85 } = {}) {
  // Weight by severity with diminishing returns so noisy heuristics don't floor every score.
  const weights = { critical: 12, high: 5, medium: 1.5, low: 0.35, info: 0 };
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }
  let deduction = 0;
  for (const [sev, n] of Object.entries(counts)) {
    const w = weights[sev] ?? 0;
    // sqrt dampening: 100 medium findings ≠ −150 points
    deduction += w * Math.sqrt(n);
  }
  deduction = Math.min(maxDeduction, deduction);
  const score = Math.max(floor, Math.min(100, Math.round(base - deduction)));
  return score;
}

export function groupBySeverity(findings) {
  const groups = { critical: [], high: [], medium: [], low: [], info: [] };
  for (const f of findings) {
    (groups[f.severity] || groups.info).push(f);
  }
  return groups;
}

export function summarizeFindings(findings) {
  const g = groupBySeverity(findings);
  return {
    total: findings.length,
    critical: g.critical.length,
    high: g.high.length,
    medium: g.medium.length,
    low: g.low.length,
    info: g.info.length,
  };
}

export function gateStatus(score, { pass, warn }) {
  if (score >= pass) return "PASS";
  if (score >= warn) return "WARNING";
  return "FAIL";
}

export function resetFindingSeq() {
  seq = 0;
}
