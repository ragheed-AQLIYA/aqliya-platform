export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
];
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];

export function sanitizeFilename(name: string): string {
  const safe = name
    .replace(/\.\./g, "")
    .replace(/[/\\:<>"|?*]/g, "_")
    .trim();
  return safe.length > 200 ? safe.slice(0, 200) : safe;
}

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

export function formatFileError(msg: string): never {
  throw new Error(msg);
}

export interface SafeActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}
