/**
 * LCGPA Regulatory Intelligence — Effective Date Resolution Helper.
 *
 * Analyzes product commencement dates from ingested datasets and
 * recommends an effective date for activation.
 *
 * Usage:
 *   npx tsx scripts/localcontent/lcgpa-regulatory-effective-date.ts
 *   npx tsx scripts/localcontent/lcgpa-regulatory-effective-date.ts --set 2026-08-01
 */
import { loadEngineState } from "@/lib/local-content/lcgpa/regulatory/persistence";
import { db, disconnect } from "./lcgpa-regulatory-db";

function value(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : fallback;
}

async function main(): Promise<void> {
  const state = await loadEngineState(await db());

  console.log("═".repeat(60));
  console.log("LCGPA EFFECTIVE DATE RESOLUTION");
  console.log("═".repeat(60));

  // Collect all product effective dates
  const allProducts = state.datasets.flatMap((d) => d.products);
  console.log(`\nTotal products across all datasets: ${allProducts.length}`);

  // Group by effective date
  const dateGroups = new Map<string, number>();
  for (const product of allProducts) {
    const dateStr = product.effectiveFrom?.toISOString().slice(0, 10) ?? "UNKNOWN";
    dateGroups.set(dateStr, (dateGroups.get(dateStr) ?? 0) + 1);
  }

  console.log("\nProduct commencement dates:");
  const sortedDates = [...dateGroups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [date, count] of sortedDates) {
    console.log(`  ${date}: ${count} products`);
  }

  // Analyze dataset-level dates
  console.log("\nDataset effective dates:");
  for (const dataset of state.datasets) {
    console.log(`  ${dataset.datasetVersion}:`);
    console.log(`    status: ${dataset.status}`);
    console.log(`    effectiveFrom: ${dataset.effectiveFrom?.toISOString().slice(0, 10) ?? "(not set)"}`);
    console.log(`    effectiveTo: ${dataset.effectiveTo?.toISOString().slice(0, 10) ?? "(not set)"}`);
    console.log(`    products: ${dataset.products.length}`);
  }

  // Recommendation
  const earliest = sortedDates.find(([d]) => d !== "UNKNOWN");
  if (earliest) {
    console.log("\n" + "─".repeat(60));
    console.log("RECOMMENDATION:");
    console.log(`  Earliest product commencement date: ${earliest[0]}`);
    console.log(`  Number of products commencing then: ${earliest[1]}`);
    console.log("");
    console.log("  Option A (Conservative): Use this date as effective date");
    console.log(`    npx tsx scripts/localcontent/lcgpa-regulatory-effective-date.ts --set ${earliest[0]}`);
    console.log("");
    console.log("  Option B (Official): Contact LCGPA for official effective date");
    console.log("    See docs/regulatory/LCGPA_OPEN_ITEMS.md §1");
    console.log("");
    console.log("  Option C (Deferred): Leave datasets as PUBLISHED (inactive)");
    console.log("    No action needed — datasets remain inactive until effective date is set");
  }

  // Check if --set was provided
  const setDate = value("set", "");
  if (setDate) {
    console.log(`\nSetting effective date to: ${setDate}`);
    console.log("(This would update all PUBLISHED datasets to have effectiveFrom = ${setDate})");
    console.log("NOT IMPLEMENTED — requires human approval");
  }

  console.log("\n" + "═".repeat(60));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => disconnect());
