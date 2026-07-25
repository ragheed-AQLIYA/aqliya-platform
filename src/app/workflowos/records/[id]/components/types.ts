export interface RecordWithTemplate {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: string;
  currentStep: number;
  steps: unknown;
  stepResults: unknown;
  assignedToId: string | null;
  priority: string;
  dueDate: string | Date | null;
  completedAt: string | Date | null;
  metadata: unknown;
  createdById: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  exportStatus: string;
  exportRejectedReason: string | null;
  escalatedAt: string | Date | null;
  template: { name: string; steps: unknown } | null;
}

export interface EvidenceItem {
  id: string;
  organizationId: string;
  recordId: string;
  stepIndex: number | null;
  filename: string;
  fileType: string;
  storageKey: string | null;
  description: string | null;
  sizeBytes: number | null;
  createdAt: string | Date;
}

export interface AuditEventItem {
  id: string;
  organizationId: string;
  recordId: string;
  actorId: string;
  actorName: string | null;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  comment: string | null;
  createdAt: string | Date;
}

export type SlaInfo = {
  status: "on_track" | "approaching" | "overdue" | "breached";
  remainingMinutes: number | null;
  stepLabel: string;
} | null;

export type ExportDownloadData = {
  content: string;
  filename: string;
  mimeType: string;
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};
