import type {
  Principal as AuthPrincipal,
  PrincipalRole,
  TenantContext as AuthTenantContext,
  ResourceType,
  AccessAction,
} from "@/lib/authorization/types";

export type { PrincipalRole, ResourceType, AccessAction };

export type Principal = AuthPrincipal;
export type TenantContext = AuthTenantContext;

export interface KernelResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
}

export type KernelHealth = "healthy" | "degraded" | "unhealthy";

export interface KernelHealthReport {
  status: KernelHealth;
  services: Record<string, KernelHealth>;
  uptime: number;
}

export interface ProductRoute {
  path: string;
  type: "workspace" | "api" | "public";
}

export interface ProductSchema {
  model: string;
  key: string;
}
