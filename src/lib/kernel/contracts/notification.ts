import type { KernelResult } from "../types";

export type NotificationChannel = "email" | "in_app" | "webhook" | "sms";
export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface NotificationMessage {
  to: string | string[];
  channel: NotificationChannel;
  subject: string;
  body: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export interface INotificationService {
  send(message: NotificationMessage): Promise<KernelResult<{ messageId: string }>>;
  schedule(message: NotificationMessage, sendAt: Date): Promise<KernelResult<{ jobId: string }>>;
  getPreferences(userId: string): Promise<KernelResult<NotificationPreferences>>;
  updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<KernelResult<void>>;
}
