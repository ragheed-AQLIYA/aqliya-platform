import type { UserRole } from "@prisma/client";

import type { AuditLedgerEntry } from "@/core/audit/types";
import { logger } from "@/lib/platform/logger";
import type { RequiredRole } from "@/lib/auth";
import type { AccessAction, AccessRequest, AccessResult } from "./types";

const ACTION_MIN_ROLE: Partial<Record<AccessAction, RequiredRole>> = {
  admin: "ADMIN",
  delete: "OPERATOR",
  approve: "ADMIN",
  reject: "ADMIN",
  create: "OPERATOR",
  update: "OPERATOR",
  export: "VIEWER",
  read: "VIEWER",
};

function roleSatisfies(
  role: UserRole | null | undefined,
  requiredRole: RequiredRole,
): boolean {
  if (!role) return false;
  if (requiredRole === "ADMIN") return role === "ADMIN";
  if (requiredRole === "OPERATOR") {
    return role === "OPERATOR" || role === "ADMIN";
  }
  return role === "VIEWER" || role === "OPERATOR" || role === "ADMIN";
}

/** Core RBAC gate — deny-by-default; coarse role matrix per action. */
export class CoreAccessControl {
  constructor(
    private readonly ledger?: {
      write(entry: AuditLedgerEntry): Promise<void>;
    },
  ) {}

  async check(request: AccessRequest): Promise<AccessResult> {
    const required =
      request.requiredRole ?? ACTION_MIN_ROLE[request.action] ?? null;

    let result: AccessResult;

    if (!required) {
      result = {
        decision: "denied",
        reason: `Unknown action: '${request.action}'`,
      };
    } else if (!roleSatisfies(request.role, required)) {
      result = {
        decision: "denied",
        reason: `Requires ${required} role for '${request.action}' on '${request.resource}'`,
      };
    } else {
      result = { decision: "granted" };
    }

    if (result.decision === "denied") {
      await this.auditDenial(request, result, required);
    }

    return result;
  }

  private async auditDenial(
    request: AccessRequest,
    result: AccessResult,
    required: RequiredRole | null,
  ): Promise<void> {
    logger.warn("Core access denied", {
      module: "core-access-control",
      userId: request.userId,
      organizationId: request.organizationId,
      metadata: {
        resource: request.resource,
        action: request.action,
        role: request.role ?? null,
        requiredRole: required,
        reason: result.reason,
      },
    });

    if (!this.ledger) return;

    try {
      await this.ledger.write({
        tenantId: request.organizationId,
        productKey: "platform",
        action: "core.access.denied",
        actorId: request.userId,
        actorRole: request.role ?? "unknown",
        resourceType: String(request.resource),
        resourceId: request.resourceId ?? request.resource,
        category: "governance",
        severity: "warning",
        summary: result.reason ?? "Core access denied",
        metadata: {
          action: request.action,
          requiredRole: required,
        },
      });
    } catch {
      // Fail-soft: audit must not flip authorization outcome.
    }
  }
}
