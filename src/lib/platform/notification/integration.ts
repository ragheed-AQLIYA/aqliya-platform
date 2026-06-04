import "server-only";
import { dispatch } from "./engine";
import { getTemplate } from "./templates";
import type { NotificationChannel, NotificationEvent, ProductTemplateKey } from "./types";

const productChannelRegistry = new Map<string, NotificationChannel[]>();

export function registerProductChannels(
  productKey: string,
  channels: NotificationChannel[],
): void {
  productChannelRegistry.set(productKey, channels);
}

export function getProductChannels(productKey: string): NotificationChannel[] {
  return productChannelRegistry.get(productKey) ?? ["in_app"];
}

export async function notifyOnEvent(
  event: NotificationEvent,
  organizationId: string,
  targetId: string,
  metadata: {
    productKey: string;
    templateKey: ProductTemplateKey;
    recipientId: string;
    recipientEmail?: string;
    templateVars?: Record<string, string | number | undefined>;
    actionUrl?: string;
  },
): Promise<void> {
  const channels = getProductChannels(metadata.productKey);

  const template = getTemplate(metadata.templateKey, metadata.templateVars);

  await dispatch(
    event,
    {
      recipientId: metadata.recipientId,
      recipientEmail: metadata.recipientEmail,
      organizationId,
    },
    {
      type: `${metadata.productKey}_${metadata.templateKey}`,
      subjectAr: template.arSubject,
      bodyAr: template.arBody,
      subjectEn: template.enSubject,
      bodyEn: template.enBody,
      actionUrl: template.actionUrl,
      metadata: {
        targetId,
        templateKey: metadata.templateKey,
        productKey: metadata.productKey,
        channel: channels,
      },
    },
    channels,
  );
}
