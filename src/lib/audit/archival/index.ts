// ─── Audit Event Archival Service ───
// Moves AuditEvents older than RETENTION_DAYS to a JSON archive file
// and deletes them from the primary table.
//
// Run via: npx tsx src/lib/audit/archival/run.ts
// Or schedule: node scripts/platform/audit-archival-cron.mjs
//
// Environment variables:
//   AUDIT_RETENTION_DAYS  — default 365
//   AUDIT_ARCHIVE_DIR     — default ./audit-archives

import "server-only";
import * as fs from "node:fs";
import * as path from "node:path";
import { prisma } from "@/lib/prisma";

export interface ArchivalReport {
  archiveFile: string;
  eventsArchived: number;
  eventsDeleted: number;
  retentionDays: number;
  cutoffDate: string;
  durationMs: number;
}

export interface ArchiveEntry {
  id: string;
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState: string;
  newState: string;
  description: string;
  aiRelated: boolean;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  archivedAt: string;
}

function getRetentionDays(): number {
  const val = process.env.AUDIT_RETENTION_DAYS;
  if (!val) return 365;

  const parsed = Number.parseInt(val, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 365;
  }

  return parsed;
}

function resolveRetentionDays(retentionDays?: number): number {
  if (typeof retentionDays !== "number" || !Number.isFinite(retentionDays)) {
    return getRetentionDays();
  }

  return Math.max(1, Math.floor(retentionDays));
}

function getArchiveDir(): string {
  return process.env.AUDIT_ARCHIVE_DIR ?? path.join(process.cwd(), "audit-archives");
}

/**
 * Archive AuditEvents older than RETENTION_DAYS.
 *
 * Reads matching events, writes them to a timestamped NDJSON archive file,
 * then bulk-deletes them from the database.
 */
export async function archiveOldEvents(
  retentionDays?: number,
): Promise<ArchivalReport> {
  const start = Date.now();
  const days = resolveRetentionDays(retentionDays);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const archiveDir = getArchiveDir();
  fs.mkdirSync(archiveDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archiveFile = path.join(archiveDir, `audit-events-${timestamp}.ndjson`);

  // 1. Read old events in batches to avoid memory pressure
  const BATCH = 500;
  let totalArchived = 0;

  const events = await prisma.auditEvent.findMany({
    where: { timestamp: { lt: cutoff } },
    orderBy: { timestamp: "asc" },
    select: {
      id: true,
      engagementId: true,
      eventType: true,
      actorId: true,
      actorName: true,
      actorRole: true,
      targetType: true,
      targetId: true,
      previousState: true,
      newState: true,
      description: true,
      aiRelated: true,
      metadata: true,
      timestamp: true,
    },
  });

  if (events.length === 0) {
    return {
      archiveFile,
      eventsArchived: 0,
      eventsDeleted: 0,
      retentionDays: days,
      cutoffDate: cutoff.toISOString(),
      durationMs: Date.now() - start,
    };
  }

  // 2. Write to NDJSON archive
  const now = new Date().toISOString();
  const writeStream = fs.createWriteStream(archiveFile, { encoding: "utf-8" });

  for (const event of events) {
    const entry: ArchiveEntry = {
      ...event,
      metadata: event.metadata as Record<string, unknown> | null,
      timestamp: event.timestamp.toISOString(),
      archivedAt: now,
    };
    writeStream.write(JSON.stringify(entry) + "\n");
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end(() => resolve());
    writeStream.on("error", reject);
  });

  totalArchived = events.length;

  // 3. Bulk-delete archived events (in batches to avoid long-running transactions)
  let totalDeleted = 0;
  const ids = events.map((e) => e.id);
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const result = await prisma.auditEvent.deleteMany({
      where: { id: { in: batch } },
    });
    totalDeleted += result.count;
  }

  return {
    archiveFile,
    eventsArchived: totalArchived,
    eventsDeleted: totalDeleted,
    retentionDays: days,
    cutoffDate: cutoff.toISOString(),
    durationMs: Date.now() - start,
  };
}

/**
 * Dry-run: returns count of events that would be archived without archiving.
 */
export async function countEventsToArchive(
  retentionDays?: number,
): Promise<number> {
  const days = resolveRetentionDays(retentionDays);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return prisma.auditEvent.count({
    where: { timestamp: { lt: cutoff } },
  });
}
