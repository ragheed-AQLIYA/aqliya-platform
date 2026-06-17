export type NotificationChannel = "email" | "in_app" | "webhook"

export type NotificationSeverity = "info" | "warning" | "error" | "critical"

export interface Notification {
  id: string
  type: string
  subject: string
  body: string
  channel: NotificationChannel
  severity: NotificationSeverity
  recipientId: string
  recipientEmail?: string
  organizationId?: string
  metadata?: Record<string, unknown>
  readAt?: Date
  createdAt: Date
}

export interface SendNotificationInput {
  type: string
  subject: string
  body: string
  channel: NotificationChannel
  severity: NotificationSeverity
  recipientId: string
  recipientEmail?: string
  organizationId?: string
  metadata?: Record<string, unknown>
}

export interface NotificationsEngine {
  send(input: SendNotificationInput): Promise<string>
  markRead(id: string): Promise<void>
  listForUser(userId: string, limit?: number): Promise<Notification[]>
  getUnreadCount(userId: string): Promise<number>
}
