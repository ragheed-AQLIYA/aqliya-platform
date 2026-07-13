import type { KernelResult } from "../types";

export type EventDomain = "audit" | "workflow" | "ai" | "notification" | "platform" | "auth";

export interface DomainEvent {
  schemaVersion: string;
  correlationId: string;
  causationId?: string;
  productSlug: string;
  domain: EventDomain;
  action: string;
  actorId?: string;
  organizationId?: string;
  workspaceId?: string;
  resourceType?: string;
  resourceId?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface IEventBus {
  publish(event: Omit<DomainEvent, "schemaVersion" | "occurredAt">): Promise<KernelResult<void>>;
  subscribe(domain: EventDomain, action: string, handler: EventHandler): void;
  unsubscribe(domain: EventDomain, action: string, handler: EventHandler): void;
  replay(correlationId: string): Promise<KernelResult<DomainEvent[]>>;
}
