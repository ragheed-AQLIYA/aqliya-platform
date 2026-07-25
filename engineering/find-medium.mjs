#!/usr/bin/env node
/**
 * Find MEDIUM-level governance issues in the AQLIYA codebase
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";

const ROOT = join(process.cwd(), "src");
const findings = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const fp = join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "__tests__") {
      walk(fp);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) {
      scan(fp);
    }
  }
}

function scan(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);
  
  // Skip non-production files
  if (/test|spec|__tests__|seed|scripts|engineering|monitoring/.test(filePath)) return;
  
  const lines = content.split("\n");

  // GOV-03: Missing audit trail in server actions with mutations
  if (filePath.includes("/actions/") && filePath.endsWith(".ts") && !filePath.endsWith(".d.ts")) {
    const hasMutation = /\.create\(|\.update\(|\.delete\(|\.upsert\(/.test(content);
    const hasAudit = /auditEvent|recordAudit|logAudit|platformAuditLog/i.test(content);
    const hasUseServer = lines.some(l => l.trim() === '"use server"');
    const rel2 = relative(process.cwd(), filePath);
    if (hasUseServer && hasMutation && !hasAudit && !/seed|test/.test(rel2)) {
      findings.push({
        rule: "GOV-03",
        severity: "MEDIUM",
        file: rel2,
        message: "Server action with mutations but no audit trail",
        line: lines.findIndex(l => /create\(|update\(|delete\(|upsert\(/.test(l)) + 1
      });
    }
  }

  // PERF-01: Heavy client imports
  if (/\.(tsx|jsx)$/.test(filePath) && !filePath.includes("/app/")) {
    const isClient = /["']use client["']/.test(content.split("\n").slice(0, 5).join("\n"));
    if (isClient) {
      const heavyImports = [
        /from\s+["']pdfkit["']/,
        /from\s+["']xlsx["']/,
        /from\s+["']@?xlsx["']/,
      ];
      for (const regex of heavyImports) {
        if (regex.test(content)) {
          findings.push({
            rule: "PERF-01",
            severity: "MEDIUM",
            file: rel,
            message: "Heavy library imported in client component",
            line: 0
          });
        }
      }
    }
  }
}

walk(ROOT);

// Print results
console.log(`\nFound ${findings.length} MEDIUM findings:\n`);
for (const f of findings) {
  console.log(`  [${f.rule}] ${f.file}:${f.line} — ${f.message}`);
}

// Group by rule
const byRule = {};
for (const f of findings) {
  if (!byRule[f.rule]) byRule[f.rule] = [];
  byRule[f.rule].push(f);
}

console.log(`\nBy rule:`);
for (const [rule, items] of Object.entries(byRule)) {
  console.log(`  ${rule}: ${items.length}`);
}
