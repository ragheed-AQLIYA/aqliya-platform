#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";

const ROOT = join(process.cwd(), "src");
const findings = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const fp = join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "__tests__") walk(fp);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) scan(fp);
  }
}

function scan(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);
  if (/test|spec|__tests__|seed|debug|scripts|engineering|monitoring/.test(filePath)) return;

  // GOV-03: Server action with DB mutation but no audit trail
  if (/"use server"/.test(content)) {
    if (/prisma\.\w+\.(create|update|delete|upsert)\(/.test(content)) {
      if (!/audit|AuditEvent|auditEvent|logAudit|logToPlatform|auditLogger/.test(content)) {
        findings.push("GOV-03 | " + rel + " | Server action with DB mutation but no audit trail");
      }
    }
  }

  // PERF-01: Heavy imports in client components
  if (/"use client"/.test(content)) {
    const heavy = [/from\s+["']lodash/, /from\s+["']moment/, /from\s+["']xlsx/, /from\s+["']pdfkit/];
    for (const r of heavy) {
      if (r.test(content)) {
        findings.push("PERF-01 | " + rel + " | Heavy library imported in client component");
        break;
      }
    }
  }

  // GOV-04: Async without try/catch in server code
  if (/("use server"|src\/app\/api\/)/.test(filePath)) {
    if (/\basync\b/.test(content) && !/\btry\b/.test(content)) {
      findings.push("GOV-04 | " + rel + " | Async function without try/catch");
    }
  }
}

walk(ROOT);
findings.forEach(f => console.log(f));
console.log("\nTotal MEDIUM: " + findings.length);
