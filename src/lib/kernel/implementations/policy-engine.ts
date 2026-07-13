import type { IPolicyEngine, PolicyEvaluationRequest, PolicyEvaluationResult } from "../contracts/policy";
import type { Principal, ResourceType, AccessAction } from "../types";
import { ROLE_PERMISSIONS, normalizeRole } from "@/lib/authorization/types";

export class PolicyEngineWrapper implements IPolicyEngine {
  async authorize(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    const { authorize } = await import("@/lib/authorization/authorize");
    const result = await authorize({
      user: {
        id: request.principal.userId,
        email: "",
        name: "",
        role: request.principal.role.toUpperCase() as never,
        organizationId: request.principal.organizationId,
        organization: { id: request.principal.organizationId, name: "" },
      },
      resource: {
        type: request.resource.type,
        id: request.resource.id,
        tenantId: request.resource.tenantId ?? request.principal.organizationId,
      },
      action: request.action,
      context: request.context ? {
        ...request.context,
        requiredRole: request.context.requiredRole as never,
      } : undefined,
    });
    return { allowed: result.allowed, reason: result.reason, principal: result.principal };
  }

  checkPermission(principal: Principal, resource: ResourceType, action: AccessAction): boolean {
    const role = normalizeRole(principal.role);
    const perms = ROLE_PERMISSIONS[role];
    return perms.includes(action);
  }

  evaluateAbac(attributes: Record<string, unknown>, policy: Record<string, unknown>): boolean {
    const conditions = policy.conditions as Record<string, unknown> | undefined;
    if (!conditions) return true;
    for (const [key, expected] of Object.entries(conditions)) {
      if (attributes[key] !== expected) return false;
    }
    return true;
  }
}
