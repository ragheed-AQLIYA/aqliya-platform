// ─── Core DownloadService ───
// Thin response builder for download/export routes.
// Standardizes security headers and filename handling.
// No auth, no business logic, no audit — just response construction.

import { NextResponse } from "next/server";

export interface DownloadResponseInput {
  content: Buffer | Uint8Array | string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  cacheControl?: string;
}

/**
 * Build a NextResponse for file download with consistent security headers.
 * - Content-Disposition with safe filename (removes HTTP header injection chars)
 * - X-Content-Type-Options: nosniff
 * - Cache-Control: private, no-store (overridable)
 */
export function buildDownloadResponse(
  input: DownloadResponseInput,
): NextResponse {
  const body: BodyInit =
    typeof input.content === "string"
      ? input.content
      : new Uint8Array(input.content);

  const headers: Record<string, string> = {
    "Content-Type": input.mimeType,
    "Content-Disposition": `attachment; filename="${sanitizeFilename(input.filename)}"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": input.cacheControl ?? "private, no-store",
  };

  if (input.sizeBytes !== undefined) {
    headers["Content-Length"] = String(input.sizeBytes);
  }

  return new NextResponse(body, { status: 200, headers });
}

/**
 * Sanitize a filename for safe use in Content-Disposition header.
 * Removes double quotes (") and CR/LF characters to prevent HTTP header injection.
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/["\r\n]/g, "_");
}
