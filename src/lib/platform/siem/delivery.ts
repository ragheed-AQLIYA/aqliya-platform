// ─── SIEM Delivery Channels ───

import { writeFile } from "node:fs/promises";
import { createLogger } from "@/lib/observability/logger";
import { join, resolve } from "node:path";
import { getStorageProvider } from "@/lib/platform/storage";
import { safeFetchJson } from "@/lib/security/ssrf";


const logger = createLogger({ product: "platform", action: "unknown" });

export interface DeliveryResult {
  ok: boolean;
  error?: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff(
  fn: () => Promise<Response>,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fn();
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < MAX_RETRIES) {
      await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
    }
  }
  throw lastError ?? new Error("Delivery failed after retries");
}

/**
 * Deliver SIEM data to an HTTP/S endpoint via POST.
 */
export async function deliverToHttp(
  url: string,
  data: string,
  headers?: Record<string, string>,
): Promise<DeliveryResult> {
  try {
    await retryWithBackoff(() =>
      safeFetchJson(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: data,
        timeoutMs: 30000,
      }),
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("[SIEM]HTTP delivery failed: ${message}");
    return { ok: false, error: message };
  }
}

/**
 * Deliver events to Splunk HTTP Event Collector.
 */
export async function deliverToSplunk(
  hecUrl: string,
  token: string,
  data: string,
): Promise<DeliveryResult> {
  try {
    await retryWithBackoff(() =>
      safeFetchJson(hecUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Splunk ${token}`,
        },
        body: data,
        timeoutMs: 30000,
      }),
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("[SIEM]Splunk HEC delivery failed: ${message}");
    return { ok: false, error: message };
  }
}

/**
 * Deliver SIEM data to a local file (dev/debug).
 */
export async function deliverToFile(
  data: string,
  filePath: string,
): Promise<DeliveryResult> {
  try {
    const allowedRoot = resolve(process.env.SIEM_EXPORT_DIR ?? join(process.cwd(), "uploads", "siem"));
    const resolved = resolve(filePath);
    if (resolved !== allowedRoot && !resolved.startsWith(allowedRoot + "\\") && !resolved.startsWith(allowedRoot + "/")) {
      return { ok: false, error: "SIEM file path is outside the allowed export directory" };
    }
    await writeFile(resolved, data, "utf-8");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("[SIEM]File delivery failed: ${message}");
    return { ok: false, error: message };
  }
}

/**
 * Deliver SIEM data to S3-compatible storage.
 * Uses the existing storage provider infrastructure.
 */
export async function deliverToS3(
  data: string,
  key: string,
): Promise<DeliveryResult> {
  try {
    const provider = getStorageProvider();
    await provider.store(key, {
      filename: key,
      mimeType: "application/json",
      content: Buffer.from(data, "utf-8"),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("[SIEM]S3 delivery failed: ${message}");
    return { ok: false, error: message };
  }
}
