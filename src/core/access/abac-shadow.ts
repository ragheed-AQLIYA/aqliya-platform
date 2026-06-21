import "server-only";

import { AuditEngine } from "@/lib/core/audit/engine";
import { evaluateAccess } from "@/lib/platform/abac/abac-service";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { buildAbacContext, type AbacGateOptions } from "./abac-gate";
import type { AccessRequest, AccessResult } from "./types";

export interface AbacShadowEvaluation {
  enabled: boolean;
  rbacGranted: boolean;
  abacAllowed: boolean;
  mismatch: boolean;
  policyName: string | null;
  deniedByDefault: boolean;
}

function isAbacShadowEnabled(): boolean {
  if (process.env.FF_ABAC_SHADOW === "false") return false;
  return isEnabled("platform.abac-shadow");
}

export async function runAbacShadowEvaluation(
  request: AccessRequest,
  rbacResult: AccessResult,
  options?: AbacGateOptions & { crossTenantAttempt?: boolean },
): Promise<AbacShadowEvaluation | null> {
  if (!isAbacShadowEnabled()) return null;

  const rbacGranted = rbacResult.decision === "granted";
  const abac = await evaluateAccess(buildAbacContext(request, options));
  const mismatch = rbacGranted !== abac.allowed;
  const verbose = isEnabled("platform.abac-shadow-verbose");

  if (mismatch || verbose) {
    await AuditEngine.write({
      productKey: "platform",
      sourceSystem: "abac_shadow",
      platformOrganizationId: request.organizationId,
      actorId: request.userId,
      action: mismatch ? "auth.abac.shadow.mismatch" : "auth.abac.shadow.evaluated",
      targetType: request.resource,
      targetId: request.resourceId ?? request.resource,
      severity: mismatch ? "warning" : "info",
      metadata: {
        rbacGranted,
        abacAllowed: abac.allowed,
        policyName: abac.policyName,
        deniedByDefault: abac.deniedByDefault,
        accessAction: request.action,
        crossTenantAttempt: options?.crossTenantAttempt ?? false,
        abacAttributes: options?.abacAttributes,
      },
    }).catch(() => {});
  }

  return {
    enabled: true,
    rbacGranted,
    abacAllowed: abac.allowed,
    mismatch,
    policyName: abac.policyName,
    deniedByDefault: abac.deniedByDefault,
  };
}

export const AbacShadow = {
  evaluate: runAbacShadowEvaluation,
};
