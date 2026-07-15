import "server-only";

import type { DomainEvent, EventHandler, EventDomain } from "../../contracts/event-bus";
import { prisma } from "../../prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

export class OutboxBridge {
  private registered = false;

  attach(eventBus: { subscribe: (domain: EventDomain, action: string, handler: EventHandler) => void }): void {
    if (this.registered) return;
    if (!isEnabled("platform.event-outbox")) return;

    this.registered = true;

    eventBus.subscribe("audit", "*", this.persistToOutbox.bind(this));
    eventBus.subscribe("lc", "*", this.persistToOutbox.bind(this));
    eventBus.subscribe("evidence", "*", this.persistToOutbox.bind(this));
    eventBus.subscribe("knowledge", "*", this.persistToOutbox.bind(this));
    eventBus.subscribe("ai", "*", this.persistToOutbox.bind(this));
    eventBus.subscribe("workflow", "*", this.persistToOutbox.bind(this));
  }

  private async persistToOutbox(event: DomainEvent): Promise<void> {
    try {
      const eventType = `${event.domain}.${event.action}`;
      const payload = {
        outboxId: "",
        eventType,
        organizationId: event.organizationId ?? null,
        envelope: {
          schemaVersion: event.schemaVersion,
          correlationId: event.correlationId,
          causationId: event.causationId,
          productSlug: event.productSlug,
          domain: event.domain,
          action: event.action,
          actorId: event.actorId,
          organizationId: event.organizationId,
          workspaceId: event.workspaceId,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          occurredAt: event.occurredAt,
          metadata: event.metadata,
        },
      };

      await prisma.platformOutboxEvent.create({
        data: {
          organizationId: event.organizationId ?? null,
          eventType,
          payload: payload as never,
          status: "pending",
        },
      });
    } catch (err) {
      console.error(
        `[OutboxBridge] Failed to persist event ${event.domain}.${event.action}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}
