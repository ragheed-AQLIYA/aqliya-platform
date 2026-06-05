// ─── SIEM Export Service ───
// Uses file-based persistence for export job records (no schema change required).

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  SiemExportOptions,
  SiemExportResult,
  SiemExportJob,
  SiemExportConfig,
  SiemExportFilters,
  SiemFormat,
  SiemExportStatus,
} from "./types";
import {
  formatAsJson,
  formatAsSyslog,
  formatAsCef,
  formatAsSplunkHec,
} from "./formatters";
import {
  deliverToHttp,
  deliverToSplunk,
  deliverToFile,
  deliverToS3,
} from "./delivery";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── Jobs persistence ───

const JOBS_DIR = process.env.LOCAL_STORAGE_DIR
  ? join(process.env.LOCAL_STORAGE_DIR, "siem-jobs")
  : join(process.cwd(), "uploads", "siem-jobs");

async function ensureJobsDir(): Promise<void> {
  await mkdir(JOBS_DIR, { recursive: true });
}

function jobFilePath(id: string): string {
  return join(JOBS_DIR, `${id}.json`);
}

async function persistJob(job: SiemExportJob): Promise<void> {
  await ensureJobsDir();
  await writeFile(jobFilePath(job.id), JSON.stringify(job, null, 2), "utf-8");
}

async function loadJobs(
  organizationId: string,
  limit: number,
  offset: number,
): Promise<SiemExportJob[]> {
  await ensureJobsDir();
  const { readdir } = await import("node:fs/promises");
  let files: string[];
  try {
    files = await readdir(JOBS_DIR);
  } catch {
    return [];
  }
  const jobs: SiemExportJob[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const content = await readFile(join(JOBS_DIR, file), "utf-8");
      const job = JSON.parse(content) as SiemExportJob;
      if (job.organizationId === organizationId) {
        jobs.push(job);
      }
    } catch {
      // skip corrupt files
    }
  }
  jobs.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return jobs.slice(offset, offset + limit);
}

function generateId(): string {
  return `siem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Format selection ───

function formatEvents(
  events: Prisma.PlatformAuditLogGetPayload<{}>[],
  format: SiemFormat,
) {
  switch (format) {
    case "json":
      return formatAsJson(events);
    case "syslog":
      return formatAsSyslog(events);
    case "cef":
      return formatAsCef(events);
    case "splunk-hec":
      return formatAsSplunkHec(events);
  }
}

// ─── Query builder ───

function buildWhereClause(
  organizationId: string,
  filters?: SiemExportFilters,
): Prisma.PlatformAuditLogWhereInput {
  const where: Prisma.PlatformAuditLogWhereInput = {
    platformOrganizationId: organizationId,
  };
  if (!filters) return where;
  if (filters.productKey) where.productKey = filters.productKey;
  if (filters.action) where.action = filters.action;
  if (filters.severity) where.severity = filters.severity;
  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }
  return where;
}

// ─── Export lifecycle ───

/**
 * Export audit logs with the given options.
 * Queries logs, formats them, and delivers to the configured destination.
 */
export async function exportAuditLogs(
  options: SiemExportOptions,
): Promise<SiemExportResult> {
  const { organizationId, format, destination, filters, initiatedBy } = options;

  try {
    const where = buildWhereClause(organizationId, filters);
    const events = await prisma.platformAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const totalEvents = events.length;
    const now = new Date().toISOString();
    const jobId = generateId();

    if (totalEvents === 0) {
      const job: SiemExportJob = {
        id: jobId,
        organizationId,
        status: "completed",
        format,
        totalEvents: 0,
        exportedAt: now,
        initiatedBy,
        createdAt: now,
        updatedAt: now,
      };
      await persistJob(job);
      await auditSiemAction(organizationId, "siem.export.completed", {
        format,
        totalEvents: 0,
        initiatedBy,
      });
      return { ok: true, jobId, totalEvents: 0 };
    }

    // Format
    const formatted = formatEvents(events, format);

    // Deliver
    if (destination) {
      let deliveryResult: { ok: boolean; error?: string };
      switch (destination.type) {
        case "http":
          deliveryResult = await deliverToHttp(
            destination.url ?? "",
            formatted.body,
          );
          break;
        case "splunk-hec":
          deliveryResult = await deliverToSplunk(
            destination.url ?? "",
            destination.token ?? "",
            formatted.body,
          );
          break;
        case "file":
          deliveryResult = await deliverToFile(
            formatted.body,
            destination.url ?? `siem-export-${Date.now()}.${format}`,
          );
          break;
        case "s3":
          deliveryResult = await deliverToS3(
            formatted.body,
            `siem-exports/${organizationId}/${Date.now()}.${format}`,
          );
          break;
        default:
          deliveryResult = { ok: false, error: "Unknown destination type" };
      }

      if (!deliveryResult.ok) {
        const job: SiemExportJob = {
          id: jobId,
          organizationId,
          destinationId: destination.id,
          status: "failed",
          format,
          totalEvents,
          exportedAt: now,
          error: deliveryResult.error,
          initiatedBy,
          createdAt: now,
          updatedAt: now,
        };
        await persistJob(job);
        await auditSiemAction(organizationId, "siem.export.failed", {
          format,
          totalEvents,
          error: deliveryResult.error,
          destinationType: destination.type,
          initiatedBy,
        });
        return {
          ok: false,
          jobId,
          totalEvents,
          error: deliveryResult.error,
        };
      }
    }

    // Record success
    const job: SiemExportJob = {
      id: jobId,
      organizationId,
      destinationId: destination?.id,
      status: "completed",
      format,
      totalEvents,
      exportedAt: now,
      initiatedBy,
      createdAt: now,
      updatedAt: now,
    };
    await persistJob(job);
    await auditSiemAction(organizationId, "siem.export.completed", {
      format,
      totalEvents,
      destinationType: destination?.type,
      initiatedBy,
    });
    return { ok: true, jobId, totalEvents };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const now = new Date().toISOString();
    const jobId = generateId();
    const job: SiemExportJob = {
      id: jobId,
      organizationId,
      status: "failed",
      format,
      totalEvents: 0,
      exportedAt: now,
      error: message,
      initiatedBy,
      createdAt: now,
      updatedAt: now,
    };
    await persistJob(job);
    return { ok: false, jobId, totalEvents: 0, error: message };
  }
}

/**
 * Get past export jobs for an organization.
 */
export async function getExportHistory(
  organizationId: string,
  limit = 25,
  offset = 0,
): Promise<SiemExportJob[]> {
  return loadJobs(organizationId, limit, offset);
}

// ─── Schedule management ───

interface ScheduledExport {
  configId: string;
  intervalId: ReturnType<typeof setInterval>;
}

const activeSchedules = new Map<string, ScheduledExport>();

function intervalMsForSchedule(
  schedule: SiemExportConfig["schedule"],
  _cronExpression?: string,
): number {
  switch (schedule) {
    case "hourly":
      return 3600000;
    case "daily":
      return 86400000;
    case "weekly":
      return 604800000;
    case "custom":
      return 3600000;
    default:
      return 86400000;
  }
}

/**
 * Schedule recurring SIEM exports.
 */
export function scheduleExport(config: SiemExportConfig): boolean {
  if (activeSchedules.has(config.id)) {
    console.warn(`[SIEM] Export schedule ${config.id} already active`);
    return false;
  }
  const ms = intervalMsForSchedule(config.schedule, config.cronExpression);
  const intervalId = setInterval(async () => {
    try {
      await exportAuditLogs({
        organizationId: config.organizationId,
        format: config.format,
        filters: config.filters,
        initiatedBy: "schedule",
      });
    } catch {
      // logged inside exportAuditLogs
    }
  }, ms);
  activeSchedules.set(config.id, { configId: config.id, intervalId });
  return true;
}

/**
 * Cancel a scheduled SIEM export.
 */
export function cancelExport(configId: string): boolean {
  const scheduled = activeSchedules.get(configId);
  if (!scheduled) return false;
  clearInterval(scheduled.intervalId);
  activeSchedules.delete(configId);
  return true;
}

/**
 * Get count of active schedules.
 */
export function getActiveScheduleCount(): number {
  return activeSchedules.size;
}

// ─── Audit helper ───

async function auditSiemAction(
  organizationId: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "platform",
    action,
    platformOrganizationId: organizationId,
    severity: "info",
    sourceSystem: "siem-export-service",
    metadata: metadata ?? {},
  });
}
