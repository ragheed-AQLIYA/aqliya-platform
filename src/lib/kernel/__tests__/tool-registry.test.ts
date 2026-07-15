import { ToolRegistryImpl } from "../../core/ai/tool-registry/registry";
import { BUILTIN_TOOLS, registerBuiltinTools } from "../../core/ai/tool-registry/builtin-tools";
import type { ToolDefinition } from "@/lib/kernel/contracts/tool-registry";

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    id: "test-tool",
    name: "Test Tool",
    description: "A test tool",
    category: "test",
    version: "1.0.0",
    parameters: [
      { name: "input", type: "string", description: "Input param", required: true },
      { name: "count", type: "number", description: "Count param", required: false, defaultValue: 1 },
    ],
    requiredRoles: ["admin"],
    requiredPermissions: [],
    timeoutMs: 5000,
    maxRetries: 0,
    isEnabled: true,
    ...overrides,
  };
}

describe("ToolRegistryImpl", () => {
  let registry: ToolRegistryImpl;

  beforeEach(() => {
    registry = new ToolRegistryImpl();
  });

  describe("register", () => {
    it("registers a valid tool", () => {
      const result = registry.register(makeTool());
      expect(result.success).toBe(true);
    });

    it("rejects duplicate tool ids", () => {
      registry.register(makeTool());
      const result = registry.register(makeTool());
      expect(result.success).toBe(false);
      expect(result.error).toContain("already registered");
    });

    it("rejects tool without id", () => {
      const result = registry.register(makeTool({ id: "" }));
      expect(result.success).toBe(false);
      expect(result.error).toContain("id is required");
    });

    it("rejects tool without name", () => {
      const result = registry.register(makeTool({ name: "" }));
      expect(result.success).toBe(false);
      expect(result.error).toContain("name is required");
    });

    it("rejects tool with negative timeout", () => {
      const result = registry.register(makeTool({ timeoutMs: -1 }));
      expect(result.success).toBe(false);
      expect(result.error).toContain("timeoutMs must be positive");
    });
  });

  describe("unregister", () => {
    it("unregisters an existing tool", () => {
      registry.register(makeTool());
      const result = registry.unregister("test-tool");
      expect(result.success).toBe(true);
      expect(registry.getTool("test-tool").success).toBe(false);
    });

    it("rejects unregistering non-existent tool", () => {
      const result = registry.unregister("nonexistent");
      expect(result.success).toBe(false);
    });
  });

  describe("getTool", () => {
    it("returns registered tool", () => {
      registry.register(makeTool());
      const result = registry.getTool("test-tool");
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("Test Tool");
    });

    it("fails for non-existent tool", () => {
      const result = registry.getTool("nonexistent");
      expect(result.success).toBe(false);
    });
  });

  describe("listTools", () => {
    it("lists all tools", () => {
      registry.register(makeTool({ id: "tool-1" }));
      registry.register(makeTool({ id: "tool-2", category: "other" }));
      const result = registry.listTools();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("filters by category", () => {
      registry.register(makeTool({ id: "tool-1", category: "audit" }));
      registry.register(makeTool({ id: "tool-2", category: "ai" }));
      const result = registry.listTools("audit");
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe("tool-1");
    });
  });

  describe("listEnabledTools", () => {
    it("only returns enabled tools", () => {
      registry.register(makeTool({ id: "enabled", isEnabled: true }));
      registry.register(makeTool({ id: "disabled", isEnabled: false }));
      const result = registry.listEnabledTools();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe("enabled");
    });
  });

  describe("validateParameters", () => {
    it("passes for valid parameters", () => {
      registry.register(makeTool());
      const result = registry.validateParameters("test-tool", { input: "hello" });
      expect(result.success).toBe(true);
    });

    it("fails for missing required parameter", () => {
      registry.register(makeTool());
      const result = registry.validateParameters("test-tool", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required parameter");
    });

    it("fails for wrong type", () => {
      registry.register(makeTool());
      const result = registry.validateParameters("test-tool", { input: 123 });
      expect(result.success).toBe(false);
      expect(result.error).toContain("invalid type");
    });

    it("validates enum constraints", () => {
      registry.register(makeTool({
        parameters: [{ name: "status", type: "string", description: "Status", required: true, enum: ["active", "inactive"] }],
      }));
      const valid = registry.validateParameters("test-tool", { status: "active" });
      expect(valid.success).toBe(true);

      const invalid = registry.validateParameters("test-tool", { status: "deleted" });
      expect(invalid.success).toBe(false);
      expect(invalid.error).toContain("must be one of");
    });
  });

  describe("checkPermissions", () => {
    it("passes when actor has required role", () => {
      registry.register(makeTool({ requiredRoles: ["admin", "manager"] }));
      const result = registry.checkPermissions("test-tool", ["admin"], []);
      expect(result.success).toBe(true);
    });

    it("fails when actor lacks required role", () => {
      registry.register(makeTool({ requiredRoles: ["admin"] }));
      const result = registry.checkPermissions("test-tool", ["viewer"], []);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required role");
    });

    it("passes when no roles required", () => {
      registry.register(makeTool({ requiredRoles: [] }));
      const result = registry.checkPermissions("test-tool", ["viewer"], []);
      expect(result.success).toBe(true);
    });
  });

  describe("invoke", () => {
    it("invokes a valid enabled tool", async () => {
      registry.register(makeTool());
      const result = await registry.invoke({
        toolId: "test-tool",
        parameters: { input: "hello" },
        organizationId: "org-1",
        actorId: "user-1",
        actorRoles: ["admin"],
      });
      expect(result.success).toBe(true);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("rejects invocation of disabled tool", async () => {
      registry.register(makeTool({ isEnabled: false }));
      const result = await registry.invoke({
        toolId: "test-tool",
        parameters: { input: "hello" },
        organizationId: "org-1",
        actorId: "user-1",
        actorRoles: ["admin"],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("disabled");
    });

    it("rejects invocation with invalid permissions", async () => {
      registry.register(makeTool({ requiredRoles: ["admin"] }));
      const result = await registry.invoke({
        toolId: "test-tool",
        parameters: { input: "hello" },
        organizationId: "org-1",
        actorId: "user-1",
        actorRoles: ["viewer"],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required role");
    });

    it("rejects invocation with invalid parameters", async () => {
      registry.register(makeTool());
      const result = await registry.invoke({
        toolId: "test-tool",
        parameters: {},
        organizationId: "org-1",
        actorId: "user-1",
        actorRoles: ["admin"],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Missing required parameter");
    });

    it("logs invocations", async () => {
      registry.register(makeTool());
      await registry.invoke({
        toolId: "test-tool",
        parameters: { input: "hello" },
        organizationId: "org-1",
        actorId: "user-1",
        actorRoles: ["admin"],
      });
      const log = registry.getInvocationLog();
      expect(log).toHaveLength(1);
      expect(log[0].toolId).toBe("test-tool");
    });
  });
});

describe("Built-in Tools", () => {
  it("defines 5 built-in tools", () => {
    expect(BUILTIN_TOOLS).toHaveLength(5);
  });

  it("all built-in tools have required fields", () => {
    for (const tool of BUILTIN_TOOLS) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.version).toBeTruthy();
      expect(tool.timeoutMs).toBeGreaterThan(0);
    }
  });

  it("registers all built-in tools", () => {
    const registry = new ToolRegistryImpl();
    registerBuiltinTools(registry);
    const tools = registry.listTools();
    expect(tools.data).toHaveLength(5);
  });
});
