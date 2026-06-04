import "server-only";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sendEmail } from "./email-channel";
import { sendInApp } from "./in-app-channel";
import { sendWebhook } from "./webhook-channel";
import type {
  NotificationChannel,
  NotificationPayload,
  DeliveryResult,
  NotificationEvent,
  DispatchTarget,
} from "./types";

interface RateLimitBucket {
  sentCount: number;
  windowStart: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getRateLimitPerMin(): number {
  const val = parseInt(process.env.NOTIFICATION_RATE_LIMIT_PER_MIN ?? "60", 10);
  return val > 0 ? val : 60;
}

function checkRateLimit(orgKey: string): boolean {
  const limit = getRateLimitPerMin();
  const now = Date.now();
  const bucket = rateLimitBuckets.get(orgKey);

  if (!bucket || now - bucket.windowStart > 60000) {
    rateLimitBuckets.set(orgKey, { sentCount: 1, windowStart: now });
    return true;
  }

  if (bucket.sentCount >= limit) {
    return false;
  }

  bucket.sentCount++;
  return true;
}

async function loadPreferences(
  recipientId: string,
  notificationType: string,
): Promise<Set<NotificationChannel>> {
  try {
    const prefs = await prisma.userNotificationPreference.findMany({
      where: { userId: recipientId, notificationType, enabled: true },
      select: { channel: true },
    });
    return new Set(prefs.map((p) => p.channel as NotificationChannel));
  } catch {
    return new Set<NotificationChannel>(["in_app"]);
  }
}

async function findOrgWebhooks(
  organizationId: string,
): Promise<{ url: string; secret?: string }[]> {
  try {
    const org = await prisma.platformOrganization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    });
    if (!org?.metadata) return [];
    const meta = org.metadata as Record<string, unknown>;
    const webhooks = meta.webhookUrls;
    if (!Array.isArray(webhooks)) return [];
    return webhooks as { url: string; secret?: string }[];
  } catch {
    return [];
  }
}

function buildPayload(
  event: NotificationEvent,
  type: string,
  subject: string,
  body: string,
  target: DispatchTarget,
  metadata?: Record<string, unknown>,
): NotificationPayload {
  return {
    type,
    subject,
    body,
    channel: "in_app",
    severity: "info",
    recipientId: target.recipientId,
    recipientEmail: target.recipientEmail,
    organizationId: target.organizationId,
    metadata: { ...metadata, event },
  };
}

export async function dispatch(
  event: NotificationEvent,
  target: DispatchTarget,
  data: {
    type: string;
    subjectAr: string;
    bodyAr: string;
    subjectEn: string;
    bodyEn: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  },
  preferredChannels?: NotificationChannel[],
): Promise<DeliveryResult[]> {
  const results: DeliveryResult[] = [];
  const defaultChannels: NotificationChannel[] = ["in_app"];
  const channels = preferredChannels ?? defaultChannels;

  const userPrefs = await loadPreferences(target.recipientId, data.type);

  for (const channel of channels) {
    if (!userPrefs.has(channel) && channel !== "in_app") continue;

    const payload = buildPayload(
      event,
      data.type,
      data.subjectAr,
      data.bodyAr,
      target,
      data.metadata,
    );
    payload.channel = channel;

    switch (channel) {
      case "email": {
        if (!target.recipientEmail) {
          results.push({
            channel: "email",
            success: false,
            error: "No recipient email",
            deliveredAt: new Date(),
          });
          continue;
        }

        const orgKey = target.organizationId ?? "default";
        if (!checkRateLimit(orgKey)) {
          const fallback = await sendInApp({ ...payload, channel: "in_app" });
          results.push(fallback);
          continue;
        }

        const emailResult = await sendEmail({
          recipientEmail: target.recipientEmail,
          subject: data.subjectAr,
          body: data.bodyAr,
        });
        results.push(emailResult);

        if (!emailResult.success) {
          const fallback = await sendInApp({ ...payload, channel: "in_app" });
          results.push(fallback);
        }
        break;
      }
      case "webhook": {
        if (!target.organizationId) {
          results.push({
            channel: "webhook",
            success: false,
            error: "No organization for webhook dispatch",
            deliveredAt: new Date(),
          });
          continue;
        }
        const webhooks = await findOrgWebhooks(target.organizationId);
        for (const wh of webhooks) {
          const whResult = await sendWebhook(wh.url, event, {
            type: data.type,
            recipientId: target.recipientId,
            subject: data.subjectAr,
            body: data.bodyAr,
            ...data.metadata,
          }, wh.secret);
          results.push(whResult);
        }
        break;
      }
      case "in_app":
      default: {
        const inAppResult = await sendInApp(payload);
        results.push(inAppResult);
        break;
      }
    }
  }

  await writePlatformAuditLog({
    productKey: "platform",
    action: "notification_dispatched",
    actorId: target.recipientId,
    targetType: "notification",
    targetId: data.type,
    targetLabel: data.subjectAr,
    platformOrganizationId: target.organizationId,
    metadata: {
      event,
      channels: channels,
      results: results.map((r) => ({ channel: r.channel, success: r.success })),
    },
  });

  return results;
}
