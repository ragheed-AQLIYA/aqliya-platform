/**
 * InMemoryDomainEventPublisher — test adapter
 * Captures published events for verification in tests.
 */

import type { DomainEventPublisher } from "../domain/publisher";
import type { DomainEvent } from "../domain/events";

export class InMemoryDomainEventPublisher implements DomainEventPublisher {
  events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }

  /** Test helpers */
  get eventCount(): number { return this.events.length; }
  eventsOfType(type: string): DomainEvent[] {
    return this.events.filter((e) => e.type === type);
  }
  clear(): void { this.events = []; }
}
