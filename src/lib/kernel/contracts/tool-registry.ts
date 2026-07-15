import type { KernelResult } from "../types";

export type ToolParameterType = "string" | "number" | "boolean" | "object" | "array";

export interface ToolParameter {
  name: string;
  type: ToolParameterType;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  enum?: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  version: string;
  parameters: ToolParameter[];
  requiredRoles: string[];
  requiredPermissions: string[];
  timeoutMs: number;
  maxRetries: number;
  isEnabled: boolean;
  metadata?: Record<string, unknown>;
}

export interface ToolInvocationRequest {
  toolId: string;
  parameters: Record<string, unknown>;
  organizationId: string;
  actorId: string;
  actorRoles: string[];
  correlationId?: string;
}

export interface ToolInvocationResult {
  toolId: string;
  success: boolean;
  output: unknown;
  error?: string;
  durationMs: number;
  invokedAt: string;
  correlationId?: string;
}

export interface IToolRegistry {
  register(tool: ToolDefinition): Promise<KernelResult<void>> | KernelResult<void>;
  unregister(toolId: string): Promise<KernelResult<void>> | KernelResult<void>;
  getTool(toolId: string): Promise<KernelResult<ToolDefinition>> | KernelResult<ToolDefinition>;
  listTools(category?: string): Promise<KernelResult<ToolDefinition[]>> | KernelResult<ToolDefinition[]>;
  listEnabledTools(category?: string): Promise<KernelResult<ToolDefinition[]>> | KernelResult<ToolDefinition[]>;
  validateParameters(toolId: string, params: Record<string, unknown>): Promise<KernelResult<boolean>> | KernelResult<boolean>;
  checkPermissions(toolId: string, roles: string[], permissions: string[]): Promise<KernelResult<boolean>> | KernelResult<boolean>;
}
