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

  // 1. Read old events from PlatformAuditLog (dual-write with productKey: "audit_os")
  // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
  // const events = await prisma.auditEvent.findMany({
  //   where: { timestamp: { lt: cutoff } },
  //   orderBy: { timestamp: "asc" },
  //   select: {
  //     id: true,
  //     engagementId: true,
  //     eventType: true,
  //     actorId: true,
  //     actorName: true,
  //     actorRole: true,
  //     targetType: true,
  //     targetId: true,
  //     previousState: true,
  //     newState: true,
  //     description: true,
  //     aiRelated: true,
  //     metadata: true,
  //     timestamp: true,
  //   },
  // });

  const rawEvents = await prisma.platformAuditLog.findMany({
    where: { productKey: "audit_os", createdAt: { lt: cutoff } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      sourceId: true,
      action: true,
      actorId: true,
      actorName: true,
      targetType: true,
      targetId: true,
      beforeState: true,
      afterState: true,
      eventDescription: true,
      aiRelated: true,
      metadata: true,
      createdAt: true,
    },
  });

  if (rawEvents.length === 0) {
    return {
      archiveFile,
      eventsArchived: 0,
      eventsDeleted: 0,
      retentionDays: days,
      cutoffDate: cutoff.toISOString(),
      durationMs: Date.now() - start,
    };
  }

  // 2. Map PlatformAuditLog rows to ArchiveEntry shape
  const BATCH = 500;
  const now = new Date().toISOString();
  const events = rawEvents.map((e) => ({
    id: e.id,
    engagementId: ((e.metadata as Record<string, unknown> | null)?.engagementId as string) ?? e.sourceId ?? '',
    eventType: e.action,
    actorId: e.actorId ?? '',
    actorName: e.actorName ?? '',
    actorRole: '',
    targetType: e.targetType ?? '',
    targetId: e.targetId ?? '',
    previousState: e.beforeState ?? '',
    newState: e.afterState ?? '',
    description: e.eventDescription ?? '',
    aiRelated: e.aiRelated,
    metadata: e.metadata as Record<string, unknown> | null,
    timestamp: e.createdAt.toISOString(),
    archivedAt: now,
  } satisfies ArchiveEntry));

  // 3. Write to NDJSON archive
  const writeStream = fs.createWriteStream(archiveFile, { encoding: "utf-8" });

  for (const entry of events) {
    writeStream.write(JSON.stringify(entry) + "\n");
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end(() => resolve());
    writeStream.on("error", reject);
  });

  let totalArchived = events.length;

  // 4. Bulk-delete archived events from auditEvent using sourceId (the original auditEvent.id)
  // Note: auditEvent.deleteMany is kept on the original table (write operations unchanged)
  let totalDeleted = 0;
  const platformIds = rawEvents.map((e) => e.id);
  for (let i = 0; i < platformIds.length; i += BATCH) {
    const batch = platformIds.slice(i, i + BATCH);
    const result = await prisma.platformAuditLog.deleteMany({
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

  // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
  // return prisma.auditEvent.count({
  //   where: { timestamp: { lt: cutoff } },
  // });
  return prisma.platformAuditLog.count({
    where: { productKey: "audit_os", createdAt: { lt: cutoff } },
  });
}
