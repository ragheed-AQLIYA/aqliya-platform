import { Kernel } from "../bootstrap";
import { ProductRegistry } from "../plugin/product-registry";
import type { ProductPlugin } from "../plugin/product-plugin";
import type { KernelHealth } from "../types";

function createTestPlugin(id: string, caps: string[] = []): ProductPlugin {
  return {
    id,
    name: `Test ${id}`,
    version: "1.0.0",
    description: `Test plugin ${id}`,
    requiredCapabilities: caps,
    dependencies: {},
    async initialize() {},
    async shutdown() {},
    async healthCheck() {
      return { status: "healthy" as KernelHealth };
    },
    getRoutes() {
      return [{ path: `/${id}`, type: "workspace" as const }];
    },
    getSchemas() {
      return [];
    },
  };
}

describe("Kernel", () => {
  beforeEach(() => {
    Kernel.resetInstance();
  });

  afterEach(() => {
    Kernel.resetInstance();
  });

  test("singleton pattern", () => {
    const k1 = Kernel.getInstance();
    const k2 = Kernel.getInstance();
    expect(k1).toBe(k2);
  });

  test("resetInstance clears singleton", () => {
    const k1 = Kernel.getInstance();
    Kernel.resetInstance();
    const k2 = Kernel.getInstance();
    expect(k1).not.toBe(k2);
  });

  test("register and get service", () => {
    const kernel = Kernel.getInstance();
    const mockService = { test: true };
    kernel.registerService("cache", mockService);
    expect(kernel.getService("cache")).toBe(mockService);
    expect(kernel.hasService("cache")).toBe(true);
  });

  test("getService throws for unregistered service", () => {
    const kernel = Kernel.getInstance();
    expect(() => kernel.getService("cache")).toThrow("not registered");
  });

  test("registerPlugin injects dependencies", () => {
    const kernel = Kernel.getInstance();
    const mockCache = { get: jest.fn() };
    kernel.registerService("cache", mockCache);

    const plugin = createTestPlugin("test-plugin", ["cache"]);
    kernel.registerPlugin(plugin);

    expect(plugin.dependencies.cache).toBe(mockCache);
    expect(kernel.getRegistry().getAll()).toContain(plugin);
  });

  test("registerPlugin throws for missing capability", () => {
    const kernel = Kernel.getInstance();
    const plugin = createTestPlugin("test-plugin", ["nonexistent"]);
    expect(() => kernel.registerPlugin(plugin)).toThrow("requires capability");
  });

  test("isInitialized before and after initialize", async () => {
    const kernel = Kernel.getInstance();
    expect(kernel.isInitialized()).toBe(false);
    await kernel.initialize();
    expect(kernel.isInitialized()).toBe(true);
  });

  test("initialize is idempotent", async () => {
    const kernel = Kernel.getInstance();
    await kernel.initialize();
    await kernel.initialize();
    expect(kernel.isInitialized()).toBe(true);
  });

  test("healthCheck returns report", async () => {
    const kernel = Kernel.getInstance();
    const plugin = createTestPlugin("healthy-plugin");
    kernel.registerPlugin(plugin);
    await kernel.initialize();

    const report = await kernel.healthCheck();
    expect(report.status).toBe("healthy");
    expect(report.services["healthy-plugin"]).toBe("healthy");
  });
});

describe("ProductRegistry", () => {
  let registry: ProductRegistry;

  beforeEach(() => {
    registry = new ProductRegistry();
  });

  test("register and get plugin", () => {
    const plugin = createTestPlugin("test");
    registry.register(plugin);
    expect(registry.get("test")).toBe(plugin);
    expect(registry.getAll()).toHaveLength(1);
  });

  test("register throws for duplicate id", () => {
    registry.register(createTestPlugin("test"));
    expect(() => registry.register(createTestPlugin("test"))).toThrow("already registered");
  });

  test("unregister removes plugin", () => {
    registry.register(createTestPlugin("test"));
    registry.unregister("test");
    expect(registry.get("test")).toBeUndefined();
  });

  test("initializeAll initializes all plugins", async () => {
    const p1 = createTestPlugin("p1");
    const p2 = createTestPlugin("p2");
    registry.register(p1);
    registry.register(p2);

    await registry.initializeAll();

    expect(registry.getInitialized()).toHaveLength(2);
  });

  test("healthCheckAll returns healthy when all plugins healthy", async () => {
    registry.register(createTestPlugin("p1"));
    registry.register(createTestPlugin("p2"));
    await registry.initializeAll();

    const report = await registry.healthCheckAll();
    expect(report.status).toBe("healthy");
    expect(report.services.p1).toBe("healthy");
    expect(report.services.p2).toBe("healthy");
  });

  test("healthCheckAll returns unhealthy when plugin throws", async () => {
    const goodPlugin = createTestPlugin("good");
    const badPlugin: ProductPlugin = {
      ...createTestPlugin("bad"),
      async healthCheck() {
        throw new Error("boom");
      },
    };

    registry.register(goodPlugin);
    registry.register(badPlugin);
    await registry.initializeAll();

    const report = await registry.healthCheckAll();
    expect(report.status).toBe("unhealthy");
    expect(report.services.good).toBe("healthy");
    expect(report.services.bad).toBe("unhealthy");
  });

  test("shutdownAll clears initialized state", async () => {
    registry.register(createTestPlugin("p1"));
    await registry.initializeAll();
    expect(registry.getInitialized()).toHaveLength(1);

    await registry.shutdownAll();
    expect(registry.getInitialized()).toHaveLength(0);
  });
});
