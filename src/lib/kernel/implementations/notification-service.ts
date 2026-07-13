import type { INotificationService, NotificationMessage, NotificationPreferences } from "../contracts/notification";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";

export class NotificationServiceWrapper implements INotificationService {
  private prefs = new Map<string, NotificationPreferences>();

  async send(message: NotificationMessage): Promise<KernelResult<{ messageId: string }>> {
    const messageId = randomUUID();
    return { success: true, data: { messageId } };
  }

  async schedule(message: NotificationMessage, sendAt: Date): Promise<KernelResult<{ jobId: string }>> {
    const jobId = randomUUID();
    return { success: true, data: { jobId } };
  }

  async getPreferences(userId: string): Promise<KernelResult<NotificationPreferences>> {
    const prefs = this.prefs.get(userId) ?? {
      userId,
      channels: ["in_app", "email"],
    };
    return { success: true, data: prefs };
  }

  async updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<KernelResult<void>> {
    const existing = this.prefs.get(userId) ?? { userId, channels: ["in_app" as const] };
    this.prefs.set(userId, { ...existing, ...prefs });
    return { success: true };
  }
}
