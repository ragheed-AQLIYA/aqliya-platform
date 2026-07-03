#!/usr/bin/env npx tsx
/**
 * CLI runner for Audit Event Archival.
 *
 * Usage:
 *   npx tsx src/lib/audit/archival/run.ts [--dry-run] [--retention 365]
 *
 * Examples:
 *   npx tsx src/lib/audit/archival/run.ts
 *   npx tsx src/lib/audit/archival/run.ts --dry-run
 *   npx tsx src/lib/audit/archival/run.ts --retention 180
 */
import { archiveOldEvents, countEventsToArchive } from "./index";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const retentionIndex = args.indexOf("--retention");
  const retentionDays =
    retentionIndex !== -1 && retentionIndex + 1 < args.length
      ? parseInt(args[retentionIndex + 1], 10)
      : undefined;

  if (dryRun) {
    const count = await countEventsToArchive(retentionDays);
    console.log(JSON.stringify({ dryRun: true, eventsToArchive: count }, null, 2));
    process.exit(0);
  }

  const report = await archiveOldEvents(retentionDays);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.eventsArchived >= 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Archival failed:", err);
  process.exit(1);
});
