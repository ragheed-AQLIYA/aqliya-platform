import type { IEventBus, DomainEvent, EventHandler, EventDomain } from "../contracts/event-bus";
import type { KernelResult } from "../types";
import { CORE_EVENT_SCHEMA_VERSION } from "@/lib/core/contracts/event-envelope";

interface DeadLetter {
  event: DomainEvent;
  error: string;
  timestamp: string;
  retryCount: number;
}

interface HistoryEntry {
  event: DomainEvent;
  handlerCount: number;
  succeeded: number;
  failed: number;
  timestamp: string;
}

export class EventBusWrapper implements IEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private deadLetters: DeadLetter[] = [];
  private history: HistoryEntry[] = [];
  private maxHistory = 100;
  private maxRetries = 3;

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

    const allHandlers = new Set<EventHandler>([
      ...(exactHandlers ?? []),
      ...(wildcardHandlers ?? []),
    ]);

    let succeeded = 0;
    let failed = 0;

    for (const handler of allHandlers) {
      let retries = 0;
      let lastError: unknown;
      while (retries < this.maxRetries) {
        try {
          await handler(fullEvent);
          succeeded++;
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          retries++;
        }
      }
      if (lastError !== undefined) {
        failed++;
        this.deadLetters.push({
          event: fullEvent,
          error: lastError instanceof Error ? lastError.message : String(lastError),
          timestamp: new Date().toISOString(),
          retryCount: this.maxRetries,
        });
      }
    }

    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push({
      event: fullEvent,
      handlerCount: allHandlers.size,
      succeeded,
      failed,
      timestamp: new Date().toISOString(),
    });

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
    const events = this.history
      .filter((h) => h.event.correlationId === correlationId)
      .map((h) => h.event);
    return { success: true, data: events };
  }

  async getDeadLetters(): Promise<KernelResult<DeadLetter[]>> {
    return { success: true, data: [...this.deadLetters] };
  }

  async retryDeadLetter(letter: DeadLetter): Promise<KernelResult<void>> {
    const index = this.deadLetters.indexOf(letter);
    if (index === -1) {
      return { success: false, error: "Dead letter not found", code: "NOT_FOUND" };
    }

    const exactHandlers = this.handlers.get(this.key(letter.event.domain, letter.event.action));
    const wildcardHandlers = this.handlers.get(this.key(letter.event.domain, "*"));
    const allHandlers = new Set<EventHandler>([
      ...(exactHandlers ?? []),
      ...(wildcardHandlers ?? []),
    ]);

    let succeeded = false;
    for (const handler of allHandlers) {
      try {
        await handler(letter.event);
        succeeded = true;
      } catch {
        // still failing
      }
    }

    if (succeeded) {
      this.deadLetters.splice(index, 1);
    }

    return { success: true };
  }

  async clearDeadLetters(): Promise<KernelResult<void>> {
    this.deadLetters = [];
    return { success: true };
  }

  async getHistory(limit?: number): Promise<KernelResult<HistoryEntry[]>> {
    const entries = limit ? this.history.slice(-limit) : [...this.history];
    return { success: true, data: entries };
  }

  getHandlerCount(): number {
    let count = 0;
    for (const set of this.handlers.values()) {
      count += set.size;
    }
    return count;
  }
}
