import "server-only";

import { pingClamAv, scanBufferWithClamAv } from "@/lib/audit/clamav-client";

export interface FileScanResult {
  status: "clean" | "infected" | "error" | "skipped_dev";
  provider: string;
  scannedAt: string;
  details?: string;
}

export interface FileInfo {
  filename: string;
  fileType: string;
  fileSize?: number;
  content?: Buffer;
}

export function isScanRejected(result: FileScanResult): boolean {
  return result.status === "infected" || result.status === "error";
}

export function isScanningSafe(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return Boolean(process.env.SCANNER_PROVIDER);
}

export async function scanEvidenceFile(file: FileInfo): Promise<FileScanResult> {
  const scannedAt = new Date().toISOString();
  const provider = process.env.SCANNER_PROVIDER?.trim().toLowerCase() ?? "";

  if (process.env.NODE_ENV !== "production") {
    return {
      status: "skipped_dev",
      provider: "dev-mock",
      scannedAt,
      details:
        "DEV ONLY — No real virus scan performed. Configure SCANNER_PROVIDER for production.",
    };
  }

  if (!provider) {
    return {
      status: "error",
      provider: "none",
      scannedAt,
      details:
        "File scanning is not configured. Upload blocked for production safety. Set SCANNER_PROVIDER.",
    };
  }

  if (provider === "clamav") {
    if (file.content && file.content.length > 0) {
      const scan = await scanBufferWithClamAv(file.content);
      if (!scan.ok) {
        return {
          status: "error",
          provider: "clamav",
          scannedAt,
          details: scan.message,
        };
      }
      if (scan.infected) {
        return {
          status: "infected",
          provider: "clamav",
          scannedAt,
          details: scan.message,
        };
      }
      return {
        status: "clean",
        provider: "clamav",
        scannedAt,
        details: scan.message,
      };
    }

    const ping = await pingClamAv();
    if (!ping.ok) {
      return {
        status: "error",
        provider: "clamav",
        scannedAt,
        details: ping.message,
      };
    }

    return {
      status: "clean",
      provider: "clamav",
      scannedAt,
      details:
        "ClamAV reachable; metadata-only evidence (no file bytes to scan).",
    };
  }

  return {
    status: "error",
    provider,
    scannedAt,
    details: `Scanner provider "${provider}" is not supported. Supported: clamav.`,
  };
}
