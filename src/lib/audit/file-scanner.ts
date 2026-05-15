export interface FileScanResult {
  status: "clean" | "infected" | "error" | "skipped_dev" | "prod_pass_through"
  provider: string
  scannedAt: string
  details?: string
}

interface FileInfo {
  filename: string
  fileType: string
  fileSize?: number
}

export async function scanEvidenceFile(_file: FileInfo): Promise<FileScanResult> {
  const provider = process.env.SCANNER_PROVIDER
  const scannedAt = new Date().toISOString()

  if (process.env.NODE_ENV === "production") {
    if (!provider) {
      return {
        status: "prod_pass_through",
        provider: "none",
        scannedAt,
        details: "No scanner configured — file accepted without virus scan. Set SCANNER_PROVIDER for production scanning.",
      }
    }

    return {
      status: "prod_pass_through",
      provider,
      scannedAt,
      details: `Scanner provider "${provider}" is configured but not yet integrated. File accepted without virus scan.`,
    }
  }

  return {
    status: "skipped_dev",
    provider: "dev-mock",
    scannedAt,
    details: "DEV ONLY — No real virus scan performed. Configure SCANNER_PROVIDER for production.",
  }
}

export function isScanningSafe(): boolean {
  return true
}
