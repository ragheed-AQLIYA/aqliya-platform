/**
 * Webhook Receiver Framework — generic inbound webhook handler
 *
 * Supports: Apollo, SmartLead, HubSpot, and custom providers.
 * Features: signature verification, event routing, audit logging, retry queue.
 */
import "server-only";
import { createLogger } from "@/lib/observability/logger";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import type { OutreachEvent } from "../types";
import type { Prisma } from "@prisma/client";

export type WebhookProvider = "apollo" | "smartlead" | "hubspot" | "custom";

export interface WebhookConfig {
  providerId: WebhookProvider;
  webhookSecret: string;
  enabled: boolean;
  organizationId: string;
}

export interface WebhookEventPayload {
  providerId: WebhookProvider;
  eventId: string;
  eventType: string;
  organizationId: string;
  rawBody: Record<string, unknown>;
  headers: Record<string, string>;
  receivedAt: Date;
  signature: string;
  signatureValid: boolean;
}

// ── Signature Verification ──

export function verifySignature(
  body: string,
  signature: string,
  secret: string,
  providerId: WebhookProvider,
): boolean {
  try {
    switch (providerId) {
      case "hubspot":
      case "smartlead":
      case "apollo": {
        // HMAC-SHA256 verification
        const computed = createHmac("sha256", secret)
          .update(body)
          .digest("hex");
        const sigBuf = Buffer.from(signature, "hex");
        const compBuf = Buffer.from(computed, "hex");
        if (sigBuf.length !== compBuf.length) return false;
        return timingSafeEqual(sigBuf, compBuf);
      }
      default:
        // Simple HMAC
        const hmac = createHmac("sha256", secret)
          .update(body)
          .digest("hex");
        const sigBuf = Buffer.from(signature, "hex");
        const compBuf = Buffer.from(hmac, "hex");
        if (sigBuf.length !== compBuf.length) return false;
        return timingSafeEqual(sigBuf, compBuf);
    }
  } catch {
    return false;
  }
}

// ── Event Router Registry ──

type EventHandler = (event: WebhookEventPayload) => Promise<void>;

const eventHandlers = new Map<string, EventHandler[]>();

export function registerWebhookHandler(
  providerId: WebhookProvider,
  eventType: string,
  handler: EventHandler,
): void {
  const key = `${providerId}:${eventType}`;
  const handlers = eventHandlers.get(key) ?? [];
  handlers.push(handler);
  eventHandlers.set(key, handlers);
}

export function registerWildcardHandler(
  providerId: WebhookProvider,
  handler: EventHandler,
): void {
  const key = `${providerId}:*`;
  const handlers = eventHandlers.get(key) ?? [];
  handlers.push(handler);
  eventHandlers.set(key, handlers);
}

// ── Main Receiver ──

export async function receiveWebhook(
  config: WebhookConfig,
  body: string,
  signature: string,
  headers: Record<string, string>,
): Promise<{ accepted: boolean; eventId: string; error?: string }> {
  if (!config.enabled) {
    return { accepted: false, eventId: "", error: "Webhook disabled" };
  }

  // Verify signature
  const valid = verifySignature(
    body,
    signature,
    config.webhookSecret,
    config.providerId,
  );

  const payload: WebhookEventPayload = {
    providerId: config.providerId,
    eventId: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: "",
    organizationId: config.organizationId,
    rawBody: {},
    headers,
    receivedAt: new Date(),
    signature,
    signatureValid: valid,
  };

  try {
    payload.rawBody = JSON.parse(body);
    payload.eventType =
      (payload.rawBody.event_type as string) ??
      (payload.rawBody.type as string) ??
      "unknown";
  } catch {
    return { accepted: false, eventId: payload.eventId, error: "Invalid JSON body" };
  }

  // Log receipt
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: config.organizationId,
        productKey: "salesos",
        actorName: `webhook-${config.providerId}`,
        action: `webhook.received.${payload.eventType}`,
        targetType: "WebhookEvent",
        targetId: payload.eventId,
        metadata: {
          providerId: config.providerId,
          eventType: payload.eventType,
          signatureValid: valid,
        } as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Non-blocking
  }

  if (!valid) {
    return {
      accepted: false,
      eventId: payload.eventId,
      error: "Invalid signature",
    };
  }

  // Route to handlers
  const exactKey = `${config.providerId}:${payload.eventType}`;
  const wildKey = `${config.providerId}:*`;
  const handlers = [
    ...(eventHandlers.get(exactKey) ?? []),
    ...(eventHandlers.get(wildKey) ?? []),
  ];

  for (const handler of handlers) {
    try {
      await handler(payload);
    } catch (err) {
      logger.error(`[Webhook] Handler failed for ${exactKey}:`, err instanceof Error ? err : new Error(String(err)));
    }
  }

  return { accepted: true, eventId: payload.eventId };
}

// ── Outreach Event Converter ──

import { SmartLeadConnector } from "../smartlead/smartlead-connector";


const logger = createLogger({ product: "platform", action: "lib-sales-intelligence-webhook-receiver" });

export function convertToOutreachEvent(
  payload: WebhookEventPayload,
): OutreachEvent | null {
  try {
    switch (payload.providerId) {
      case "smartlead":
        return SmartLeadConnector.processWebhookEvent(payload.rawBody);
      case "apollo":
        return {
          id: payload.eventId,
          campaignId: (payload.rawBody.sequence_id as string) ?? "",
          contactId: (payload.rawBody.contact_id as string) ?? "",
          type: (payload.rawBody.action_type as OutreachEvent["type"]) ?? "sent",
          occurredAt: new Date(),
          metadata: payload.rawBody as Record<string, unknown>,
        };
      default:
        return {
          id: payload.eventId,
          campaignId: "",
          contactId: "",
          type: "sent",
          occurredAt: new Date(),
        };
    }
  } catch {
    return null;
  }
}
