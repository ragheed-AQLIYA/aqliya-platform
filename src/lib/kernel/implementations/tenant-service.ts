import type { ITenantService, TenantValidationResult } from "../contracts/tenant";
import type { Principal, TenantContext, KernelResult } from "../types";

export class TenantService implements ITenantService {
  async enforce(context: TenantContext, principal: Principal): Promise<TenantValidationResult> {
    if (principal.role === "admin") {
      return { valid: true, principal };
    }
    if (principal.organizationId !== context.organizationId) {
      return {
        valid: false,
        reason: `Tenant mismatch: principal org ${principal.organizationId} ≠ context org ${context.organizationId}`,
      };
    }
    return { valid: true, principal };
  }

  validateAccess(resourceTenantId: string, principal: Principal): KernelResult<void> {
    if (principal.role === "admin") {
      return { success: true };
    }
    if (principal.organizationId !== resourceTenantId) {
      return {
        success: false,
        error: `Access denied: resource belongs to org ${resourceTenantId}, not ${principal.organizationId}`,
        code: "TENANT_MISMATCH",
      };
    }
    return { success: true };
  }

  getContext(principal: Principal): TenantContext {
    return { organizationId: principal.organizationId };
  }

  isSameTenant(a: string, b: string): boolean {
    return a === b;
  }
}
