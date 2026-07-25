/**
 * SalesOS Webhook Event Handlers
 *
 * Automatically processes inbound webhook events from
 * SmartLead and Apollo, updating SalesOS deals in real-time.
 *
 * Called by: src/lib/sales/intelligence/webhook/receiver.ts
 */
import "server-only";
import { createLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { registerWebhookHandler, convertToOutreachEvent } from "@/lib/sales/intelligence/webhook/receiver";
import type { WebhookEventPayload } from "@/lib/sales/intelligence/webhook/receiver";
import type { Prisma } from "@prisma/client";


const logger = createLogger({ product: "platform", action: "unknown" });

// ── SmartLead: Email replied → Update deal stage ──

registerWebhookHandler("smartlead", "EMAIL_REPLIED", async (event) => {
  const outreachEvent = convertToOutreachEvent(event);
  if (!outreachEvent) return;

  // Find the deal linked to this campaign/contact
  const contact = await prisma.salesContact.findFirst({
    where: { email: outreachEvent.contactId },
    select: { id: true, accountId: true },
  });

  if (contact?.accountId) {
    // Find active deals for this account
    const deals = await prisma.salesDeal.findMany({
      where: {
        accountId: contact.accountId,
        status: { in: ["open", "qualified"] },
      },
      select: { id: true, pipelineStage: true },
      take: 1,
    });

    if (deals.length > 0) {
      const deal = deals[0];
      // Progress deal to next stage when contact replies
      await prisma.salesDeal.update({
        where: { id: deal.id },
        data: {
          pipelineStage: "negotiation",
          metadata: {
            lastOutreachEvent: "replied",
            repliedAt: new Date().toISOString(),
            sourceEvent: outreachEvent.id,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      await writePlatformAuditLog({
        productKey: "salesos",
        action: "deal.stage_advanced.via_outreach_reply",
        platformOrganizationId: "system",
        organizationId: contact.accountId,
        actorId: "system",
        actorName: "SmartLead Webhook",
        targetType: "SalesDeal",
        targetId: deal.id,
        metadata: {
          previousStage: deal.pipelineStage,
          newStage: "negotiation",
          eventId: outreachEvent.id,
          campaignId: outreachEvent.campaignId,
        } as Record<string, unknown>,
      });
    }
  }
});

// ── SmartLead: Meeting booked → Mark deal as qualified ──

registerWebhookHandler("smartlead", "MEETING_BOOKED", async (event) => {
  const outreachEvent = convertToOutreachEvent(event);
  if (!outreachEvent) return;

  const contact = await prisma.salesContact.findFirst({
    where: { email: outreachEvent.contactId },
    select: { id: true, accountId: true },
  });

  if (contact?.accountId) {
    const deals = await prisma.salesDeal.findMany({
      where: {
        accountId: contact.accountId,
        status: { in: ["open", "qualified", "negotiation"] },
      },
      select: { id: true },
      take: 1,
    });

    if (deals.length > 0) {
      await prisma.salesDeal.update({
        where: { id: deals[0].id },
        data: { status: "qualified" },
      });

      await writePlatformAuditLog({
        productKey: "salesos",
        action: "deal.qualified.via_meeting_booked",
        platformOrganizationId: "system",
        organizationId: contact.accountId,
        actorId: "system",
        actorName: "SmartLead Webhook",
        targetType: "SalesDeal",
        targetId: deals[0].id,
        metadata: {
          eventId: outreachEvent.id,
          campaignId: outreachEvent.campaignId,
        } as Record<string, unknown>,
      });
    }
  }
});

// ── SmartLead: Email bounced → Flag deal risk ──

registerWebhookHandler("smartlead", "EMAIL_BOUNCED", async (event) => {
  const outreachEvent = convertToOutreachEvent(event);
  if (!outreachEvent) return;

  const contact = await prisma.salesContact.findFirst({
    where: { email: outreachEvent.contactId },
    select: { id: true, accountId: true },
  });

  if (contact?.accountId) {
    await writePlatformAuditLog({
      productKey: "salesos",
      action: "outreach.bounced",
      platformOrganizationId: "system",
      organizationId: contact.accountId,
      actorId: "system",
      actorName: "SmartLead Webhook",
      targetType: "SalesContact",
      targetId: contact.id,
      metadata: {
        eventId: outreachEvent.id,
        campaignId: outreachEvent.campaignId,
        warning: "Contact email bounced — verify or update contact info",
      } as Record<string, unknown>,
    });
  }
});

// ── Apollo: Email opened → Log engagement ──

registerWebhookHandler("apollo", "email_opened", async (event) => {
  const outreachEvent = convertToOutreachEvent(event);
  if (!outreachEvent) return;

  await prisma.platformAuditLog.create({
    data: {
      platformOrganizationId: "system",
      productKey: "salesos",
      actorId: "system",
      actorName: "Apollo Webhook",
      action: "outreach.email_opened",
      targetType: "OutreachEvent",
      targetId: outreachEvent.id,
      metadata: {
        campaignId: outreachEvent.campaignId,
        contactId: outreachEvent.contactId,
      } as Prisma.InputJsonValue,
    },
  });
});

// ── Generic: Log all events for audit ──

registerWebhookHandler("apollo", "*", async (event) => {
  await prisma.platformAuditLog.create({
    data: {
      platformOrganizationId: "system",
      productKey: "salesos",
      actorId: "system",
      actorName: `webhook-${event.providerId}`,
      action: `outreach.${event.eventType}`,
      targetType: "WebhookEvent",
      targetId: event.eventId,
      metadata: {
        providerId: event.providerId,
        eventType: event.eventType,
        signatureValid: event.signatureValid,
      } as Prisma.InputJsonValue,
    },
  });
});

registerWebhookHandler("smartlead", "*", async (event) => {
  await prisma.platformAuditLog.create({
    data: {
      platformOrganizationId: "system",
      productKey: "salesos",
      actorId: "system",
      actorName: `webhook-${event.providerId}`,
      action: `outreach.${event.eventType}`,
      targetType: "WebhookEvent",
      targetId: event.eventId,
      metadata: {
        providerId: event.providerId,
        eventType: event.eventType,
        signatureValid: event.signatureValid,
      } as Prisma.InputJsonValue,
    },
  });
});

logger.info("[SalesOS]Webhook handlers registered: SmartLead (EMAIL_REPLIED, MEETING_BOOKED, EMAIL_BOUNCED, *), Apollo (*)");
