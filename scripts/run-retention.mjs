#!/usr/bin/env node

/**
 * Data Retention CLI
 * Usage:
 *   node scripts/run-retention.mjs --dry-run   (preview mode)
 *   node scripts/run-retention.mjs --apply     (execute retention)
 *   node scripts/run-retention.mjs --apply --model PlatformAuditLog  (single model)
 */

// NOTE: This script requires the Next.js runtime environment.
// For production scheduling, use: node --import tsx scripts/run-retention.mjs --apply
// or build and run: npx tsx scripts/run-retention.mjs --dry-run

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isApply = args.includes("--apply");
const modelIndex = args.indexOf("--model");
const modelName = modelIndex >= 0 ? args[modelIndex + 1] : null;

if (!isDryRun && !isApply) {
  console.log("Usage: node scripts/run-retention.mjs --dry-run | --apply [--model ModelName]");
  process.exit(0);
}

async function main() {
  const { dryRun, runScheduledRetention, applyRetention } = await import("../src/lib/platform/retention/engine.js");
  const { getPolicyForModel, getAllPolicies } = await import("../src/lib/platform/retention/policies.js");

  if (isDryRun) {
    console.log("DRY RUN - No data will be modified\n");

    let results;
    if (modelName) {
      const policy = getPolicyForModel(modelName);
      if (!policy) {
        console.error(`Unknown model: ${modelName}`);
        process.exit(1);
      }
      results = await dryRun(policy);
    } else {
      results = await dryRun();
    }

    const totalRecords = results.reduce((sum, r) => sum + r.recordsFound, 0);

    console.log(JSON.stringify({
      mode: "dry-run",
      timestamp: new Date().toISOString(),
      totalRecordsFound: totalRecords,
      details: results.map((r) => ({
        model: r.modelName,
        action: r.action,
        recordsFound: r.recordsFound,
        retentionDays: r.retentionDays,
        samples: r.sampleRecordIds,
      })),
    }, null, 2));

    console.log(`\nTotal records that would be affected: ${totalRecords}`);
  }

  if (isApply) {
    console.log("APPLY - Running retention policies\n");

    if (modelName) {
      const policy = getPolicyForModel(modelName);
      if (!policy) {
        console.error(`Unknown model: ${modelName}`);
        process.exit(1);
      }
      const result = await applyRetention(policy);
      console.log(JSON.stringify({
        mode: "apply",
        timestamp: new Date().toISOString(),
        model: modelName,
        result,
      }, null, 2));
    } else {
      const result = await runScheduledRetention();
      console.log(JSON.stringify({
        mode: "apply",
        timestamp: new Date().toISOString(),
        totalAffected: result.totalAffected,
        durationMs: result.durationMs,
        jobs: result.jobs.map((j) => ({
          model: j.modelName,
          action: j.action,
          recordsAffected: j.recordsAffected,
          status: j.status,
          error: j.error ?? null,
        })),
      }, null, 2));

      console.log(`\nTotal records affected: ${result.totalAffected}`);
      console.log(`Duration: ${result.durationMs}ms`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
