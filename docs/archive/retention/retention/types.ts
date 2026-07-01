export type RetentionAction = "delete" | "archive" | "anonymize";

export interface RetentionPolicy {
  modelName: string;
  retentionDays: number;
  action: RetentionAction;
  enabled: boolean;
  notifyBeforeDelete?: boolean;
  organizationId?: string;
  overridden?: boolean;
}

export interface RetentionJob {
  id: string;
  policyId: string;
  modelName: string;
  recordsAffected: number;
  status: "running" | "completed" | "failed" | "dry_run";
  action: RetentionAction;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  organizationId?: string;
}

export interface RetentionHold {
  id: string;
  recordType: string;
  recordId: string;
  reason: string;
  createdById?: string;
  createdAt: Date;
  organizationId?: string;
}

export interface RetentionSchedule {
  enabled: boolean;
  cronExpression: string;
  lastRunAt?: Date;
}

export interface RetentionDryRunResult {
  modelName: string;
  action: RetentionAction;
  recordsFound: number;
  sampleRecordIds: string[];
  retentionDays: number;
}

export interface RetentionRunResult {
  modelName: string;
  action: RetentionAction;
  status: "completed" | "failed" | "skipped" | "dry_run";
  recordsAffected: number;
  durationMs: number;
  error?: string;
}
