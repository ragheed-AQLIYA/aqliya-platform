import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { getPolicyForModel, getAllPolicies } from "./policies";
import { isRecordOnHold } from "./holds";
import type { RetentionPolicy, RetentionDryRunResult, RetentionRunResult, RetentionJob } from "./types";

type PrismaModel = {
  findMany: (args: unknown) => Promise<{ id: string; createdAt: Date }[]>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
  updateMany: (args: unknown) => Promise<{ count: number }>;
  count: (args: unknown) => Promise<number>;
};

function asRetentionModel(delegate: object): PrismaModel {
  return delegate as PrismaModel;
}

const CUTOFF_BUFFER_MS = 24 * 60 * 60 * 1000;

function getCutoffDate(retentionDays: number): Date {
  return new Date(Date.now() - retentionDays * CUTOFF_BUFFER_MS);
}

const MODEL_ACCESSORS: Record<string, PrismaModel | (() => PrismaModel)> = {
  PlatformAuditLog: asRetentionModel(prisma.platformAuditLog),
  ScimProvisioningEvent: asRetentionModel(prisma.scimProvisioningEvent),
  CrmSyncLog: asRetentionModel(prisma.crmSyncLog),
  ErpSyncLog: asRetentionModel(prisma.erpSyncLog),
  PlatformNotification: asRetentionModel(prisma.platformNotification),
  Session: asRetentionModel(prisma.session),
  IngestionDocument: asRetentionModel(prisma.ingestionDocument),
  IngestionBatch: asRetentionModel(prisma.ingestionBatch),
  IntelligenceQuery: asRetentionModel(prisma.intelligenceQuery),
  Decision: asRetentionModel(prisma.decision),
  AuditEngagement: asRetentionModel(prisma.auditEngagement),
  User: asRetentionModel(prisma.user),
};

function resolveModel(modelName: string): PrismaModel | undefined {
  const accessor = MODEL_ACCESSORS[modelName];
  if (!accessor) return undefined;
  return typeof accessor === "function" ? accessor() : accessor;
}

const SOFT_DELETE_MODELS: Record<string, { statusField?: string; deletedAtField?: string; archivedAtField?: string }> = {
  AuditEngagement: { statusField: "status" },
  PlatformNotification: { statusField: "status" },
  Decision: { statusField: "status" },
};

async function applySoftDelete(
  modelName: string,
  recordIds: string[],
  cutoff: Date,
): Promise<number> {
  const model = resolveModel(modelName);
  if (!model) return 0;

  const config = SOFT_DELETE_MODELS[modelName];

  if (!config) {
    const result = await model.deleteMany({
      where: { id: { in: recordIds }, createdAt: { lte: cutoff } },
    });
    return result.count;
  }

  if (config.deletedAtField) {
    const result = await model.updateMany({
      where: { id: { in: recordIds }, createdAt: { lte: cutoff } },
      data: { [config.deletedAtField]: new Date() },
    });
    return result.count;
  }

  if (config.archivedAtField) {
    const result = await model.updateMany({
      where: { id: { in: recordIds }, createdAt: { lte: cutoff } },
      data: { [config.archivedAtField]: new Date() },
    });
    return result.count;
  }

  if (config.statusField) {
    const result = await model.updateMany({
      where: { id: { in: recordIds }, createdAt: { lte: cutoff } },
      data: { [config.statusField]: "archived" },
    });
    return result.count;
  }

  const result = await model.deleteMany({
    where: { id: { in: recordIds }, createdAt: { lte: cutoff } },
  });
  return result.count;
}

function getModelLabel(modelName: string): string {
  const labels: Record<string, string> = {
    PlatformAuditLog: "سجل التدقيق",
    ScimProvisioningEvent: "أحداث SCIM",
    CrmSyncLog: "سجل مزامنة CRM",
    ErpSyncLog: "سجل مزامنة ERP",
    PlatformNotification: "الإشعارات",
    Session: "جلسات المستخدم",
    IngestionDocument: "مستندات الاستيراد",
    IngestionBatch: "دفعات الاستيراد",
    IntelligenceQuery: "استعلامات الذكاء",
    Decision: "القرارات",
    AuditEngagement: "مهام المراجعة",
    User: "المستخدمين",
  };
  return labels[modelName] ?? modelName;
}

async function getExpiredRecords(
  model: PrismaModel,
  cutoff: Date,
): Promise<{ id: string; createdAt: Date }[]> {
  const results = await model.findMany({
    where: { createdAt: { lte: cutoff } },
    orderBy: { createdAt: "asc" },
    take: 1000,
  } as never);
  return results as { id: string; createdAt: Date }[];
}

function canPerformHardDeleteOnModel(modelName: string): boolean {
  const NEVER_DELETE = new Set(["User", "PlatformSecret"]);
  return !NEVER_DELETE.has(modelName);
}

export async function applyRetention(policy: RetentionPolicy): Promise<RetentionRunResult> {
  const startTime = Date.now();

  if (!policy.enabled) {
    return {
      modelName: policy.modelName,
      action: policy.action,
      status: "skipped",
      recordsAffected: 0,
      durationMs: Date.now() - startTime,
    };
  }

  const model = resolveModel(policy.modelName);
  if (!model) {
    return {
      modelName: policy.modelName,
      action: policy.action,
      status: "failed",
      recordsAffected: 0,
      durationMs: Date.now() - startTime,
      error: `Unknown model: ${policy.modelName}`,
    };
  }

  if (policy.retentionDays <= 0) {
    return {
      modelName: policy.modelName,
      action: policy.action,
      status: "skipped",
      recordsAffected: 0,
      durationMs: Date.now() - startTime,
    };
  }

  try {
    const cutoff = getCutoffDate(policy.retentionDays);
    const expiredRecords = await getExpiredRecords(model, cutoff);

    if (expiredRecords.length === 0) {
      return {
        modelName: policy.modelName,
        action: policy.action,
        status: "completed",
        recordsAffected: 0,
        durationMs: Date.now() - startTime,
      };
    }

    const recordsToProcess: { id: string; createdAt: Date }[] = [];
    const skippedIds: string[] = [];

    for (const record of expiredRecords) {
      const onHold = await isRecordOnHold(policy.modelName, record.id);
      if (onHold) {
        skippedIds.push(record.id);
      } else {
        recordsToProcess.push(record);
      }
    }

    if (recordsToProcess.length === 0) {
      return {
        modelName: policy.modelName,
        action: policy.action,
        status: "completed",
        recordsAffected: 0,
        durationMs: Date.now() - startTime,
      };
    }

    if (policy.action === "delete" && !canPerformHardDeleteOnModel(policy.modelName)) {
      return {
        modelName: policy.modelName,
        action: policy.action,
        status: "skipped",
        recordsAffected: 0,
        durationMs: Date.now() - startTime,
        error: `Model ${policy.modelName} cannot be hard-deleted`,
      };
    }

    const recordIds = recordsToProcess.map((r) => r.id);

    if (policy.action === "anonymize") {
      const anonymizedCount = await applySoftDelete(policy.modelName, recordIds, cutoff);
      const label = getModelLabel(policy.modelName);

      await writePlatformAuditLog({
        productKey: "platform",
        action: "retention.anonymize",
        targetType: policy.modelName,
        targetLabel: label,
        severity: "info",
        metadata: {
          retentionDays: policy.retentionDays,
          recordsAffected: anonymizedCount,
          skippedDueToHolds: skippedIds.length,
        },
      });

      return {
        modelName: policy.modelName,
        action: policy.action,
        status: "completed",
        recordsAffected: anonymizedCount,
        durationMs: Date.now() - startTime,
      };
    }

    if (policy.action === "archive") {
      const archivedCount = await applySoftDelete(policy.modelName, recordIds, cutoff);
      const label = getModelLabel(policy.modelName);

      await writePlatformAuditLog({
        productKey: "platform",
        action: "retention.archive",
        targetType: policy.modelName,
        targetLabel: label,
        severity: "info",
        metadata: {
          retentionDays: policy.retentionDays,
          recordsAffected: archivedCount,
          skippedDueToHolds: skippedIds.length,
        },
      });

      return {
        modelName: policy.modelName,
        action: policy.action,
        status: "completed",
        recordsAffected: archivedCount,
        durationMs: Date.now() - startTime,
      };
    }

    const deletedCount = await applySoftDelete(policy.modelName, recordIds, cutoff);
    const label = getModelLabel(policy.modelName);

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.delete",
      targetType: policy.modelName,
      targetLabel: label,
      severity: "info",
      metadata: {
        retentionDays: policy.retentionDays,
        recordsAffected: deletedCount,
        skippedDueToHolds: skippedIds.length,
      },
    });

    return {
      modelName: policy.modelName,
      action: policy.action,
      status: "completed",
      recordsAffected: deletedCount,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      modelName: policy.modelName,
      action: policy.action,
      status: "failed",
      recordsAffected: 0,
      durationMs: Date.now() - startTime,
      error: message,
    };
  }
}

export async function runScheduledRetention(organizationId?: string): Promise<{
  jobs: RetentionJob[];
  totalAffected: number;
  durationMs: number;
}> {
  const startTime = Date.now();
  const policies = getAllPolicies(organizationId);
  const jobs: RetentionJob[] = [];
  let totalAffected = 0;

  for (const policy of policies) {
    const result = await applyRetention(policy);
    totalAffected += result.recordsAffected;

    jobs.push({
      id: crypto.randomUUID(),
      policyId: policy.modelName,
      modelName: policy.modelName,
      recordsAffected: result.recordsAffected,
      status: result.status === "completed" ? "completed" : result.status === "failed" ? "failed" : "completed",
      action: policy.action,
      startedAt: new Date(startTime),
      completedAt: new Date(),
      error: result.error,
      organizationId,
    });
  }

  return {
    jobs,
    totalAffected,
    durationMs: Date.now() - startTime,
  };
}

export async function dryRun(policy?: RetentionPolicy, organizationId?: string): Promise<RetentionDryRunResult[]> {
  const results: RetentionDryRunResult[] = [];
  const policies = policy ? [policy] : getAllPolicies(organizationId);

  for (const p of policies) {
    if (!p.enabled || p.retentionDays <= 0) continue;

    const model = resolveModel(p.modelName);
    if (!model) continue;

    try {
      const cutoff = getCutoffDate(p.retentionDays);
      const expiredRecords = await getExpiredRecords(model, cutoff);

      const recordsNotOnHold: { id: string; createdAt: Date }[] = [];
      for (const record of expiredRecords) {
        const onHold = await isRecordOnHold(p.modelName, record.id);
        if (!onHold) {
          recordsNotOnHold.push(record);
        }
      }

      results.push({
        modelName: p.modelName,
        action: p.action,
        recordsFound: recordsNotOnHold.length,
        sampleRecordIds: recordsNotOnHold.slice(0, 5).map((r) => r.id),
        retentionDays: p.retentionDays,
      });
    } catch {
      results.push({
        modelName: p.modelName,
        action: p.action,
        recordsFound: 0,
        sampleRecordIds: [],
        retentionDays: p.retentionDays,
      });
    }
  }

  return results;
}

export async function applyRetentionDryRun(
  policy: RetentionPolicy,
): Promise<RetentionRunResult> {
  return {
    modelName: policy.modelName,
    action: policy.action,
    status: "dry_run",
    recordsAffected: 0,
    durationMs: 0,
  };
}
