#!/usr/bin/env node
/**
 * Scanner Quality Runner
 *
 * Runs scanner regression tests and calculates quality metrics:
 *   - Precision = TP / (TP + FP)
 *   - FP Rate = FP / (TP + FP)
 *
 * Outputs results to engineering/reports/scanner-quality.json
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const REPORTS_DIR = join(REPO_ROOT, "engineering", "reports");
const REPORT_FILE = join(REPORTS_DIR, "scanner-quality.json");

// Count exported items in golden dataset arrays
function countGoldenCases(filePath, arrayName) {
  const content = readFileSync(filePath, "utf8");
  // Find the exported const array and count objects in it
  const regex = new RegExp(`export const ${arrayName}.*?=\\s*\\[([\\s\\S]*?)\\];`, "m");
  const match = content.match(regex);
  if (!match) return 0;
  // Count objects by counting lines with `id:` at start of line (not inside strings)
  const lines = match[1].split("\n");
  return lines.filter(l => /^\s*id:\s*["']/.test(l)).length;
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (err) {
    return err.stdout || err.message;
  }
}

// Parse Jest output for counts
function parseJestOutput(output) {
  const summaryMatch = output.match(/Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+total)?/);
  const failMatch = output.match(/(\d+)\s+failed/);
  return {
    passed: summaryMatch ? parseInt(summaryMatch[1], 10) : 0,
    failed: failMatch ? parseInt(failMatch[1], 10) : 0,
    total: summaryMatch ? (summaryMatch[2] ? parseInt(summaryMatch[2], 10) : parseInt(summaryMatch[1], 10)) : 0,
  };
}

console.log("Running scanner regression tests...\n");

const output = run(
  `npx jest --config jest.config.engineering.js engineering/__tests__/scanner-regression.test.ts --no-coverage --verbose 2>&1`
);

const testResults = parseJestOutput(output);

// Count from golden dataset files
const secFile = join(__dirname, "scanner-golden", "security-golden.ts");
const perfFile = join(__dirname, "scanner-golden", "performance-golden.ts");

const securityStats = {
  truePositives: countGoldenCases(secFile, "truePositives"),
  falsePositives: countGoldenCases(secFile, "falsePositives"),
  acceptedRisks: countGoldenCases(secFile, "acceptedRisks"),
  cleanCases: countGoldenCases(secFile, "cleanCases"),
};

const performanceStats = {
  truePositives: countGoldenCases(perfFile, "truePositives"),
  falsePositives: countGoldenCases(perfFile, "falsePositives"),
  acceptedRisks: countGoldenCases(perfFile, "acceptedRisks"),
  cleanCases: countGoldenCases(perfFile, "cleanCases"),
};

// Quality metrics
const tp = securityStats.truePositives + performanceStats.truePositives;
const fp = securityStats.falsePositives + performanceStats.falsePositives;
const tpFpSum = tp + fp;
const precision = tpFpSum > 0 ? Math.round((tp / tpFpSum) * 10000) / 100 : null;
const fpRate = tpFpSum > 0 ? Math.round((fp / tpFpSum) * 10000) / 100 : null;

const report = {
  generatedAt: new Date().toISOString(),
  testResults,
  goldenDataset: {
    truePositives: tp,
    falsePositives: fp,
    acceptedRisks: securityStats.acceptedRisks + performanceStats.acceptedRisks,
    cleanCases: securityStats.cleanCases + performanceStats.cleanCases,
  },
  quality: {
    precision,
    falsePositiveRate: fpRate,
    totalGoldenCases: securityStats.truePositives + securityStats.falsePositives +
                      securityStats.acceptedRisks + securityStats.cleanCases +
                      performanceStats.truePositives + performanceStats.falsePositives +
                      performanceStats.acceptedRisks + performanceStats.cleanCases,
    securityCases: securityStats,
    performanceCases: performanceStats,
  },
};

mkdirSync(REPORTS_DIR, { recursive: true });
writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n");

console.log(`${"=".repeat(60)}`);
console.log(`  Scanner Quality Report`);
console.log(`${"=".repeat(60)}`);
console.log(`  Tests:        ${testResults.passed}/${testResults.total} passed (${testResults.failed} failed)`);
console.log(`  Golden Cases: ${report.quality.totalGoldenCases} total`);
console.log(`    Security:   ${securityStats.truePositives} TP, ${securityStats.falsePositives} FP, ${securityStats.acceptedRisks} AR, ${securityStats.cleanCases} NA`);
console.log(`    Performance:${performanceStats.truePositives} TP, ${performanceStats.falsePositives} FP, ${performanceStats.acceptedRisks} AR, ${performanceStats.cleanCases} NA`);
console.log(`  Precision:    ${precision}%`);
console.log(`  FP Rate:      ${fpRate}%`);
console.log(`${"=".repeat(60)}`);
console.log(`  Report:       ${REPORT_FILE}`);

if (testResults.failed > 0) {
  console.log(`\n${output}`);
  process.exit(1);
}
