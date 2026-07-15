import type { IToolRegistry, ToolDefinition } from "../contracts/tool-registry";
import type { KernelResult } from "../types";

export class ToolRegistryWrapper implements IToolRegistry {
  private getRegistry() {
    return import("@/lib/core/ai/tool-registry/registry").then((m) => m.getToolRegistry());
  }

  async register(tool: ToolDefinition): Promise<KernelResult<void>> {
    const registry = await this.getRegistry();
    return registry.register(tool);
  }

  async unregister(toolId: string): Promise<KernelResult<void>> {
    const registry = await this.getRegistry();
    return registry.unregister(toolId);
  }

  async getTool(toolId: string): Promise<KernelResult<ToolDefinition>> {
    const registry = await this.getRegistry();
    return registry.getTool(toolId);
  }

  async listTools(category?: string): Promise<KernelResult<ToolDefinition[]>> {
    const registry = await this.getRegistry();
    return registry.listTools(category);
  }

  async listEnabledTools(category?: string): Promise<KernelResult<ToolDefinition[]>> {
    const registry = await this.getRegistry();
    return registry.listEnabledTools(category);
  }

  async validateParameters(toolId: string, params: Record<string, unknown>): Promise<KernelResult<boolean>> {
    const registry = await this.getRegistry();
    return registry.validateParameters(toolId, params);
  }

  async checkPermissions(toolId: string, roles: string[], permissions: string[]): Promise<KernelResult<boolean>> {
    const registry = await this.getRegistry();
    return registry.checkPermissions(toolId, roles, permissions);
  }
}
