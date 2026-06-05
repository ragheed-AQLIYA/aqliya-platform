// ─── SIEM Export System Types ───

export type SiemFormat = "json" | "syslog" | "cef" | "splunk-hec";

export const VALID_SIEM_FORMATS: SiemFormat[] = [
  "json",
  "syslog",
  "cef",
  "splunk-hec",
];

export interface SiemDestination {
  id: string;
  organizationId: string;
  label: string;
  type: "http" | "splunk-hec" | "file" | "s3";
  url?: string;
  token?: string;
  format: SiemFormat;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiemExportConfig {
  id: string;
  organizationId: string;
  label: string;
  destinationId: string;
  format: SiemFormat;
  schedule: "manual" | "hourly" | "daily" | "weekly" | "custom";
  cronExpression?: string;
  filters?: SiemExportFilters;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiemExportFilters {
  productKey?: string;
  action?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  actorId?: string;
  targetType?: string;
}

export type SiemExportStatus = "pending" | "in_progress" | "completed" | "failed";

export interface SiemExportJob {
  id: string;
  organizationId: string;
  destinationId?: string;
  configId?: string;
  status: SiemExportStatus;
  format: SiemFormat;
  totalEvents: number;
  exportedAt: string;
  error?: string;
  initiatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiemExportOptions {
  organizationId: string;
  format: SiemFormat;
  destination?: SiemDestination;
  filters?: SiemExportFilters;
  initiatedBy?: string;
}

export interface SiemExportResult {
  ok: boolean;
  jobId?: string;
  totalEvents: number;
  error?: string;
}
