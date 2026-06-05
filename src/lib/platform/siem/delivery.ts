// ─── SIEM Delivery Channels ───

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getStorageProvider } from "@/lib/platform/storage";

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
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: data,
        signal: AbortSignal.timeout(30000),
      }),
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[SIEM] HTTP delivery failed: ${message}`);
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
      fetch(hecUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Splunk ${token}`,
        },
        body: data,
        signal: AbortSignal.timeout(30000),
      }),
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[SIEM] Splunk HEC delivery failed: ${message}`);
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
    await writeFile(filePath, data, "utf-8");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[SIEM] File delivery failed: ${message}`);
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
    console.warn(`[SIEM] S3 delivery failed: ${message}`);
    return { ok: false, error: message };
  }
}
