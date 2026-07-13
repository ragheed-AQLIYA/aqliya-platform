import type { IEventBus, DomainEvent, EventHandler, EventDomain } from "../contracts/event-bus";
import type { KernelResult } from "../types";
import { CORE_EVENT_SCHEMA_VERSION } from "@/lib/core/contracts/event-envelope";
import { randomUUID } from "crypto";

export class EventBusWrapper implements IEventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  private key(domain: EventDomain, action: string): string {
    return `${domain}:${action}`;
  }

  async publish(event: Omit<DomainEvent, "schemaVersion" | "occurredAt">): Promise<KernelResult<void>> {
    const fullEvent: DomainEvent = {
      ...event,
      schemaVersion: CORE_EVENT_SCHEMA_VERSION,
      occurredAt: new Date().toISOString(),
    };

    const exactHandlers = this.handlers.get(this.key(event.domain, event.action));
    const wildcardHandlers = this.handlers.get(this.key(event.domain, "*"));

    const handlers = new Set<EventHandler>([
      ...(exactHandlers ?? []),
      ...(wildcardHandlers ?? []),
    ]);

    for (const handler of handlers) {
      await handler(fullEvent);
    }

    return { success: true };
  }

  subscribe(domain: EventDomain, action: string, handler: EventHandler): void {
    const key = this.key(domain, action);
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler);
  }

  unsubscribe(domain: EventDomain, action: string, handler: EventHandler): void {
    const key = this.key(domain, action);
    this.handlers.get(key)?.delete(handler);
  }

  async replay(correlationId: string): Promise<KernelResult<DomainEvent[]>> {
    return { success: true, data: [] };
  }
}
