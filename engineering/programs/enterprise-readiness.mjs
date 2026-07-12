/**
 * Enterprise Readiness Agent
 * Company/platform readiness — not just code quality.
 * LAST-WAVE agent — see AGENT_FREEZE.md
 */

import { ensureProgramsDirs } from "./registry.mjs";
import {
  engPath,
  writeText,
  writeJson,
  readText,
  isoNow,
  exists,
  abs,
} from "../lib/fs-utils.mjs";
import { dataPath } from "../lib/data-lake.mjs";

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreFromReport(path, fallback = 50) {
  const j = loadJson(path);
  return j?.score != null ? clamp(j.score) : fallback;
}

/**
 * Dimension scoring blends existing EngineeringOS artifacts + repo signals.
 */
export async function runEnterpriseReadiness() {
  ensureProgramsDirs();

  const security = scoreFromReport(engPath("reports", "security.json"), 60);
  const compliance = loadJson(dataPath("os/compliance", "latest.json"))?.overall ?? 70;
  const docs = scoreFromReport(engPath("reports", "documentation.json"), 70);
  const performance = scoreFromReport(engPath("reports", "performance.json"), 55);
  const testing = scoreFromReport(engPath("reports", "testing.json"), 70);
  const portal = loadJson(dataPath("os/portal", "latest.json"));
  const adr = loadJson(dataPath("os/adr", "validation-latest.json"))?.overall ?? 55;
  const auth = portal?.authAdoption ?? 50;
  const release = loadJson(dataPath("os/release", "latest.json"));
  const avgRelease = release?.cards?.length
    ? Math.round(
        release.cards.reduce((s, c) => s + (c.ready || 0), 0) / release.cards.length
      )
    : 60;

  // Operations: presence of runbooks / deploy docs
  const opsDocs = [
    "docs/deployment/OBSERVABILITY_BASELINE.md",
    "docs/deployment/INCIDENT_ROLLBACK_RUNBOOK.md",
    "docs/deployment/BACKUP_RESTORE_DRILL.md",
    "docs/deployment/SECRETS_AND_ROTATION_RUNBOOK.md",
  ];
  const opsPresent = opsDocs.filter((p) => exists(abs(p))).length;
  const operations = clamp(50 + opsPresent * 12);

  // Recovery
  const recoveryDocs = [
    "docs/deployment/BACKUP_RESTORE_DRILL.md",
    "docs/deployment/STATE_RECOVERY_RUNBOOK.md",
    "docs/deployment/INCIDENT_ROLLBACK_RUNBOOK.md",
  ];
  const recoveryPresent = recoveryDocs.filter((p) => exists(abs(p))).length;
  const recovery = clamp(45 + recoveryPresent * 15 + (exists(abs("scripts/platform/restore-drill.mjs")) ? 10 : 0));

  // Monitoring
  const monitoring = clamp(
    40 +
      (exists(abs("src/app/monitoring")) ? 20 : 0) +
      (exists(abs("docs/deployment/OBSERVABILITY_BASELINE.md")) ? 20 : 0) +
      Math.min(20, Math.round((portal?.overall || 50) / 5))
  );

  // Support — operator surfaces
  const support = clamp(
    40 +
      (exists(abs("src/app/operator")) ? 15 : 0) +
      (exists(abs("docs/deployment")) ? 15 : 0) +
      (docs >= 80 ? 15 : 5)
  );

  // Scalability — infra + performance
  const scalability = clamp(
    performance * 0.45 +
      (exists(abs("infra/terraform")) ? 25 : 0) +
      (exists(abs("Dockerfile")) ? 10 : 0) +
      auth * 0.15
  );

  const dimensions = [
    { id: "security", label: "Security", score: security },
    { id: "compliance", label: "Compliance", score: clamp(compliance) },
    { id: "scalability", label: "Scalability", score: scalability },
    { id: "operations", label: "Operations", score: operations },
    { id: "documentation", label: "Documentation", score: docs },
    { id: "support", label: "Support", score: support },
    { id: "monitoring", label: "Monitoring", score: monitoring },
    { id: "recovery", label: "Recovery", score: recovery },
    { id: "authorization", label: "Authorization", score: clamp(auth) },
    { id: "architecture", label: "Architecture (ADR)", score: clamp(adr) },
    { id: "quality_gates", label: "Quality / Tests", score: testing },
    { id: "release", label: "Release Ready (avg products)", score: avgRelease },
  ];

  // Weighted enterprise readiness
  const weights = {
    security: 1.4,
    compliance: 1.2,
    scalability: 1.0,
    operations: 1.1,
    documentation: 0.8,
    support: 0.9,
    monitoring: 1.0,
    recovery: 1.1,
    authorization: 1.3,
    architecture: 0.9,
    quality_gates: 0.9,
    release: 1.0,
  };
  let num = 0;
  let den = 0;
  for (const d of dimensions) {
    const w = weights[d.id] || 1;
    num += d.score * w;
    den += w;
  }
  const enterpriseReadiness = clamp(num / den);

  const payload = {
    at: isoNow(),
    enterpriseReadiness,
    dimensions,
  };
  writeJson(dataPath("programs", "enterprise-readiness.json"), payload);

  const md = [
    "# Enterprise Readiness",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "```",
    `Enterprise Readiness`,
    `${enterpriseReadiness}%`,
    "```",
    "",
    "> Measures whether AQLIYA is ready as an **operating company/platform** — not only code health.",
    "",
    "| Dimension | Score |",
    "| --------- | ----: |",
    ...dimensions.map((d) => `| ${d.label} | **${d.score}** |`),
    "",
    "## Interpretation",
    "",
    enterpriseReadiness >= 85
      ? "- Strong enterprise posture — prioritize pilot customers and measured delivery."
      : enterpriseReadiness >= 70
        ? "- Conditionally ready — close Authorization and Architecture/ADR gaps; deepen Support before broad launch."
        : "- Not enterprise-ready — Program A + D must lead before commercial scale.",
    "",
    "## Linked programs",
    "",
    "- Low Authorization → Program A",
    "- Low ADR/Architecture → Program D",
    "- Low Release avg → Program B",
    "- Low Recovery/Ops → Program A (observability/jobs) + ops runbooks",
    "",
  ].join("\n");

  writeText(engPath("programs", "ENTERPRISE_READINESS.md"), md);
  return payload;
}
