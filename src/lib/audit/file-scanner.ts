// ─── AuditOS File Scanner ───
// Scans evidence files for malware before they are accepted.
// Current implementation: metadata-only (no file bytes stored).
// Production: fail-closed unless a scanner provider is configured.

export interface FileScanResult {
  status: "clean" | "infected" | "error" | "skipped_dev"
  provider: string
  scannedAt: string
  details?: string
}

interface FileInfo {
  filename: string
  fileType: string
  fileSize?: number
}

/**
 * Scan an evidence file for malware.
 *
 * Development behavior:
 * - Returns mock clean result (DEV ONLY — no real scan performed)
 * - The result is labeled as "skipped_dev" to make the limitation visible
 *
 * Production behavior:
 * - Rejects ALL uploads unless a SCANNER_PROVIDER is configured
 * - If SCANNER_PROVIDER is set but not supported, returns error
 * - Production NEVER returns "clean" without a real scanner
 */
export async function scanEvidenceFile(file: FileInfo): Promise<FileScanResult> {
  const provider = process.env.SCANNER_PROVIDER
  const scannedAt = new Date().toISOString()

  if (process.env.NODE_ENV === "production") {
    if (!provider) {
      return {
        status: "error",
        provider: "none",
        scannedAt,
        details: "File scanning is not configured. Upload blocked for production safety.",
      }
    }

    // Future: real scanner integration goes here
    return {
      status: "error",
      provider: provider,
      scannedAt,
      details: `Scanner provider "${provider}" is not integrated yet.`,
    }
  }

  // Development mode: mock clean result
  return {
    status: "skipped_dev",
    provider: "dev-mock",
    scannedAt,
    details: "DEV ONLY — No real virus scan performed. Configure SCANNER_PROVIDER for production.",
  }
}

/**
 * Check if file scanning is safe for the current environment.
 * In production, scanning must be configured and operational.
 * In development, mock scanning is acceptable.
 */
export function isScanningSafe(): boolean {
  if (process.env.NODE_ENV === "production") {
    return !!process.env.SCANNER_PROVIDER
  }
  return true // dev mode allows mock scanning
}
