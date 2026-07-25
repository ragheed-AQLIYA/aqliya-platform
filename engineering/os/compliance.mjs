/**
 * Module 3 — Architectural Compliance Engine
 * Rule-based compliance scores (not just drift narrative).
 */

import {
  ensureOsDirs,
  osPath,
  productOfPath,
  extractImports,
  isClientModule,
  hasAuthorizeCall,
  listActionFiles,
  pct,
} from "./lib.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  writeText,
  writeJson,
  isoNow,
} from "../lib/fs-utils.mjs";
import { dataPath } from "../lib/data-lake.mjs";

const RULES = [
  {
    id: "NO_PRISMA_IN_CLIENT",
    title: "No Prisma from Client Components",
    weight: 20,
  },
  {
    id: "ACTIONS_USE_ENFORCE",
    title: "Mutating Server Actions use enforce()/authorize()",
    weight: 25,
  },
  {
    id: "NO_AUTH_BYPASS",
    title: "No obvious authorization bypass patterns",
    weight: 20,
  },
  {
    id: "NO_CROSS_DOMAIN_DEEP_IMPORTS",
    title: "No deep cross-product domain imports",
    weight: 15,
  },
  {
    id: "NO_ACTIONS_IMPORT_APP",
    title: "Actions must not import from app/ routes",
    weight: 10,
  },
  {
    id: "DOWNLOAD_ROUTES_TENANT_SCOPED",
    title: "Download/export routes reference organizationId",
    weight: 10,
  },
];

export async function runComplianceEngine() {
  ensureOsDirs();
  const files = collectSourceFiles(["src"]);
  const results = [];

  // Rule 1: Prisma in client
  let r1Fail = 0;
  let r1Total = 0;
  const r1Files = [];
  for (const f of files) {
    const content = readText(f) || "";
    if (!isClientModule(content)) continue;
    r1Total += 1;
    const imps = extractImports(content);
    if (imps.some((i) => (i.includes("prisma") && !i.startsWith("@prisma/client")) || i === "@/lib/prisma") || /from\s+['"]@\/lib\/prisma['"]/.test(content)) {
      r1Fail += 1;
      r1Files.push(rel(f));
    }
  }
  results.push(scoreRule("NO_PRISMA_IN_CLIENT", r1Total - r1Fail, Math.max(r1Total, 1), r1Files));

  // Rule 2: mutating actions use enforce/authorize
  // Exempt: registration-actions.ts (pre-auth self-registration, no user session exists yet)
  const R2_EXEMPT = new Set(["registration-actions.ts"]);
  let r2Ok = 0;
  let r2Total = 0;
  const r2Files = [];
  for (const f of listActionFiles()) {
    const content = readText(f) || "";
    const mutating = /prisma\.\w+\.(create|update|delete|upsert)/.test(content);
    if (!mutating) continue;
    r2Total += 1;
    const fname = rel(f).split(/[/\\]/).pop();
    if (R2_EXEMPT.has(fname)) { r2Ok += 1; continue; }
    if (hasAuthorizeCall(content) || /\benforce\s*\(/.test(content)) r2Ok += 1;
    else r2Files.push(rel(f));
  }
  results.push(scoreRule("ACTIONS_USE_ENFORCE", r2Ok, Math.max(r2Total, 1), r2Files));

  // Rule 3: auth bypass
  let r3Fail = 0;
  const r3Files = [];
  for (const f of files) {
    const content = readText(f) || "";
    const r = rel(f);
    if (/__tests__|\.test\./.test(r)) continue;
    if (/bypassAuth|skipAuth|DISABLE_AUTH|noAuth\s*[:=]\s*true|\/\/\s*auth:\s*skip/i.test(content)) {
      r3Fail += 1;
      r3Files.push(r);
    }
  }
  results.push(
    scoreRule("NO_AUTH_BYPASS", Math.max(0, 100 - r3Fail * 10), 100, r3Files, true)
  );

  // Rule 4: cross-domain (sample)
  const productRoots = {
    AuditOS: ["src/lib/audit", "src/app/audit"],
    SalesOS: ["src/lib/sales", "src/app/sales"],
    LocalContentOS: ["src/lib/local-content", "src/app/local-content"],
    DecisionOS: ["src/lib/decision", "src/actions/decision"],
    WorkflowOS: ["src/lib/workflowos", "src/app/workflowos"],
  };
  let r4Fail = 0;
  let r4Total = 0;
  const r4Files = [];
  for (const f of files) {
    const r = rel(f);
    const home = Object.entries(productRoots).find(([, roots]) => roots.some((x) => r.startsWith(x)));
    if (!home) continue;
    const imps = extractImports(readText(f) || "");
    for (const imp of imps) {
      if (!imp.startsWith("@/")) continue;
      const target = imp.replace(/^@\//, "src/");
      if (target.startsWith("src/lib/authorization") || target.startsWith("src/lib/governance") || target.startsWith("src/core") || target.startsWith("src/components/ui")) continue;
      const other = Object.entries(productRoots).find(
        ([name, roots]) => name !== home[0] && roots.some((x) => target.startsWith(x))
      );
      if (other) {
        r4Total += 1;
        r4Fail += 1;
        if (r4Files.length < 40) r4Files.push(`${r} → ${imp}`);
      }
    }
  }
  results.push(scoreRule("NO_CROSS_DOMAIN_DEEP_IMPORTS", Math.max(0, 100 - r4Fail), 100, r4Files, true));

  // Rule 5: actions → app
  let r5Fail = 0;
  const r5Files = [];
  for (const f of listActionFiles()) {
    const imps = extractImports(readText(f) || "");
    if (imps.some((i) => i.startsWith("@/app/") || i.includes("/app/"))) {
      r5Fail += 1;
      r5Files.push(rel(f));
    }
  }
  results.push(scoreRule("NO_ACTIONS_IMPORT_APP", Math.max(0, 100 - r5Fail * 5), 100, r5Files, true));

  // Rule 6: download routes tenant
  let r6Ok = 0;
  let r6Total = 0;
  const r6Files = [];
  for (const f of files) {
    const r = rel(f).replace(/\\/g, "/");
    if (!/src\/app\/api\/.*route\.ts$/.test(r)) continue;
    if (!/download|export/i.test(r)) continue;
    r6Total += 1;
    const content = readText(f) || "";
    if (/organizationId/.test(content)) r6Ok += 1;
    else r6Files.push(r);
  }
  results.push(scoreRule("DOWNLOAD_ROUTES_TENANT_SCOPED", r6Ok, Math.max(r6Total, 1), r6Files));

  // Weighted overall
  let weighted = 0;
  let weightSum = 0;
  for (const rule of RULES) {
    const res = results.find((r) => r.id === rule.id);
    if (!res) continue;
    weighted += res.score * rule.weight;
    weightSum += rule.weight;
    res.title = rule.title;
    res.weight = rule.weight;
  }
  const overall = weightSum ? Math.round(weighted / weightSum) : 0;

  const payload = { at: isoNow(), overall, rules: results };
  writeJson(dataPath("os/compliance", "latest.json"), payload);

  const md = [
    "# Architectural Compliance",
    "",
    `**Generated:** ${payload.at}  `,
    `**Compliance Score:** **${overall}%**`,
    "",
    "| Rule | Score | Violations | Weight |",
    "| ---- | ----- | ---------- | ------ |",
    ...results.map(
      (r) =>
        `| ${r.id} | **${r.score}%** | ${r.violations} | ${r.weight ?? "—"} |`
    ),
    "",
    "## Rule Details",
    "",
    ...results.flatMap((r) => [
      `### ${r.id} — ${r.title || ""}`,
      "",
      `- Score: **${r.score}%**`,
      `- Violations: ${r.violations}`,
      ...(r.samples || []).slice(0, 12).map((s) => `  - \`${s}\``),
      "",
    ]),
    "> Remediation owned by OpenCode. EngineeringOS only measures.",
    "",
  ].join("\n");

  writeText(osPath("COMPLIANCE.md"), md);
  return payload;
}

function scoreRule(id, ok, total, samples, alreadyPct = false) {
  const score = alreadyPct ? Math.max(0, Math.min(100, ok)) : pct(ok, total);
  return {
    id,
    score,
    violations: alreadyPct ? samples.length : Math.max(0, total - ok),
    samples: samples.slice(0, 40),
  };
}
