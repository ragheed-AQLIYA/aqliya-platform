/**
 * Agent 9 — Architecture Drift
 * Monitors deviation from approved architecture decisions.
 * Does NOT redesign architecture. Findings only.
 */

import path from "node:path";
import { ARCHITECTURE } from "../config.mjs";
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
import { isClientModule, extractImports } from "../lib/ast-lite.mjs";

const AGENT = "architecture-drift";

const STANDARD_LAYERS = [
  "src/app",
  "src/actions",
  "src/components",
  "src/lib",
  "src/core",
  "prisma",
];

export async function run() {
  const findings = [];
  const files = collectSourceFiles(["src"]);

  // 1) Forbidden client → server imports
  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (!fileRel.endsWith(".tsx") && !fileRel.endsWith(".ts")) continue;
    const content = readText(absFile);
    if (!content || !isClientModule(content)) continue;
    const imports = extractImports(content);
    for (const imp of imports) {
      for (const forbidden of ARCHITECTURE.forbiddenClientImports) {
        if (imp === forbidden || imp.startsWith(forbidden + "/")) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "high",
              category: "layer-violation",
              title: "Client module imports server-only boundary",
              evidence: `import '${imp}' in use client module`,
              files: [fileRel],
              suggestion: "Route through Server Actions; keep Prisma/auth server-side.",
            })
          );
        }
      }
      if (imp.includes("prisma") || imp.endsWith("/prisma")) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "critical",
            category: "layer-violation",
            title: "Client module imports Prisma",
            evidence: `import '${imp}'`,
            files: [fileRel],
          })
        );
      }
    }
  }

  // 2) Domain boundary — product code importing another product's deep internals
  const productRoots = {
    audit: ["src/app/audit", "src/lib/audit", "src/actions/audit"],
    "local-content": ["src/app/local-content", "src/lib/local-content", "src/lib/localcontent"],
    sales: ["src/app/sales", "src/lib/sales"],
    decision: ["src/app/api/decisions", "src/lib/decision", "src/actions/decision"],
    workflowos: ["src/app/workflowos", "src/lib/workflowos", "src/actions/workflowos"],
  };

  function productOf(fileRel) {
    for (const [prod, roots] of Object.entries(productRoots)) {
      if (roots.some((r) => fileRel.startsWith(r))) return prod;
    }
    return null;
  }

  // Cap cross-product findings
  let crossProduct = 0;
  for (const absFile of files) {
    const fileRel = rel(absFile);
    const prod = productOf(fileRel);
    if (!prod) continue;
    const content = readText(absFile);
    if (!content) continue;
    const imports = extractImports(content);
    for (const imp of imports) {
      if (!imp.startsWith("@/")) continue;
      const target = imp.replace(/^@\//, "src/");
      const other = productOf(target);
      if (other && other !== prod) {
        // shared core is ok
        if (target.startsWith("src/lib/governance") || target.startsWith("src/lib/authorization") || target.startsWith("src/core") || target.startsWith("src/lib/auth") || target.startsWith("src/components/ui")) {
          continue;
        }
        crossProduct += 1;
        if (crossProduct > 40) continue;
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "domain-boundary",
            title: `Cross-product import: ${prod} → ${other}`,
            evidence: `${fileRel} imports ${imp}`,
            files: [fileRel],
            suggestion: "Prefer Core shared APIs over deep product-to-product imports.",
          })
        );
      }
    }
  }
  if (crossProduct > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "domain-boundary",
        title: `Additional cross-product imports truncated (${crossProduct - 40} more)`,
        evidence: `Total: ${crossProduct}`,
      })
    );
  }

  // 3) Unexpected top-level layers under src/
  if (exists(abs("src"))) {
    const { readdirSync } = await import("node:fs");
    const top = readdirSync(abs("src"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    const expected = new Set([
      "app",
      "actions",
      "components",
      "lib",
      "core",
      "types",
      "__tests__",
      "__mocks__",
      "products",
      "account",
      "engagement",
    ]);
    for (const dir of top) {
      if (!expected.has(dir) && !dir.startsWith(".")) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "new-layer",
            title: `Unexpected src/ top-level directory: ${dir}`,
            evidence: "Not in standard layer allowlist — verify intentional",
            files: [`src/${dir}`],
            suggestion: "Document in ADR + AQLIYA_ARCHITECTURE if this is a new approved layer.",
          })
        );
      }
    }
  }

  // 4) ADR vs code — ADRs mention paths that no longer exist
  const adrFiles = exists(abs("docs/adr"))
    ? [...walkFiles(["docs/adr"], { extensions: new Set([".md"]) })]
    : [];
  for (const adr of adrFiles) {
    const content = readText(adr) || "";
    const pathMentions = content.match(/`?(src\/[a-zA-Z0-9_./-]+)`?/g) || [];
    for (const raw of pathMentions.slice(0, 30)) {
      const p = raw.replace(/`/g, "");
      if (p.includes("*")) continue;
      if (!exists(abs(p)) && !exists(abs(p + ".ts")) && !exists(abs(p + ".tsx"))) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "adr-conflict",
            title: "ADR references missing path",
            evidence: `${rel(adr)} mentions ${p} which was not found`,
            files: [rel(adr)],
            suggestion: "Update ADR or restore path — do not silently invent a third interpretation.",
          })
        );
      }
    }
  }

  // 5) Pattern drift — products bypassing actions (components importing lib services with prisma)
  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (!fileRel.startsWith("src/components/")) continue;
    const content = readText(absFile);
    if (!content) continue;
    if (/from\s+['"]@\/lib\/prisma['"]/.test(content) || /from\s+['"]@\/lib\/[^'"]+['"]/.test(content) && /prisma\./.test(content)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "pattern-drift",
          title: "Component layer may reach Prisma/data directly",
          evidence: "components import path suggests data access",
          files: [fileRel],
          suggestion: "Standard pattern: Client → Server Action → Domain Service → Prisma.",
        })
      );
    }
  }

  // 6) Doctrine path presence
  for (const p of ARCHITECTURE.doctrinePaths) {
    if (!exists(abs(p))) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "adr-conflict",
          title: `Architecture doctrine path missing: ${p}`,
          evidence: "Expected architecture authority file/dir not found",
          files: [p],
        })
      );
    }
  }

  // 7) Disallowed dependency direction — actions importing from app/
  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (!fileRel.startsWith("src/actions/")) continue;
    const content = readText(absFile);
    if (!content) continue;
    const imports = extractImports(content);
    for (const imp of imports) {
      if (imp.startsWith("@/app/") || imp.includes("/app/")) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "high",
            category: "layer-violation",
            title: "Action imports from app/ route layer",
            evidence: `import '${imp}'`,
            files: [fileRel],
            suggestion: "Keep actions → lib; routes may call actions, not vice versa.",
          })
        );
      }
    }
  }

  const score = scoreFromFindings(findings);

  return writeAgentReport({
    name: "architecture-drift",
    title: "Architecture Drift Report",
    score,
    findings,
    sections: [
      {
        heading: "Mandate",
        body: [
          "This agent **monitors drift** from approved architecture.",
          "It does **not** redesign architecture, migrate authorization, or change product boundaries.",
          "OpenCode remains implementation authority for any remediation.",
        ].join("\n"),
      },
      {
        heading: "Checks",
        body: [
          "- Client/server boundary violations",
          "- Cross-product domain imports",
          "- Unexpected src/ layers",
          "- ADR path conflicts vs code",
          "- Pattern drift (components → Prisma)",
          "- Disallowed dependency direction (actions → app)",
          `- Standard layers: ${STANDARD_LAYERS.join(", ")}`,
        ].join("\n"),
      },
    ],
    meta: {
      filesScanned: files.length,
      adrsChecked: adrFiles.length,
      products: Object.keys(productRoots),
    },
  });
}
