import type { Principal, TenantContext, ResourceType, AccessAction, KernelResult } from "../types";

export interface PolicyEvaluationRequest {
  principal: Principal;
  resource: { type: ResourceType; id?: string; tenantId?: string };
  action: AccessAction;
  context?: {
    requireMfa?: boolean;
    bypassTenantCheck?: boolean;
    requiredRole?: string;
    attributes?: Record<string, unknown>;
  };
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  principal?: Principal;
}

export interface IPolicyEngine {
  authorize(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult>;
  checkPermission(principal: Principal, resource: ResourceType, action: AccessAction): boolean;
  evaluateAbac(attributes: Record<string, unknown>, policy: Record<string, unknown>): boolean;
}
