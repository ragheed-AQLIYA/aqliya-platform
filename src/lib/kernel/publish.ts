import "server-only";
import { createLogger } from "@/lib/observability/logger";

import type { DomainEvent } from "./contracts/event-bus";
import { Kernel } from "./bootstrap";


const logger = createLogger({ product: "platform", action: "lib-kernel-publish" });

export async function publishDomainEvent(
  event: Omit<DomainEvent, "schemaVersion" | "occurredAt">,
): Promise<void> {
  try {
    const kernel = Kernel.getInstance();
    if (!kernel.hasService("events")) return;

    const eventBus = kernel.getService<{ publish: (e: Omit<DomainEvent, "schemaVersion" | "occurredAt">) => Promise<{ success: boolean }> }>("events");
    await eventBus.publish(event);
  } catch (err) {
    logger.error(`[Kernel] Failed to publish domain event ${event.domain}.${event.action}:`, err instanceof Error ? err : new Error(String(err)));
  }
}
