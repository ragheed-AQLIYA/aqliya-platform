export { dispatch } from "./engine";
export { sendEmail } from "./email-channel";
export { sendInApp, markAsRead, markAllAsRead, getUnreadCount } from "./in-app-channel";
export { sendWebhook, verifySignature } from "./webhook-channel";
export { getTemplate, getRegisteredTemplateKeys } from "./templates";
export { notifyOnEvent, registerProductChannels } from "./integration";
export type {
  NotificationChannel,
  NotificationSeverity,
  NotificationEvent,
  NotificationTemplate,
  NotificationPayload,
  DeliveryResult,
  DispatchTarget,
  WebhookConfig,
  ProductTemplateKey,
} from "./types";
