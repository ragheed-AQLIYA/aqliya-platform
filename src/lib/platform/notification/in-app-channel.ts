import "server-only";
import { createLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { DeliveryResult, NotificationPayload } from "./types";


const logger = createLogger({ product: "platform", action: "unknown" });

export async function sendInApp(
  payload: NotificationPayload,
): Promise<DeliveryResult> {
  const deliveredAt = new Date();
  try {
    await prisma.platformNotification.create({
      data: {
        type: payload.type,
        subject: payload.subject,
        body: payload.body,
        channel: "in_app",
        severity: payload.severity,
        recipientId: payload.recipientId,
        recipientEmail: payload.recipientEmail ?? null,
        organizationId: payload.organizationId ?? null,
        metadata: (payload.metadata ?? undefined) as unknown as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
    return { channel: "in_app", success: true, deliveredAt };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Failed to create in-app notification";
    logger.error("[Notification][InApp] Failed:", err instanceof Error ? err : new Error(String(err)));
    return { channel: "in_app", success: false, error, deliveredAt };
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.platformNotification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(recipientId: string): Promise<void> {
  await prisma.platformNotification.updateMany({
    where: { recipientId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  return prisma.platformNotification.count({
    where: { recipientId, readAt: null },
  });
}
