import type { Principal, TenantContext, KernelResult } from "../types";

export interface TenantValidationResult {
  valid: boolean;
  principal?: Principal;
  reason?: string;
}

export interface ITenantService {
  enforce(context: TenantContext, principal: Principal): Promise<TenantValidationResult>;
  validateAccess(resourceTenantId: string, principal: Principal): KernelResult<void>;
  getContext(principal: Principal): TenantContext;
  isSameTenant(a: string, b: string): boolean;
}
