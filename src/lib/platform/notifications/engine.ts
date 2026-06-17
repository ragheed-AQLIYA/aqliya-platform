import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { enqueueTask } from "@/lib/platform/operations/queue-runtime"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import type { Notification, SendNotificationInput, NotificationsEngine } from "./types"
import type { Prisma } from "@prisma/client"

class NotificationsEngineImpl implements NotificationsEngine {
  async send(input: SendNotificationInput): Promise<string> {
    const notification = await prisma.platformNotification.create({
      data: {
        type: input.type,
        subject: input.subject,
        body: input.body,
        channel: input.channel,
        severity: input.severity,
        recipientId: input.recipientId,
        recipientEmail: input.recipientEmail,
        organizationId: input.organizationId,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    })

    await writePlatformAuditLog({
      productKey: "platform",
      action: "notification.send",
      targetType: "platform_notification",
      targetId: notification.id,
      actorId: input.recipientId,
      severity: "info",
      status: "recorded",
      sourceSystem: "notifications_engine",
      metadata: { type: input.type, channel: input.channel, severity: input.severity },
    })

    if (input.channel === "email" && isEnabled("queue.enabled")) {
      void enqueueTask("send_email", {
        notificationId: notification.id,
        to: input.recipientEmail,
        subject: input.subject,
        body: input.body,
      })
    }

    return notification.id
  }

  async markRead(id: string): Promise<void> {
    await prisma.platformNotification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  async listForUser(userId: string, limit = 50): Promise<Notification[]> {
    const rows = await prisma.platformNotification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      subject: r.subject,
      body: r.body,
      channel: r.channel as Notification["channel"],
      severity: r.severity as Notification["severity"],
      recipientId: r.recipientId,
      recipientEmail: r.recipientEmail ?? undefined,
      organizationId: r.organizationId ?? undefined,
      metadata: r.metadata as Record<string, unknown> | undefined,
      readAt: r.readAt ?? undefined,
      createdAt: r.createdAt,
    }))
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.platformNotification.count({
      where: { recipientId: userId, readAt: null },
    })
  }
}

export const notificationsEngine: NotificationsEngine = new NotificationsEngineImpl()
