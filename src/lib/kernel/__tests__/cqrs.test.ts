import { Projection, ProjectionManager, getProjectionManager } from "../cqrs/projection";
import type { ProjectionConfig } from "../cqrs/projection";
import type { IEventBus } from "../../contracts/event-bus";

interface TestReadModel {
  value: number;
  lastComputedAt: string;
}

const TEST_CONFIG: ProjectionConfig = {
  domain: "audit",
  actions: ["test.action"],
  rebuildIntervalMs: 100,
};

class TestProjection extends Projection<TestReadModel> {
  readonly id = "test-projection";
  readonly name = "Test Projection";
  protected config = TEST_CONFIG;

  async compute(_organizationId: string): Promise<TestReadModel> {
    return { value: 42, lastComputedAt: new Date().toISOString() };
  }
}

function createMockEventBus(): IEventBus {
  return {
    publish: jest.fn().mockResolvedValue({ success: true }),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    getHistory: jest.fn().mockResolvedValue([]),
    getDeadLetters: jest.fn().mockResolvedValue([]),
    retryDeadLetter: jest.fn().mockResolvedValue(true),
    clearDeadLetters: jest.fn().mockResolvedValue(undefined),
    subscribeDomain: jest.fn(),
    unsubscribeDomain: jest.fn(),
    handlerCount: jest.fn().mockReturnValue(0),
    isWildcardDomain: jest.fn().mockReturnValue(false),
    setMaxConcurrent: jest.fn(),
    setRetryPolicy: jest.fn(),
    setDeadLetterMaxSize: jest.fn(),
    setHistoryMaxSize: jest.fn(),
    reset: jest.fn(),
  };
}

describe("CQRS Projection Framework", () => {
  describe("Projection", () => {
    it("has correct id and name", () => {
      const projection = new TestProjection();
      expect(projection.id).toBe("test-projection");
      expect(projection.name).toBe("Test Projection");
    });

    it("computes data correctly", async () => {
      const projection = new TestProjection();
      const result = await projection.query("org-1");
      expect(result).toEqual({ value: 42, lastComputedAt: expect.any(String) });
    });

    it("rebuilds and tracks last build time", async () => {
      const projection = new TestProjection();
      expect(projection.needsRebuild("org-1")).toBe(true);

      await projection.rebuild("org-1");
      expect(projection.needsRebuild("org-1")).toBe(false);
    });

    it("invalidation clears build tracking", async () => {
      const projection = new TestProjection();
      await projection.rebuild("org-1");
      expect(projection.needsRebuild("org-1")).toBe(false);

      await projection.invalidate("org-1");
      expect(projection.needsRebuild("org-1")).toBe(true);
    });

    it("returns correct event filter", () => {
      const projection = new TestProjection();
      const filter = projection.getEventFilter();
      expect(filter).toEqual({ domain: "audit", actions: ["test.action"] });
    });
  });

  describe("ProjectionManager", () => {
    it("registers and retrieves projections", () => {
      const manager = new ProjectionManager();
      const projection = new TestProjection();
      manager.register(projection);

      const all = manager.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("test-projection");
    });

    it("unregisters projections", () => {
      const manager = new ProjectionManager();
      const projection = new TestProjection();
      manager.register(projection);
      manager.unregister("test-projection");

      expect(manager.getAll()).toHaveLength(0);
    });

    it("queries projection by id", async () => {
      const manager = new ProjectionManager();
      manager.register(new TestProjection());

      const result = await manager.query<TestReadModel>("test-projection", "org-1");
      expect(result?.value).toBe(42);
    });

    it("returns null for unknown projection", async () => {
      const manager = new ProjectionManager();
      const result = await manager.query("unknown", "org-1");
      expect(result).toBeNull();
    });

    it("rebuilds all projections", async () => {
      const manager = new ProjectionManager();
      manager.register(new TestProjection());

      await manager.rebuildAll("org-1");
      const all = manager.getAll();
      expect(all).toHaveLength(1);
    });
  });

  describe("Event Bus Integration", () => {
    it("attaches to event bus and subscribes to actions", () => {
      const manager = new ProjectionManager();
      manager.register(new TestProjection());
      const eventBus = createMockEventBus();

      manager.attachToEventBus(eventBus);

      expect(eventBus.subscribe).toHaveBeenCalledWith("audit", "test.action", expect.any(Function));
    });

    it("detaches from event bus and unsubscribes", () => {
      const manager = new ProjectionManager();
      manager.register(new TestProjection());
      const eventBus = createMockEventBus();

      manager.attachToEventBus(eventBus);
      manager.detachFromEventBus();

      expect(eventBus.unsubscribe).toHaveBeenCalled();
    });

    it("invalidates projection on matching event", async () => {
      const manager = new ProjectionManager();
      const projection = new TestProjection();
      manager.register(projection);
      const eventBus = createMockEventBus();

      manager.attachToEventBus(eventBus);

      const handler = (eventBus.subscribe as jest.Mock).mock.calls[0][2];
      await handler({
        productSlug: "audit-os",
        domain: "audit",
        action: "test.action",
        organizationId: "org-1",
        actorId: "user-1",
        resourceId: "res-1",
        correlationId: "corr-1",
        schemaVersion: "1.0",
        occurredAt: new Date(),
      });

      expect(projection.needsRebuild("org-1")).toBe(true);
    });
  });

  describe("getProjectionManager singleton", () => {
    it("returns same instance", () => {
      const manager1 = getProjectionManager();
      const manager2 = getProjectionManager();
      expect(manager1).toBe(manager2);
    });
  });
});
