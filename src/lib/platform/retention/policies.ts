import type { RetentionPolicy } from "./types";

export const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  { modelName: "PlatformAuditLog", retentionDays: 365, action: "delete", enabled: true },
  { modelName: "ScimProvisioningEvent", retentionDays: 90, action: "delete", enabled: true },
  { modelName: "CrmSyncLog", retentionDays: 180, action: "delete", enabled: true },
  { modelName: "ErpSyncLog", retentionDays: 180, action: "delete", enabled: true },
  { modelName: "PlatformNotification", retentionDays: 90, action: "delete", enabled: true },
  { modelName: "Session", retentionDays: 30, action: "delete", enabled: true },
  { modelName: "IngestionDocument", retentionDays: 365, action: "delete", enabled: true },
  { modelName: "IngestionBatch", retentionDays: 365, action: "delete", enabled: true },
  { modelName: "IntelligenceQuery", retentionDays: 90, action: "delete", enabled: true },
  {
    modelName: "Decision",
    retentionDays: 730,
    action: "delete",
    enabled: true,
    notifyBeforeDelete: true,
  },
  {
    modelName: "AuditEngagement",
    retentionDays: 2555,
    action: "archive",
    enabled: true,
  },
  { modelName: "User", retentionDays: 0, action: "archive", enabled: false },
  { modelName: "PlatformSecret", retentionDays: 0, action: "archive", enabled: false },
  { modelName: "LocalContact", retentionDays: 730, action: "archive", enabled: true, notifyBeforeDelete: true },
];

export interface PolicyStoreEntry {
  id: string;
  modelName: string;
  retentionDays: number;
  action: "delete" | "archive" | "anonymize";
  enabled: boolean;
  notifyBeforeDelete: boolean;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const OVERRIDE_STORE: PolicyStoreEntry[] = [];

export function getDefaultPolicies(): RetentionPolicy[] {
  return DEFAULT_RETENTION_POLICIES.map((p) => ({ ...p }));
}

export function getPolicyForModel(modelName: string, organizationId?: string): RetentionPolicy | undefined {
  const override = OVERRIDE_STORE.find(
    (o) => o.modelName === modelName && o.organizationId === (organizationId ?? null),
  );
  if (override) {
    return {
      modelName: override.modelName,
      retentionDays: override.retentionDays,
      action: override.action,
      enabled: override.enabled,
      notifyBeforeDelete: override.notifyBeforeDelete,
      organizationId: override.organizationId ?? undefined,
      overridden: true,
    };
  }
  return DEFAULT_RETENTION_POLICIES.find((p) => p.modelName === modelName);
}

export function getAllPolicies(organizationId?: string): RetentionPolicy[] {
  const result: RetentionPolicy[] = [];
  for (const def of DEFAULT_RETENTION_POLICIES) {
    const override = OVERRIDE_STORE.find(
      (o) => o.modelName === def.modelName && o.organizationId === (organizationId ?? null),
    );
    if (override) {
      result.push({
        ...def,
        retentionDays: override.retentionDays,
        action: override.action,
        enabled: override.enabled,
        notifyBeforeDelete: override.notifyBeforeDelete,
        organizationId: override.organizationId ?? undefined,
        overridden: true,
      });
    } else {
      result.push({ ...def });
    }
  }
  return result;
}

export function setPolicyOverride(override: {
  modelName: string;
  retentionDays: number;
  action: "delete" | "archive" | "anonymize";
  enabled: boolean;
  notifyBeforeDelete: boolean;
  organizationId?: string;
}): PolicyStoreEntry {
  const existingIndex = OVERRIDE_STORE.findIndex(
    (o) => o.modelName === override.modelName && o.organizationId === (override.organizationId ?? null),
  );

  const entry: PolicyStoreEntry = {
    id: existingIndex >= 0 ? OVERRIDE_STORE[existingIndex].id : crypto.randomUUID(),
    modelName: override.modelName,
    retentionDays: override.retentionDays,
    action: override.action,
    enabled: override.enabled,
    notifyBeforeDelete: override.notifyBeforeDelete,
    organizationId: override.organizationId ?? null,
    createdAt: existingIndex >= 0 ? OVERRIDE_STORE[existingIndex].createdAt : new Date(),
    updatedAt: new Date(),
  };

  if (existingIndex >= 0) {
    OVERRIDE_STORE[existingIndex] = entry;
  } else {
    OVERRIDE_STORE.push(entry);
  }

  return entry;
}

export function resetPolicyOverride(modelName: string, organizationId?: string): boolean {
  const index = OVERRIDE_STORE.findIndex(
    (o) => o.modelName === modelName && o.organizationId === (organizationId ?? null),
  );
  if (index >= 0) {
    OVERRIDE_STORE.splice(index, 1);
    return true;
  }
  return false;
}

export function memoizedPolicies(): RetentionPolicy[] {
  return getAllPolicies();
}
