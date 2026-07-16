import type {
  ToolDefinition,
  ToolParameter,
  ToolInvocationRequest,
  ToolInvocationResult,
  IToolRegistry,
} from "@/lib/kernel/contracts/tool-registry";
import type { KernelResult } from "@/lib/kernel/types";

const ok = <T>(data: T): KernelResult<T> => ({ success: true, data });
const fail = <T>(message: string): KernelResult<T> => ({
  success: false,
  error: message,
});

export class ToolRegistryImpl implements IToolRegistry {
  private tools = new Map<string, ToolDefinition>();
  private invocationLog: Array<{
    toolId: string;
    organizationId: string;
    actorId: string;
    success: boolean;
    durationMs: number;
    invokedAt: string;
  }> = [];

  register(tool: ToolDefinition): KernelResult<void> {
    if (this.tools.has(tool.id)) {
      return fail(`Tool "${tool.id}" is already registered`);
    }

    const validation = this.validateToolDefinition(tool);
    if (!validation.success) {
      return fail(`Invalid tool definition: ${validation.error}`);
    }

    this.tools.set(tool.id, tool);
    return ok(undefined);
  }

  unregister(toolId: string): KernelResult<void> {
    if (!this.tools.has(toolId)) {
      return fail(`Tool "${toolId}" is not registered`);
    }
    this.tools.delete(toolId);
    return ok(undefined);
  }

  getTool(toolId: string): KernelResult<ToolDefinition> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return fail(`Tool "${toolId}" is not registered`);
    }
    return ok(tool);
  }

  listTools(category?: string): KernelResult<ToolDefinition[]> {
    const all = Array.from(this.tools.values());
    if (category) {
      return ok(all.filter((t) => t.category === category));
    }
    return ok(all);
  }

  listEnabledTools(category?: string): KernelResult<ToolDefinition[]> {
    const all = Array.from(this.tools.values()).filter((t) => t.isEnabled);
    if (category) {
      return ok(all.filter((t) => t.category === category));
    }
    return ok(all);
  }

  validateParameters(toolId: string, params: Record<string, unknown>): KernelResult<boolean> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return fail(`Tool "${toolId}" is not registered`);
    }

    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        return fail(`Missing required parameter "${param.name}"`);
      }

      if (param.name in params) {
        const value = params[param.name];
        if (!this.validateParameterType(param, value)) {
          return fail(`Parameter "${param.name}" has invalid type`);
        }

        if (param.enum && !param.enum.includes(String(value))) {
          return fail(`Parameter "${param.name}" must be one of: ${param.enum.join(", ")}`);
        }
      }
    }

    return ok(true);
  }

  checkPermissions(toolId: string, roles: string[], permissions: string[]): KernelResult<boolean> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return fail(`Tool "${toolId}" is not registered`);
    }

    if (tool.requiredRoles.length > 0) {
      const hasRole = tool.requiredRoles.some((r) => roles.includes(r));
      if (!hasRole) {
        return fail(`Missing required role. Required: ${tool.requiredRoles.join(", ")}`);
      }
    }

    if (tool.requiredPermissions.length > 0) {
      const hasPermission = tool.requiredPermissions.every((p) => permissions.includes(p));
      if (!hasPermission) {
        return fail(`Missing required permissions. Required: ${tool.requiredPermissions.join(", ")}`);
      }
    }

    return ok(true);
  }

  async invoke(request: ToolInvocationRequest): Promise<ToolInvocationResult> {
    const start = Date.now();
    const tool = this.tools.get(request.toolId);

    if (!tool) {
      return {
        toolId: request.toolId,
        success: false,
        output: null,
        error: `Tool "${request.toolId}" is not registered`,
        durationMs: Date.now() - start,
        invokedAt: new Date().toISOString(),
        correlationId: request.correlationId,
      };
    }

    if (!tool.isEnabled) {
      return {
        toolId: request.toolId,
        success: false,
        output: null,
        error: `Tool "${request.toolId}" is disabled`,
        durationMs: Date.now() - start,
        invokedAt: new Date().toISOString(),
        correlationId: request.correlationId,
      };
    }

    const permCheck = this.checkPermissions(
      request.toolId,
      request.actorRoles,
      [],
    );
    if (!permCheck.success) {
      return {
        toolId: request.toolId,
        success: false,
        output: null,
        error: permCheck.error,
        durationMs: Date.now() - start,
        invokedAt: new Date().toISOString(),
        correlationId: request.correlationId,
      };
    }

    const paramCheck = this.validateParameters(request.toolId, request.parameters);
    if (!paramCheck.success) {
      return {
        toolId: request.toolId,
        success: false,
        output: null,
        error: paramCheck.error,
        durationMs: Date.now() - start,
        invokedAt: new Date().toISOString(),
        correlationId: request.correlationId,
      };
    }

    const durationMs = Date.now() - start;
    this.logInvocation({
      toolId: request.toolId,
      organizationId: request.organizationId,
      actorId: request.actorId,
      success: true,
      durationMs,
      invokedAt: new Date().toISOString(),
    });

    return {
      toolId: request.toolId,
      success: true,
      output: { toolId: request.toolId, parameters: request.parameters, message: "Tool validated and authorized" },
      durationMs,
      invokedAt: new Date().toISOString(),
      correlationId: request.correlationId,
    };
  }

  getInvocationLog(category?: string): typeof this.invocationLog {
    if (category) {
      const toolIds = new Set(
        Array.from(this.tools.values())
          .filter((t) => t.category === category)
          .map((t) => t.id),
      );
      return this.invocationLog.filter((e) => toolIds.has(e.toolId));
    }
    return [...this.invocationLog];
  }

  private validateToolDefinition(tool: ToolDefinition): KernelResult<boolean> {
    if (!tool.id || typeof tool.id !== "string") {
      return fail("Tool id is required");
    }
    if (!tool.name || typeof tool.name !== "string") {
      return fail("Tool name is required");
    }
    if (!tool.version || typeof tool.version !== "string") {
      return fail("Tool version is required");
    }
    if (tool.timeoutMs <= 0) {
      return fail("Tool timeoutMs must be positive");
    }
    return ok(true);
  }

  private validateParameterType(param: ToolParameter, value: unknown): boolean {
    switch (param.type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "object":
        return typeof value === "object" && value !== null && !Array.isArray(value);
      case "array":
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private logInvocation(entry: typeof this.invocationLog[number]): void {
    this.invocationLog.push(entry);
    if (this.invocationLog.length > 1000) {
      this.invocationLog = this.invocationLog.slice(-500);
    }
  }
}

let globalRegistry: ToolRegistryImpl | null = null;

export function getToolRegistry(): ToolRegistryImpl {
  if (!globalRegistry) {
    globalRegistry = new ToolRegistryImpl();
  }
  return globalRegistry;
}
