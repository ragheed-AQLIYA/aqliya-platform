import { auditLogger, Product } from "@/lib/platform/audit-logger";

export const alog = auditLogger({ productKey: Product.OFFICE_AI_ASSISTANT });

export const VALID_TASK_TYPES = [
  "excel_analysis",
  "document_summary",
  "report_draft",
  "presentation_outline",
  "executive_summary",
  "meeting_notes",
] as const;

export type OfficeAiTaskType = (typeof VALID_TASK_TYPES)[number];

export const VALID_STATUSES = [
  "draft",
  "generated",
  "needs_review",
  "reviewed",
  "approved",
  "rejected",
  "archived",
] as const;

export type OfficeAiStatus = (typeof VALID_STATUSES)[number];

export const VALID_LANGUAGES = ["ar", "en"] as const;
export type OfficeAiLanguage = (typeof VALID_LANGUAGES)[number];

export interface CreateOfficeAiTaskInput {
  platformOrganizationId: string;
  clientWorkspaceId?: string;
  projectId?: string;
  taskType: string;
  language?: string;
  title?: string;
  instructions?: string;
  createdById?: string;
  createdByName?: string;
}

export interface AddOfficeAiFileInput {
  filename: string;
  fileType: string;
  mimeType?: string;
  storageKey?: string;
  fileHash?: string;
  sizeBytes?: number;
  uploadedById?: string;
  metadata?: Record<string, unknown>;
}

export interface AddOfficeAiOutputInput {
  content: string;
  format?: string;
  aiProvider?: string;
  aiModel?: string;
  aiPromptVersion?: string;
  confidenceScore?: number;
  metadata?: Record<string, unknown>;
}

export function validateRequired(value: unknown, name: string): void {
  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    throw new Error(`OfficeAiTask validation: ${name} is required`);
  }
}

export function validateIn(
  value: string,
  valid: readonly string[],
  name: string,
): void {
  if (!valid.includes(value as never)) {
    throw new Error(
      `OfficeAiTask validation: ${name} must be one of: ${valid.join(", ")}`,
    );
  }
}

export interface OfficeAiTaskResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface OfficeAiTaskListResult {
  success: boolean;
  data?: unknown[];
  error?: string;
}

export interface OfficeAiFileResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface OfficeAiOutputResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
