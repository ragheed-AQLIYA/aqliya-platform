/**
 * Agent 3 — Performance
 * React rendering, Server Actions, Prisma N+1, indexes, caching,
 * memory, bundle, slow API heuristics. Findings only.
 */

import { PERFORMANCE } from "../config.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  exists,
  abs,
  lineCount,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";
import { isClientModule, extractImports } from "../lib/ast-lite.mjs";

const AGENT = "performance";

export async function run() {
  const findings = [];
  const files = collectSourceFiles(["src", "prisma"]);
  const schema = readText(abs("prisma/schema.prisma")) || "";

  // Index coverage: models with organizationId but no @@index mentioning it
  const modelBlocks = schema.split(/\bmodel\s+/).slice(1);
  let modelsWithOrg = 0;
  let modelsMissingOrgIndex = 0;
  for (const block of modelBlocks) {
    const name = block.split(/[\s{]/)[0];
    const body = block;
    if (!/organizationId/.test(body)) continue;
    modelsWithOrg += 1;
    if (!/@@index\([^)]*organizationId/.test(body) && !/organizationId\s+[^\n]+@id/.test(body)) {
      // also accept @@unique containing organizationId
      if (!/@@unique\([^)]*organizationId/.test(body)) {
        modelsMissingOrgIndex += 1;
        if (modelsMissingOrgIndex <= 25) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "medium",
              category: "indexes",
              title: `Model ${name} has organizationId without obvious index`,
              evidence: "organizationId present; no @@index/@@unique on it detected",
              files: ["prisma/schema.prisma"],
              suggestion: "Add @@index([organizationId]) or composite tenant indexes.",
            })
          );
        }
      }
    }
  }

  let n1Suspects = 0;
  let findManyNoTake = 0;
  let heavyClient = 0;
  let actionHeavy = 0;

  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (fileRel.endsWith(".prisma")) continue;
    const content = readText(absFile);
    if (!content) continue;

    // N+1: await inside for/map with prisma
    if (
      /for\s*\([^)]+\)\s*\{[\s\S]{0,200}?await\s+prisma\./m.test(content) ||
      /\.map\s*\(\s*async\s*\([\s\S]{0,200}?await\s+prisma\./m.test(content)
    ) {
      n1Suspects += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "n-plus-one",
          title: "Possible Prisma N+1 query pattern",
          evidence: "await prisma.* inside for/map(async)",
          files: [fileRel],
          suggestion: "Batch with findMany + where id in [...], or include/select.",
        })
      );
    }

    // findMany without take/limit
    if (PERFORMANCE.prismaFindManyWithoutTake) {
      const fm = content.match(/prisma\.\w+\.findMany\s*\(\s*\{/g) || [];
      for (let i = 0; i < fm.length; i++) {
        // rough: if file has findMany but no take nearby — flag once per file
      }
      if (/findMany\s*\(/.test(content) && !/\btake\s*:/.test(content) && /prisma\./.test(content)) {
        findManyNoTake += 1;
        if (findManyNoTake <= 30) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "low",
              category: "unbounded-query",
              title: "findMany without take/limit in file",
              evidence: "prisma findMany present; no take: in file",
              files: [fileRel],
              suggestion: "Add pagination (take/skip) for list endpoints.",
            })
          );
        }
      }
    }

    // React: missing key in map — light
    if (isClientModule(content) || fileRel.endsWith(".tsx")) {
      if (/\.map\s*\(\s*\([^)]*\)\s*=>\s*\(\s*</.test(content) && !/\.map\s*\([\s\S]{0,120}?key=/.test(content)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "react-rendering",
            title: "List render may omit React key",
            evidence: ".map => JSX without nearby key=",
            files: [fileRel],
          })
        );
      }
      // Heavy client pages
      if (lineCount(content) >= PERFORMANCE.largePageLines && isClientModule(content)) {
        heavyClient += 1;
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "react-rendering",
            title: "Large client component",
            evidence: `${lineCount(content)} lines with use client`,
            files: [fileRel],
            suggestion: "Split presentational vs data; prefer Server Components where possible.",
          })
        );
      }
      // Importing heavy libs in client
      const imps = extractImports(content);
      for (const imp of imps) {
        if (/^(pdfkit|puppeteer|playwright|sharp|exceljs|prisma)/i.test(imp)) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "high",
              category: "bundle-size",
              title: `Heavy library imported in UI module: ${imp}`,
              evidence: "Likely increases client bundle or breaks edge",
              files: [fileRel],
              suggestion: "Keep in Server Actions / Node route handlers only.",
            })
          );
        }
      }
    }

    // Server actions — large files / many sequential awaits
    if (fileRel.startsWith("src/actions/")) {
      const awaits = (content.match(/\bawait\b/g) || []).length;
      if (awaits >= 25) {
        actionHeavy += 1;
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "server-actions",
            title: "Server action module with many awaits",
            evidence: `${awaits} await expressions`,
            files: [fileRel],
            suggestion: "Parallelize independent awaits; cache stable reads.",
          })
        );
      }
    }

    // Caching signals
    if (/unstable_cache|revalidateTag|revalidatePath|cache\s*\(/.test(content)) {
      // positive signal — no finding
    }
  }

  // Bundle analyzer script presence
  if (!exists(abs("scripts/platform/bundle-analyzer.js")) && !exists(abs("scripts/dev/performance-budget.mjs"))) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "bundle-size",
        title: "No bundle analyzer script detected",
        evidence: "Expected scripts/platform/bundle-analyzer.js or performance-budget",
      })
    );
  } else {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "bundle-size",
        title: "Bundle tooling present — run after approved builds",
        evidence: "bundle-analyzer / performance-budget scripts found",
        suggestion: "Use npm run analyze after explicit build approval (low-load policy).",
      })
    );
  }

  // Memory — large in-memory arrays patterns
  const memFiles = collectSourceFiles(["src"]).filter((f) => {
    const c = readText(f) || "";
    return /new Array\(\s*\d{5,}/.test(c) || /Buffer\.alloc\(\s*\d{7,}/.test(c);
  });
  for (const f of memFiles.slice(0, 10)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "memory",
        title: "Large preallocated buffer/array",
        evidence: "new Array(large) or Buffer.alloc(large)",
        files: [rel(f)],
      })
    );
  }

  const score = scoreFromFindings(findings);

  return writeAgentReport({
    name: AGENT,
    title: "Performance Report",
    score,
    findings,
    sections: [
      {
        heading: "Scope",
        body: [
          `- Files scanned: ${files.length}`,
          `- Models with organizationId: ${modelsWithOrg}`,
          `- Missing org index suspects: ${modelsMissingOrgIndex}`,
          `- N+1 suspects: ${n1Suspects}`,
          `- Unbounded findMany files: ${findManyNoTake}`,
          `- Large client components: ${heavyClient}`,
          `- Heavy server-action modules: ${actionHeavy}`,
        ].join("\n"),
      },
      {
        heading: "Note",
        body: "Runtime profiling, Lighthouse, and bundle sizes require an approved build. This agent stays low-load (static only).",
      },
    ],
    meta: { modelsWithOrg, modelsMissingOrgIndex, n1Suspects, findManyNoTake },
  });
}
