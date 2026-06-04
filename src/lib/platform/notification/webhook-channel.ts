import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { DeliveryResult } from "./types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expected = signPayload(payload, secret);
    const expectedBuf = Buffer.from(expected, "utf-8");
    const sigBuf = Buffer.from(signature, "utf-8");
    if (expectedBuf.length !== sigBuf.length) return false;
    return timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendWebhook(
  url: string,
  event: string,
  payload: Record<string, unknown>,
  secret?: string,
): Promise<DeliveryResult> {
  const deliveredAt = new Date();

  const body = JSON.stringify({ event, payload, timestamp: deliveredAt.toISOString() });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Event-Type": event,
  };

  if (secret) {
    headers["X-Signature-256"] = signPayload(body, secret);
  }

  let lastError: string | undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        { method: "POST", headers, body },
        10000,
      );

      if (response.ok) {
        return { channel: "webhook", success: true, deliveredAt };
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Webhook request failed";
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }

  console.error(`[Notification][Webhook] Failed after ${MAX_RETRIES} attempts: ${lastError}`);
  return { channel: "webhook", success: false, error: lastError, deliveredAt };
}
