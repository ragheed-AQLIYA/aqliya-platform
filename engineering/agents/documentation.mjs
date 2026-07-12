/**
 * Agent 5 — Documentation
 * Missing ADR/README/API docs/diagrams, outdated docs, broken links.
 */

import path from "node:path";
import { DOCUMENTATION } from "../config.mjs";
import {
  readText,
  exists,
  abs,
  rel,
  walkFiles,
  engPath,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";

const AGENT = "documentation";

function listMarkdown(rootRel) {
  const root = abs(rootRel);
  if (!exists(root)) return [];
  return [...walkFiles([rootRel], { extensions: new Set([".md"]) })].map(rel);
}

export async function run() {
  const findings = [];

  for (const doc of DOCUMENTATION.requiredRootDocs) {
    if (!exists(abs(doc))) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "missing-readme",
          title: `Required document missing: ${doc}`,
          evidence: "File not found",
          files: [doc],
        })
      );
    }
  }

  // ADR directory
  const adrDir = DOCUMENTATION.adrDir;
  const adrs = listMarkdown(adrDir);
  if (adrs.length === 0) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "missing-adr",
        title: "No ADRs found under docs/adr",
        evidence: "ADR directory empty or missing",
        files: [adrDir],
        suggestion: "Record deploy/auth/data decisions as ADRs when they change.",
      })
    );
  } else if (adrs.length < 3) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "low",
        category: "missing-adr",
        title: `Only ${adrs.length} ADR(s) present`,
        evidence: adrs.join(", "),
        files: adrs,
        suggestion: "Expand ADRs for auth, tenancy, deployment, and product boundaries.",
      })
    );
  }

  // Product READMEs
  const productDocRoots = [
    "docs/products",
    "docs/systems",
    "docs/source-of-truth",
  ];
  for (const root of productDocRoots) {
    if (!exists(abs(root))) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "missing-readme",
          title: `Documentation tree missing: ${root}`,
          evidence: "Directory not found",
          files: [root],
        })
      );
    }
  }

  // API docs — OpenAPI / route docs
  const hasOpenApi =
    exists(abs("docs/api")) ||
    exists(abs("openapi.yaml")) ||
    exists(abs("openapi.json")) ||
    listMarkdown("docs").some((d) => /api/i.test(d) && /reference|openapi|swagger/i.test(d));
  if (!hasOpenApi) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "low",
        category: "missing-api-docs",
        title: "No OpenAPI / API reference tree detected",
        evidence: "No openapi.yaml/json or docs/api",
        suggestion: "Document critical download/auth APIs even if App Router-first.",
      })
    );
  }

  // Diagrams
  const docsMd = listMarkdown("docs");
  const diagramMentions = docsMd.filter((d) => {
    const c = readText(abs(d)) || "";
    return /```mermaid|!\[.*\]\(.*\.(png|svg|jpg)/i.test(c);
  });
  if (diagramMentions.length < 5) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "missing-diagrams",
        title: `Few diagram-bearing docs (${diagramMentions.length})`,
        evidence: "mermaid/image embeds scarce relative to docs volume",
        suggestion: "Add architecture/sequence diagrams for Core + product flows.",
      })
    );
  }

  // Broken relative links (sample)
  let broken = 0;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const doc of docsMd.slice(0, 400)) {
    const content = readText(abs(doc)) || "";
    let m;
    while ((m = linkRe.exec(content))) {
      const target = m[2].split("#")[0].split("?")[0];
      if (!target || target.startsWith("http") || target.startsWith("mailto:")) continue;
      if (target.startsWith("//")) continue;
      const resolved = path.normalize(path.join(path.dirname(abs(doc)), target));
      if (!exists(resolved)) {
        broken += 1;
        if (broken <= 40) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "medium",
              category: "broken-link",
              title: `Broken link in ${doc}`,
              evidence: `[${m[1]}](${m[2]}) → missing ${rel(resolved)}`,
              files: [doc],
            })
          );
        }
      }
    }
  }
  if (broken > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "broken-link",
        title: `Additional broken links truncated (${broken - 40} more)`,
        evidence: `Total broken relative links sampled: ${broken}`,
      })
    );
  }

  // Outdated docs — Last Reviewed / date older than ~180 days heuristic
  const now = Date.now();
  let outdated = 0;
  for (const doc of docsMd.slice(0, 200)) {
    const content = readText(abs(doc)) || "";
    const dateMatch = content.match(
      /Last Reviewed[:\s]*(\d{4}-\d{2}-\d{2})|Effective date[:\s]*(\d{4}-\d{2}-\d{2})|Date[:\s]*(\d{4}-\d{2}-\d{2})/i
    );
    if (!dateMatch) continue;
    const d = dateMatch[1] || dateMatch[2] || dateMatch[3];
    const ts = Date.parse(d);
    if (!Number.isFinite(ts)) continue;
    const ageDays = (now - ts) / (86400 * 1000);
    if (ageDays > 180 && /official|source-of-truth|AGENTS/i.test(doc)) {
      outdated += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "low",
          category: "outdated-docs",
          title: `Possibly outdated authority doc: ${doc}`,
          evidence: `Parsed date ${d} (~${Math.round(ageDays)} days ago)`,
          files: [doc],
          suggestion: "Re-review against code reality; bump Last Reviewed.",
        })
      );
    }
  }

  // Engineering excellence self-doc
  if (!exists(engPath("README.md"))) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "missing-readme",
        title: "engineering/README.md missing",
        evidence: "Engineering Excellence workspace should self-document",
      })
    );
  }

  const score = scoreFromFindings(findings);

  return writeAgentReport({
    name: AGENT,
    title: "Documentation Report",
    score,
    findings,
    sections: [
      {
        heading: "Inventory",
        body: [
          `- Markdown under docs/: ${docsMd.length}`,
          `- ADRs: ${adrs.length}`,
          `- Diagram-bearing docs: ${diagramMentions.length}`,
          `- Broken relative links (sampled): ${broken}`,
          `- Outdated authority candidates: ${outdated}`,
        ].join("\n"),
      },
      {
        heading: "Authority Reminder",
        body: "Reports are evidence, not doctrine. Conflict resolution follows `docs/DOCUMENTATION_AUTHORITY.md`.",
      },
    ],
    meta: { docsMd: docsMd.length, adrs: adrs.length, broken, outdated },
  });
}
