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
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "audit_os", action: "archival" });

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
    logger.info("Dry run summary", { dryRun: true, eventsToArchive: count });
    process.exit(0);
  }

  const report = await archiveOldEvents(retentionDays);
  logger.info("Archival complete", { report });
  process.exit(report.eventsArchived >= 0 ? 0 : 1);
}

main().catch((err) => {
  logger.error("Archival failed", err as Error);
  process.exit(1);
});
