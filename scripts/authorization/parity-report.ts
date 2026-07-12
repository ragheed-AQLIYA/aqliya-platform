/**
 * Authorization Shadow Parity Report
 *
 * Reads shadow logger entries (from JSONL file or in-memory singleton)
 * and computes match/mismatch statistics.
 *
 * Usage:
 *   npx tsx scripts/authorization/parity-report.ts [--file=shadow-parity.jsonl]
 *
 * Outputs a formatted report to stdout.
 * Safe to run any time (read-only).
 */

import * as fs from "fs";
import * as path from "path";

interface ShadowRecord {
  requestId: string;
  timestamp: string;
  resourceType: string;
  resourceId?: string;
  action: string;
  role: string;
  organizationId: string;
  legacyAllowed: boolean;
  engineDecision: string;
  isMatch: boolean;
  latencyLegacyMs: number;
  latencyEngineMs: number;
  tracePolicy?: string;
  policiesExercised: string[];
  mismatchReason?: string;
}

function parseArgs(): { file?: string } {
  const args = process.argv.slice(2);
  const result: { file?: string } = {};
  for (const arg of args) {
    if (arg.startsWith("--file=")) {
      result.file = arg.slice("--file=".length);
    } else if (arg.startsWith("--file ")) {
      result.file = arg.slice("--file ".length);
    }
  }
  return result;
}

function loadRecords(filePath: string): ShadowRecord[] {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }
  const content = fs.readFileSync(resolved, "utf-8");
  const records: ShadowRecord[] = [];
  for (const line of content.trim().split("\n")) {
    try {
      records.push(JSON.parse(line));
    } catch {
      // Skip invalid lines
    }
  }
  return records;
}

function computeReport(records: ShadowRecord[]): string {
  const total = records.length;
  const matches = records.filter((r) => r.isMatch).length;
  const mismatches = records.filter((r) => !r.isMatch).length;
  const matchRate = total > 0 ? ((matches / total) * 100).toFixed(2) : "0.00";
  const mismatchRate = total > 0 ? ((mismatches / total) * 100).toFixed(2) : "0.00";

  // Group by resource type and action
  const byResource: Record<string, { total: number; matches: number; mismatches: number }> = {};
  for (const r of records) {
    const key = `${r.resourceType}.${r.action}`;
    if (!byResource[key]) byResource[key] = { total: 0, matches: 0, mismatches: 0 };
    byResource[key].total++;
    if (r.isMatch) byResource[key].matches++;
    else byResource[key].mismatches++;
  }

  // Mismatch details
  const mismatchDetails = records
    .filter((r) => !r.isMatch)
    .map(
      (r) =>
        `  - [${r.timestamp}] ${r.resourceType}/${r.action}: role=${r.role}, legacyAllowed=${r.legacyAllowed}, engineDecision=${r.engineDecision}, reason=${r.mismatchReason ?? "N/A"}`,
    );

  // Latency stats
  const latencies = records.map((r) => r.latencyEngineMs).filter((l) => l >= 0);
  const avgLatency =
    latencies.length > 0
      ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)
      : "N/A";
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;

  // Unique roles, resources, actions
  const roles = new Set(records.map((r) => r.role));
  const resources = new Set(records.map((r) => r.resourceType));
  const actions = new Set(records.map((r) => r.action));

  const lines: string[] = [];
  lines.push("=".repeat(72));
  lines.push("  AQLIYA Authorization — Shadow Parity Report");
  lines.push("=".repeat(72));
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Records analyzed: ${total}`);
  lines.push("");
  lines.push("── Summary ──");
  lines.push(`  Total comparisons:   ${total}`);
  lines.push(`  Matches:             ${matches} (${matchRate}%)`);
  lines.push(`  Mismatches:          ${mismatches} (${mismatchRate}%)`);
  lines.push("");
  lines.push("── Coverage ──");
  lines.push(`  Unique roles:        ${[...roles].join(", ")}`);
  lines.push(`  Unique resources:    ${[...resources].join(", ")}`);
  lines.push(`  Unique actions:      ${[...actions].join(", ")}`);
  lines.push("");
  lines.push("── By Resource / Action ──");
  for (const [key, stats] of Object.entries(byResource).sort()) {
    const rate = stats.total > 0 ? ((stats.matches / stats.total) * 100).toFixed(1) : "0.0";
    lines.push(`  ${key}: ${stats.total} total, ${stats.matches} match, ${stats.mismatches} mismatch (${rate}% match)`);
  }
  lines.push("");
  lines.push("── Latency (Engine) ──");
  lines.push(`  Average: ${avgLatency}ms`);
  lines.push(`  Maximum: ${maxLatency}ms`);
  lines.push(`  Samples: ${latencies.length}`);
  lines.push("");
  if (mismatchDetails.length > 0) {
    lines.push("── Mismatch Details ──");
    lines.push(...mismatchDetails);
    lines.push("");
  }
  lines.push("─".repeat(72));
  lines.push("  Report complete. No records were modified.");
  lines.push("─".repeat(72));

  return lines.join("\n");
}

function main(): void {
  const args = parseArgs();
  const filePath = args.file ?? "shadow-parity.jsonl";

  if (!fs.existsSync(path.resolve(filePath))) {
    console.log(`No parity file found at '${filePath}'.`);
    console.log("Tip: Export shadow logger records from the application runtime");
    console.log("      and pass the JSONL file path with --file=<path>.");
    console.log("");
    console.log("To capture records during development, set FEATURE_AUTHZ_SHADOW=1");
    console.log("and use the shadowLogger.export() method to persist records.");
    process.exit(0);
  }

  const records = loadRecords(filePath);
  if (records.length === 0) {
    console.log("No valid records found in the parity file.");
    process.exit(0);
  }

  const report = computeReport(records);
  console.log(report);
}

main();
