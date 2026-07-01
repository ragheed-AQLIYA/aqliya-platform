#!/usr/bin/env tsx
/**
 * TB Classification Benchmark — Deterministic vs Local AI
 *
 * Uses classifyAccountRulesOnly + classifyAccountLocalOnly
 * from tb-intelligence on the full 578-account TB file.
 *
 * Usage: tsx -r ./scripts/mock-server-only.cjs scripts/validation/tb-benchmark-run.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";

config({ path: resolve(__dirname, "../../.env") });

const RESULTS_DIR = resolve(__dirname, "../../docs/audits/evidence");

function loadAccounts(): Array<{
  accountCode: string;
  accountName: string;
  balance: number;
  erpStatementSide?: string;
  classificationHints?: string[];
}> {
  const XLSX = require("xlsx");
  const wb = XLSX.readFile(resolve(__dirname, "../../TB 31-12-2025 Final.xlsx"));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  const accounts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || String(r[0]).trim() === "") continue;
    accounts.push({
      accountCode: String(r[0]).trim(),
      accountName: String(r[1] || "").trim(),
      balance: parseFloat(String(r[9] || "0")) || 0,
      erpStatementSide: String(r[12] || "").trim(),
      classificationHints: [String(r[13] || "").trim(), String(r[14] || "").trim()].filter(Boolean),
    });
  }
  return accounts;
}

interface ClassificationMetric {
  accountCode: string;
  accountName: string;
  canonicalCode: string | null;
  category: string | null;
  confidence: number;
  source: string;
  providerId?: string;
  latencyMs?: number;
}

function runDeterministic(
  accounts: ReturnType<typeof loadAccounts>,
  classifyFn: any,
): { metrics: ClassificationMetric[]; durationMs: number } {
  const start = Date.now();
  const metrics: ClassificationMetric[] = [];
  let unclassified = 0;
  let lowConfidence = 0;

  for (const acc of accounts) {
    try {
      const result = classifyFn({
        organizationId: "benchmark",
        engagementId: "benchmark-det",
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitAmount: acc.balance >= 0 ? acc.balance : 0,
        creditAmount: acc.balance < 0 ? Math.abs(acc.balance) : 0,
        erpStatementSide: acc.erpStatementSide ? (acc.erpStatementSide.includes("Balance Sheet") ? "balance_sheet" : "income_statement") : undefined,
        classificationHints: acc.classificationHints,
      });

      if (result?.source === "none" || !result?.category) {
        unclassified++;
        metrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, category: "UNCLASSIFIED", confidence: 0, source: "none" });
      } else {
        if (result.confidence < 0.5) lowConfidence++;
        metrics.push({
          accountCode: acc.accountCode,
          accountName: acc.accountName,
          category: result.category,
          confidence: result.confidence,
          source: result.source,
        });
      }
    } catch (e: any) {
      metrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, category: "ERROR", confidence: 0, source: "error" });
    }
  }

  const durationMs = Date.now() - start;
  return { metrics, durationMs };
}

async function runLocalAI(
  accounts: ReturnType<typeof loadAccounts>,
  classifyFn: any,
): Promise<{ metrics: ClassificationMetric[]; durationMs: number }> {
  const start = Date.now();
  const metrics: ClassificationMetric[] = [];
  let unclassified = 0;
  let lowConfidence = 0;

  for (let i = 0; i < Math.min(accounts.length, 50); i++) {
    const acc = accounts[i];
    try {
      const result = await classifyFn({
        organizationId: "benchmark",
        engagementId: "benchmark-local",
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitAmount: acc.balance >= 0 ? acc.balance : 0,
        creditAmount: acc.balance < 0 ? Math.abs(acc.balance) : 0,
        enableCloudAi: false,
        erpStatementSide: acc.erpStatementSide ? (acc.erpStatementSide.includes("Balance Sheet") ? "balance_sheet" : "income_statement") : undefined,
        classificationHints: acc.classificationHints,
      });

      if (result?.source === "none" || !result?.category) {
        unclassified++;
        metrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, category: "UNCLASSIFIED", confidence: 0, source: "none" });
      } else {
        if (result.confidence < 0.5) lowConfidence++;
        metrics.push({
          accountCode: acc.accountCode,
          accountName: acc.accountName,
          category: result.category,
          confidence: result.confidence,
          source: result.source,
        });
      }
    } catch (e: any) {
      metrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, category: "ERROR", confidence: 0, source: "error" });
    }
    if ((i + 1) % 10 === 0) process.stderr.write(`  Local AI: ${i + 1}/${Math.min(accounts.length, 50)} accounts (${((i + 1) / Math.min(accounts.length, 50)) * 100}%)\r`);
  }

  const durationMs = Date.now() - start;
  return { metrics, durationMs };
}

function summarize(metrics: ClassificationMetric[], label: string) {
  const total = metrics.length;
  const classified = metrics.filter((m) => m.canonicalCode).length;
  const unclassified = total - classified;
  const errors = metrics.filter((m) => m.source === "error").length;
  const lowConfidence = metrics.filter((m) => m.canonicalCode && m.confidence < 0.5).length;
  const highConfidence = metrics.filter((m) => m.canonicalCode && m.confidence >= 0.75).length;
  const medConfidence = metrics.filter(
    (m) => m.canonicalCode && m.confidence >= 0.5 && m.confidence < 0.75,
  ).length;

  const avgConf = classified > 0
    ? metrics.filter((m) => m.canonicalCode).reduce((s, m) => s + m.confidence, 0) / classified
    : 0;

  return { label, total, classified, unclassified, errors, lowConfidence, highConfidence, medConfidence, avgConfidence: avgConf };
}

async function main() {
  console.log("=== TB Classification Benchmark ===\n");
  console.log(`startedAt: ${new Date().toISOString()}\n`);

  // Load accounts
  console.log("Loading TB file...");
  const accounts = loadAccounts();
  console.log(`Loaded ${accounts.length} accounts\n`);

  // Import tb-intelligence functions
  const tbIntelligence = await import("@/lib/tb-intelligence");
  const { loadCanonicalCandidates } = await import("@/lib/tb-intelligence/coa-loader");
  const candidates = await loadCanonicalCandidates();

  const fullLocal = process.argv.includes("--full-local");
  const sampleArg = process.argv.indexOf("--limit");
  const sampleSize = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) : fullLocal ? accounts.length : 50;

  // ── Benchmark A: Deterministic ──
  console.log("--- Benchmark A: Deterministic (All 578 accounts) ---");
  const startA = Date.now();
  const detMetrics: ClassificationMetric[] = [];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    try {
      const t0 = Date.now();
      const result = await tbIntelligence.classifyAccountRulesOnly({
        organizationId: "benchmark",
        engagementId: "benchmark-det",
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitAmount: acc.balance >= 0 ? acc.balance : 0,
        creditAmount: acc.balance < 0 ? Math.abs(acc.balance) : 0,
        erpStatementSide: acc.erpStatementSide
          ? acc.erpStatementSide.includes("Balance Sheet") ? "balance_sheet" : "income_statement"
          : undefined,
        classificationHints: acc.classificationHints,
      }, candidates);
      detMetrics.push({
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        canonicalCode: result?.canonicalCode ?? null,
        category: result?.category ?? null,
        confidence: result?.confidence ?? 0,
        source: result?.source ?? "none",
        latencyMs: Date.now() - t0,
      });
    } catch {
      detMetrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, canonicalCode: null, category: null, confidence: 0, source: "error", latencyMs: 0 });
    }
    if ((i + 1) % 100 === 0) process.stderr.write(`  Deterministic: ${i + 1}/${accounts.length} accounts\r`);
  }

  const durationDet = Date.now() - startA;
  const sumDet = summarize(detMetrics, "Deterministic");
  sumDet.durationMs = durationDet;
  console.log(`\n  Duration: ${(durationDet / 1000).toFixed(1)}s\n`);

  // ── Benchmark B: Local AI ──
  console.log(`--- Benchmark B: Local AI (ollama/qwen3:8b) — ${sampleSize} accounts ---`);
  process.env.FF_AI_REAL_PROVIDERS = "true";
  const startB = Date.now();
  const localMetrics: ClassificationMetric[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const acc = accounts[i];
    try {
      const t0 = Date.now();
      const result = await tbIntelligence.classifyAccountLocalOnly({
        organizationId: "benchmark",
        engagementId: "benchmark-local",
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitAmount: acc.balance >= 0 ? acc.balance : 0,
        creditAmount: acc.balance < 0 ? Math.abs(acc.balance) : 0,
        enableCloudAi: false,
        erpStatementSide: acc.erpStatementSide
          ? acc.erpStatementSide.includes("Balance Sheet") ? "balance_sheet" : "income_statement"
          : undefined,
        classificationHints: acc.classificationHints,
      }, candidates);
      localMetrics.push({
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        canonicalCode: result?.canonicalCode ?? null,
        category: result?.category ?? null,
        confidence: result?.confidence ?? 0,
        source: result?.providerId || result?.source || "none",
        providerId: result?.providerId,
        latencyMs: Date.now() - t0,
      });
    } catch {
      localMetrics.push({ accountCode: acc.accountCode, accountName: acc.accountName, canonicalCode: null, category: null, confidence: 0, source: "error", latencyMs: 0 });
    }
    if ((i + 1) % 5 === 0 || i === sampleSize - 1) {
      process.stderr.write(`  Local AI: ${i + 1}/${sampleSize} accounts\r`);
    }
  }

  const durationLocal = Date.now() - startB;
  const sumLocal = summarize(localMetrics, "Local AI (qwen3:8b)");
  sumLocal.durationMs = durationLocal;
  console.log(`\n  Duration: ${(durationLocal / 1000).toFixed(1)}s\n`);

  // ── Same-sample comparison ──
  const detSame = detMetrics.slice(0, sampleSize);
  const disagreements: Array<{ code: string; name: string; detCat: string; detConf: number; localCat: string; localConf: number }> = [];

  for (let i = 0; i < sampleSize; i++) {
    if (detSame[i]!.canonicalCode !== localMetrics[i]!.canonicalCode) {
      disagreements.push({
        code: detSame[i]!.accountCode,
        name: detSame[i]!.accountName,
        detCat: detSame[i]!.canonicalCode ?? "UNCLASSIFIED",
        detConf: detSame[i]!.confidence,
        localCat: localMetrics[i]!.canonicalCode ?? "UNCLASSIFIED",
        localConf: localMetrics[i]!.confidence,
      });
    }
  }

  // ── Report ──
  console.log("=" .repeat(70));
  console.log("BENCHMARK RESULTS");
  console.log("=" .repeat(70));
  console.log("");

  console.log(`| Metric                   | Deterministic (578) | Local AI (${sampleSize})   |`);
  console.log("|--------------------------|---------------------|-----------------|");
  console.log(`| Total Accounts           | ${String(sumDet.total).padStart(20)} | ${String(sumLocal.total).padStart(15)} |`);
  console.log(`| Classified               | ${String(sumDet.classified).padStart(20)} | ${String(sumLocal.classified).padStart(15)} |`);
  console.log(`| Unclassified             | ${String(sumDet.unclassified).padStart(20)} | ${String(sumLocal.unclassified).padStart(15)} |`);
  console.log(`| Errors                   | ${String(sumDet.errors).padStart(20)} | ${String(sumLocal.errors).padStart(15)} |`);
  console.log(`| Low Confidence (<50%)    | ${String(sumDet.lowConfidence).padStart(20)} | ${String(sumLocal.lowConfidence).padStart(15)} |`);
  console.log(`| High Confidence (>=75%)  | ${String(sumDet.highConfidence).padStart(20)} | ${String(sumLocal.highConfidence).padStart(15)} |`);
  console.log(`| Medium Confidence (50-74) | ${String(sumDet.medConfidence).padStart(20)} | ${String(sumLocal.medConfidence).padStart(15)} |`);
  console.log(`| Avg Confidence           | ${sumDet.avgConfidence.toFixed(3).padStart(20)} | ${sumLocal.avgConfidence.toFixed(3).padStart(15)} |`);
  console.log(`| Runtime                  | ${(sumDet.durationMs / 1000).toFixed(1).padStart(17)}s | ${(sumLocal.durationMs / 1000).toFixed(1).padStart(12)}s |`);
  console.log(`| Coverage %               | ${((sumDet.classified / sumDet.total) * 100).toFixed(1).padStart(19)}% | ${((sumLocal.classified / sumLocal.total) * 100).toFixed(1).padStart(14)}% |`);
  console.log("");

  // ── Disagreements ──
  console.log("=" .repeat(70));
  console.log("CLASSIFICATION DISAGREEMENTS (Deterministic vs Local AI)");
  console.log("=" .repeat(70));
  console.log("");
  console.log(`${disagreements.length} disagreements out of ${sampleSize} accounts\n`);

  if (disagreements.length > 0) {
    console.log("| Account Code | Account Name | Det Cat | Det Conf | Local Cat | Local Conf |");
    console.log("|--------------|--------------|---------|----------|-----------|------------|");
    for (const d of disagreements.slice(0, 20)) {
      console.log(`| ${d.code.padEnd(12)} | ${d.name.padEnd(12)} | ${d.detCat.padEnd(7)} | ${(d.detConf * 100).toFixed(0).padStart(4)}% | ${d.localCat.padEnd(9)} | ${(d.localConf * 100).toFixed(0).padStart(4)}% |`);
    }
  }

  // ── Save evidence ──
  if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

  const evidence = {
    benchmarkDate: new Date().toISOString(),
    tbFile: "TB 31-12-2025 Final.xlsx",
    totalAccounts: accounts.length,
    deterministic: {
      totalAccounts: accounts.length,
      ...sumDet,
      metrics: detMetrics,
    },
    localAi: {
      sampleSize,
      totalAccounts: sampleSize,
      ...sumLocal,
      metrics: localMetrics,
    },
    disagreements: disagreements.slice(0, 50),
    env: {
      FF_AI_REAL_PROVIDERS: "true",
      AI_MODE: process.env.AI_MODE,
      AI_LOCAL_MODEL: process.env.AI_LOCAL_MODEL,
    },
  };

  const artifactPath = resolve(RESULTS_DIR, "tb-local-ai-benchmark-full.json");
  writeFileSync(artifactPath, JSON.stringify(evidence, null, 2));
  console.log(`\nArtifact: ${artifactPath}`);
  console.log("\n=== BENCHMARK COMPLETE ===");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
