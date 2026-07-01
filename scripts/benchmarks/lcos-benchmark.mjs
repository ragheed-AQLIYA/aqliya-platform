#!/usr/bin/env node
/**
 * LCOS Performance Benchmark
 *
 * Measures key LCOS read operations (Prisma row counts) and reports timing.
 * Usage: node scripts/benchmarks/lcos-benchmark.mjs
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.resolve(__dirname, "../../docs/benchmarks");
const RESULT_FILE = path.resolve(RESULTS_DIR, `lcos-benchmark-${Date.now()}.json`);

const prisma = new PrismaClient();

const BENCHMARKS = [
  { name: "LCProject count", query: () => prisma.lCProject.count() },
  { name: "LCSupplier count", query: () => prisma.lCSupplier.count() },
  { name: "LCSpendRecord count", query: () => prisma.lCSpendRecord.count() },
  { name: "LCClassification count", query: () => prisma.lCClassification.count() },
  { name: "LCContentScore count", query: () => prisma.lCContentScore.count() },
  { name: "LCFinding count", query: () => prisma.lCFinding.count() },
  { name: "LCHealthRecord count", query: () => prisma.lCHealthRecord.count() },
  { name: "LCIndustryMemory count", query: () => prisma.lCIndustryMemory.count() },
  { name: "LCSuggestion count", query: () => prisma.lCSuggestion.count() },
  { name: "LCAuditEvent count", query: () => prisma.lCAuditEvent.count() },
];

async function runBenchmark() {
  console.log("=== LCOS Performance Benchmark ===");
  console.log(`startedAt: ${new Date().toISOString()}\n`);

  const results = [];

  for (const b of BENCHMARKS) {
    const start = Date.now();
    let count = 0;
    let error = null;

    try {
      count = await b.query();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    const durationMs = Date.now() - start;
    results.push({
      name: b.name,
      count,
      durationMs,
      error,
    });

    const status = error ? `ERROR: ${error}` : `${count} rows`;
    console.log(`  ${b.name.padEnd(35)} ${String(durationMs).padStart(6)}ms  ${status}`);
  }

  const totalDurationMs = results.reduce((s, r) => s + r.durationMs, 0);

  const report = {
    benchmarkDate: new Date().toISOString(),
    totalDurationMs,
    results,
    summary: {
      totalQueries: results.length,
      passed: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
      avgDurationMs: results.length > 0 ? Math.round(totalDurationMs / results.length) : 0,
      p95DurationMs: computeP95(results.map((r) => r.durationMs)),
    },
  };

  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  fs.writeFileSync(RESULT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nResults saved: ${RESULT_FILE}`);
  console.log("=== BENCHMARK COMPLETE ===");

  return report;
}

function computeP95(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

runBenchmark()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
