/**
 * ABAC bridge.
 *
 * Connects the existing ABAC (Attribute-Based Access Control) engine
 * to the unified authorization facade.
 *
 * The ABAC engine exists at src/lib/platform/abac/ but was previously
 * disconnected from the actual authorization flow. This bridge wires
 * it in without requiring immediate migration of all policies.
 */

import type { Principal, AccessAction } from "./types";

export interface AbacEvaluationRequest {
  principal: Principal;
  resourceType: string;
  action: AccessAction;
  attributes: Record<string, unknown>;
}

export interface AbacEvaluationResult {
  allowed: boolean;
  reason?: string;
  policyName?: string;
}

function isAbacEnforceRequested(): boolean {
  return process.env.FF_ABAC_ENFORCE === "true";
}

/**
 * Evaluate ABAC conditions for a given request.
 *
 * Shadow (FF_ABAC_ENFORCE unset/false): engine errors fail-open after RBAC.
 * Enforce (FF_ABAC_ENFORCE=true): engine errors fail-closed.
 */
export async function evaluateAbac(
  request: AbacEvaluationRequest,
): Promise<AbacEvaluationResult> {
  try {
    const { evaluateAccess } = await import("@/lib/platform/abac/abac-service");

    const result = await evaluateAccess({
      userId: request.principal.userId,
      organizationId: request.principal.organizationId,
      roleIds: [],
      resourceType: request.resourceType,
      action: request.action,
      attributes: request.attributes as Record<string, string>,
    });

    if (!result.allowed) {
      return {
        allowed: false,
        reason: result.policyName
          ? `ABAC policy denied: '${result.policyName}'`
          : `ABAC denied: '${request.action}' on '${request.resourceType}'`,
        policyName: result.policyName ?? undefined,
      };
    }

    return { allowed: true };
  } catch {
    if (isAbacEnforceRequested()) {
      return {
        allowed: false,
        reason: "ABAC engine unavailable",
      };
    }
    return { allowed: true };
  }
}
