import type { INotificationService, NotificationMessage, NotificationPreferences } from "../contracts/notification";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";

export class NotificationServiceWrapper implements INotificationService {
  async send(message: NotificationMessage): Promise<KernelResult<{ messageId: string }>> {
    try {
      const messageId = randomUUID();
      const orgId = (message.metadata?.organizationId as string) ?? undefined;
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: orgId,
          productKey: "notifications",
          actorId: (message.metadata?.senderId as string) ?? "system",
          actorName: "notification-service",
          action: `notification.${message.channel}.sent`,
          targetType: "Notification",
          targetId: messageId,
          metadata: {
            subject: message.subject,
            channel: message.channel,
            priority: message.priority ?? "normal",
            recipient: Array.isArray(message.to) ? message.to.join(",") : message.to,
          } as Prisma.InputJsonValue,
        },
      });
      return { success: true, data: { messageId } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send notification",
      };
    }
  }

  async schedule(
    message: NotificationMessage,
    sendAt: Date,
  ): Promise<KernelResult<{ jobId: string }>> {
    try {
      const jobId = randomUUID();
      const orgId = (message.metadata?.organizationId as string) ?? undefined;
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: orgId,
          productKey: "notifications",
          actorId: (message.metadata?.senderId as string) ?? "system",
          actorName: "notification-scheduler",
          action: "notification.scheduled",
          targetType: "ScheduledNotification",
          targetId: jobId,
          metadata: {
            subject: message.subject,
            channel: message.channel,
            scheduledAt: sendAt.toISOString(),
            priority: message.priority ?? "normal",
          } as Prisma.InputJsonValue,
        },
      });
      return { success: true, data: { jobId } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule notification",
      };
    }
  }

  async getPreferences(
    userId: string,
  ): Promise<KernelResult<NotificationPreferences>> {
    const prefs: NotificationPreferences = {
      userId,
      channels: ["in_app"],
    };
    return { success: true, data: prefs };
  }

  async updatePreferences(
    userId: string,
    prefs: Partial<NotificationPreferences>,
  ): Promise<KernelResult<void>> {
    try {
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: "system",
          productKey: "notifications",
          actorId: userId,
          actorName: "user",
          action: "notification.preferences.updated",
          targetType: "NotificationPreferences",
          targetId: userId,
          metadata: prefs as unknown as Prisma.InputJsonValue,
        },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update preferences",
      };
    }
  }
}
