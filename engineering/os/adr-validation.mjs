/**
 * Module 7 — Continuous ADR Validation
 * Validate that architectural decisions still hold in code.
 */

import { ensureOsDirs, osPath, pct, listActionFiles, hasAuthorizeCall } from "./lib.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  writeText,
  writeJson,
  isoNow,
  abs,
  exists,
} from "../lib/fs-utils.mjs";
import { dataPath } from "../lib/data-lake.mjs";
import {
  loadDecisions,
  syncAdrsIntoMemory,
  rebuildMemoryIndex,
} from "../intelligence/architecture-memory/sync.mjs";
import { isClientModule, extractImports } from "../lib/ast-lite.mjs";

/**
 * Built-in validators keyed by pattern / ADR heuristics.
 */
function validateEnforceAdoption() {
  const actions = listActionFiles();
  let total = 0;
  let ok = 0;
  const violations = [];
  for (const f of actions) {
    const content = readText(f) || "";
    if (!/prisma\.\w+\.(create|update|delete|upsert)/.test(content)) continue;
    total += 1;
    if (hasAuthorizeCall(content) || /\benforce\s*\(/.test(content)) ok += 1;
    else violations.push(rel(f));
  }
  return {
    rule: "enforce()/authorize() on mutating actions",
    compliance: pct(ok, Math.max(total, 1)),
    total,
    ok,
    violations: violations.slice(0, 30),
  };
}

function validateNoPrismaClient() {
  const files = collectSourceFiles(["src"]);
  const violations = [];
  for (const f of files) {
    const content = readText(f) || "";
    if (!isClientModule(content)) continue;
    const imps = extractImports(content);
    if (imps.some((i) => i.includes("prisma"))) {
      // Type-only imports from @prisma/client are safe (erased at compile time)
      const hasRuntimePrismaImport = /import\s+(?!type\s).*from\s+['"]@prisma\/client['"]/i.test(content) ||
        /import\s+(?!type\s).*from\s+['"].*prisma(?!\/client)['"]/i.test(content);
      if (hasRuntimePrismaImport) violations.push(rel(f));
    }
  }
  const score = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 15);
  return {
    rule: "No Prisma in Client Components",
    compliance: score,
    total: violations.length,
    ok: violations.length === 0 ? 1 : 0,
    violations: violations.slice(0, 30),
  };
}

function validateCloudfrontWafAdr() {
  // ADR-DEPLOY-001: prefer web_acl_id on distribution
  const tf = abs("infra/terraform");
  let compliance = 50;
  let detail = "terraform tree not scanned deeply";
  const violations = [];
  if (exists(tf)) {
    const files = collectSourceFiles ? [] : [];
  }
  // Light read of known module files
  const candidates = [
    "infra/terraform/modules/networking/main.tf",
    "infra/terraform/modules/storage/main.tf",
    "infra/terraform/main.tf",
    "docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md",
  ];
  let foundWebAcl = false;
  let foundLegacyAssoc = false;
  for (const c of candidates) {
    const content = readText(abs(c)) || "";
    if (/web_acl_id/.test(content)) foundWebAcl = true;
    // Only flag aws_wafv2_web_acl_association in .tf files (mentioned in ADR docs as rejected approach)
    if (c.endsWith(".tf") && /aws_wafv2_web_acl_association/.test(content)) foundLegacyAssoc = true;
  }
  if (foundWebAcl && !foundLegacyAssoc) compliance = 100;
  else if (foundWebAcl && foundLegacyAssoc) {
    compliance = 70;
    violations.push("Both web_acl_id and aws_wafv2_web_acl_association present — review");
  } else if (!foundWebAcl) {
    compliance = 40;
    violations.push("web_acl_id not found in scanned terraform files");
  }
  detail = foundWebAcl ? "web_acl_id present" : "web_acl_id missing in scan";
  return {
    rule: "ADR-DEPLOY-001 CloudFront WAF via web_acl_id",
    compliance,
    total: 1,
    ok: compliance >= 90 ? 1 : 0,
    violations,
    detail,
  };
}

export async function runAdrValidation() {
  ensureOsDirs();
  syncAdrsIntoMemory();
  rebuildMemoryIndex();
  const decisions = loadDecisions();

  const validations = [];

  // Always run core platform validators
  validations.push({
    adrId: "PLATFORM-ENFORCE",
    title: "Authorization uses enforce()/authorize()",
    ...validateEnforceAdoption(),
  });
  validations.push({
    adrId: "PLATFORM-CLIENT-PRISMA",
    title: "Client/server boundary",
    ...validateNoPrismaClient(),
  });

  for (const d of decisions) {
    if (/CLOUDFRONT|WAF|DEPLOY-001/i.test(d.id + d.title)) {
      validations.push({
        adrId: d.id,
        title: d.title,
        ...validateCloudfrontWafAdr(),
      });
    } else if (d.pattern && /enforce/i.test(d.pattern)) {
      validations.push({
        adrId: d.id,
        title: d.title,
        ...validateEnforceAdoption(),
      });
    } else {
      // Generic: check referenced files still exist
      const missing = (d.files || []).filter((f) => !exists(abs(f)));
      validations.push({
        adrId: d.id,
        title: d.title,
        rule: "Referenced paths exist",
        compliance: (d.files || []).length === 0 ? 80 : pct((d.files || []).length - missing.length, (d.files || []).length),
        total: (d.files || []).length,
        ok: (d.files || []).length - missing.length,
        violations: missing,
      });
    }
  }

  const overall = validations.length
    ? Math.round(validations.reduce((s, v) => s + v.compliance, 0) / validations.length)
    : 0;

  const payload = { at: isoNow(), overall, validations };
  writeJson(dataPath("os/adr", "validation-latest.json"), payload);

  const md = [
    "# Continuous ADR Validation",
    "",
    `**Generated:** ${payload.at}  `,
    `**Overall ADR Compliance:** **${overall}%**`,
    "",
    ...validations.flatMap((v) => [
      `## ${v.adrId}`,
      "",
      `**${v.title}**`,
      "",
      "```",
      `${v.adrId}`,
      `  ↓`,
      `Repository check`,
      `  ↓`,
      `Result: ${v.compliance}%`,
      `Remaining violations: ${v.violations?.length ?? 0}`,
      "```",
      "",
      ...(v.violations || []).slice(0, 15).map((x) => `- \`${x}\``),
      "",
    ]),
    "> Validate ↔ Record: `npm run eng:memory` records; `npm run eng:os -- adr` validates.",
    "",
  ].join("\n");

  writeText(osPath("ADR_VALIDATION.md"), md);
  return payload;
}
