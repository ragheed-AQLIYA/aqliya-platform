import type { DomainEvent, EventHandler, EventDomain } from "../contracts/event-bus";
import type { IEventBus } from "../contracts/event-bus";

export interface ReadModel<T> {
  readonly id: string;
  readonly name: string;
  query(organizationId: string): Promise<T | null>;
  rebuild(organizationId: string): Promise<T>;
  invalidate(organizationId: string): Promise<void>;
}

export interface ProjectionConfig {
  domain: EventDomain;
  actions: string[];
  rebuildIntervalMs?: number;
}

export abstract class Projection<T> implements ReadModel<T> {
  abstract readonly id: string;
  abstract readonly name: string;
  protected config: ProjectionConfig = { domain: "platform", actions: [] };
  private lastBuild = new Map<string, number>();

  constructor(config?: ProjectionConfig) {
    if (config) {
      this.config = config;
    }
  }

  abstract compute(organizationId: string): Promise<T>;

  async query(organizationId: string): Promise<T | null> {
    return this.compute(organizationId);
  }

  async rebuild(organizationId: string): Promise<T> {
    const data = await this.compute(organizationId);
    this.lastBuild.set(organizationId, Date.now());
    return data;
  }

  async invalidate(_organizationId: string): Promise<void> {
    this.lastBuild.clear();
  }

  needsRebuild(organizationId: string): boolean {
    const last = this.lastBuild.get(organizationId);
    if (!last) return true;
    return Date.now() - last > (this.config.rebuildIntervalMs ?? 60_000);
  }

  getEventFilter(): { domain: EventDomain; actions: string[] } {
    return { domain: this.config.domain, actions: this.config.actions };
  }
}

export class ProjectionManager {
  private projections = new Map<string, ReadModel<unknown>>();
  private eventBus: IEventBus | null = null;
  private handlers = new Map<string, EventHandler>();

  register<T>(projection: ReadModel<T>): void {
    this.projections.set(projection.id, projection);
  }

  unregister(id: string): void {
    this.projections.delete(id);
    const handler = this.handlers.get(id);
    if (handler && this.eventBus) {
      const proj = this.projections.get(id) as Projection<unknown> | undefined;
      if (proj) {
        const filter = proj.getEventFilter();
        this.eventBus.unsubscribe(filter.domain, filter.actions.length === 1 ? filter.actions[0] : "*", handler);
      }
    }
    this.handlers.delete(id);
  }

  attachToEventBus(eventBus: IEventBus): void {
    this.eventBus = eventBus;

    for (const [id, projection] of this.projections) {
      if (projection instanceof Projection) {
        const filter = projection.getEventFilter();
        const handler: EventHandler = async (event: DomainEvent) => {
          const orgId = event.organizationId;
          if (orgId) {
            await projection.invalidate(orgId);
          }
        };
        this.handlers.set(id, handler);
        for (const action of filter.actions) {
          eventBus.subscribe(filter.domain, action, handler);
        }
      }
    }
  }

  detachFromEventBus(): void {
    if (!this.eventBus) return;
    for (const [id, handler] of this.handlers) {
      const proj = this.projections.get(id) as Projection<unknown> | undefined;
      if (proj) {
        const filter = proj.getEventFilter();
        this.eventBus.unsubscribe(filter.domain, filter.actions.length === 1 ? filter.actions[0] : "*", handler);
      }
    }
    this.handlers.clear();
    this.eventBus = null;
  }

  async query<T>(projectionId: string, organizationId: string): Promise<T | null> {
    const projection = this.projections.get(projectionId);
    if (!projection) return null;
    return projection.query(organizationId) as Promise<T | null>;
  }

  async rebuildAll(organizationId: string): Promise<void> {
    for (const projection of this.projections.values()) {
      await projection.rebuild(organizationId);
    }
  }

  getAll(): Array<{ id: string; name: string }> {
    return Array.from(this.projections.values()).map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }
}

let globalManager: ProjectionManager | null = null;

export function getProjectionManager(): ProjectionManager {
  if (!globalManager) {
    globalManager = new ProjectionManager();
  }
  return globalManager;
}
