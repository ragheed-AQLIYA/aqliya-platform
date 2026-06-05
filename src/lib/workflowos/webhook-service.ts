import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { Prisma } from "@prisma/client";
import crypto from "node:crypto";

export type WebhookEvent =
  | "record.created"
  | "record.updated"
  | "record.completed"
  | "sla.breached";

export interface WebhookConfig {
  id: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  label: string;
  active: boolean;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode: number | null;
  error: string | null;
  attempt: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function computeSignature(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");
}

async function sendSingleWebhook(
  url: string,
  payload: Record<string, unknown>,
  secret?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "AQLIYA-WorkflowOS-Webhook/1.0",
  };

  const body = JSON.stringify(payload);

  if (secret) {
    const signature = computeSignature(body, secret);
    headers["X-Aqliya-Signature"] = `sha256=${signature}`;
    headers["X-Aqliya-Timestamp"] = Math.floor(Date.now() / 1000).toString();
  }

  return fetch(url, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(15000),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendWebhook(
  recordId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
  organizationId: string,
): Promise<WebhookDeliveryResult[]> {
  const configs = await getWebhookConfigs(organizationId);
  const matching = configs.filter(
    (c) => c.active && c.events.includes(event),
  );

  if (matching.length === 0) {
    return [];
  }

  const fullPayload = {
    event,
    recordId,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  const results: WebhookDeliveryResult[] = [];

  for (const config of matching) {
    let lastResult: WebhookDeliveryResult | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await sendSingleWebhook(config.url, fullPayload, config.secret);
        const statusCode = response.status;

        if (response.ok) {
          lastResult = {
            success: true,
            statusCode,
            error: null,
            attempt,
          };
          break;
        }

        lastResult = {
          success: false,
          statusCode,
          error: `HTTP ${statusCode}`,
          attempt,
        };

        if (attempt < MAX_RETRIES) {
          await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        lastResult = {
          success: false,
          statusCode: null,
          error: errorMessage,
          attempt,
        };

        if (attempt < MAX_RETRIES) {
          await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
        }
      }
    }

    if (lastResult) {
      results.push(lastResult);
    }

    await writePlatformAuditLog({
      productKey: "workflowos",
      action: `webhook_${event.replace(".", "_")}`,
      targetType: "webhook",
      targetId: config.id,
      targetLabel: config.label,
      platformOrganizationId: organizationId,
      metadata: {
        webhookUrl: config.url,
        event,
        recordId,
        success: lastResult?.success ?? false,
        attempts: lastResult?.attempt ?? MAX_RETRIES,
      },
    });
  }

  return results;
}

export async function getWebhookConfigs(
  organizationId: string,
): Promise<WebhookConfig[]> {
  const org = await prisma.platformOrganization.findUnique({
    where: { id: organizationId },
    select: { metadata: true },
  });
  if (!org?.metadata) return [];

  const meta = org.metadata as Record<string, unknown>;
  const webhooks = meta.workflowWebhooks;
  if (!Array.isArray(webhooks)) return [];
  return webhooks as WebhookConfig[];
}

export async function saveWebhookConfigs(
  organizationId: string,
  configs: WebhookConfig[],
): Promise<void> {
  const org = await prisma.platformOrganization.findUnique({
    where: { id: organizationId },
    select: { metadata: true },
  });

  const metadata = (org?.metadata as Record<string, unknown>) ?? {};
  metadata.workflowWebhooks = configs;

  await prisma.platformOrganization.update({
    where: { id: organizationId },
    data: { metadata: metadata as Prisma.InputJsonValue },
  });
}
