export type Policy = {
  modelName: string;
  retentionDays: number;
  action: "delete" | "archive" | "anonymize";
  enabled: boolean;
  notifyBeforeDelete?: boolean;
  overridden?: boolean;
};

export type DryRunResult = {
  modelName: string;
  action: string;
  recordsFound: number;
  sampleRecordIds: string[];
  retentionDays: number;
};

export type RunHistory = {
  id: string;
  startedAt: string;
  completedAt: string;
  totalAffected: number;
  durationMs: number;
  triggeredBy: string;
};

export type Hold = {
  id: string;
  recordType: string;
  recordId: string;
  reason: string;
  createdById?: string;
  createdAt: string;
};
