/**
 * Domain Event Publisher Interface — SPEC-01a §6
 *
 * Implementation deferred to infrastructure (API layer or Event Bus adapter).
 */

import type { DomainEvent } from "./events";

export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
