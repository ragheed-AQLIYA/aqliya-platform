import "server-only";

import { evaluateAccess } from "@/lib/platform/abac/abac-service";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import type { AccessRequest } from "./types";

export type AbacGateOptions = {
  resourceSensitivity?: string;
  abacAttributes?: Record<string, string>;
};

export function buildAbacContext(
  request: AccessRequest,
  options?: AbacGateOptions,
) {
  return {
    userId: request.userId,
    organizationId: request.organizationId,
    roleIds: [] as string[],
    roleSlugs: request.role ? [String(request.role).toLowerCase()] : [],
    resourceType: request.resource,
    resourceId: request.resourceId,
    resourceSensitivity: options?.resourceSensitivity,
    action: request.action,
    attributes: options?.abacAttributes,
  };
}

function parseEnforceOrgIds(): Set<string> {
  const raw = process.env.ABAC_ENFORCE_ORG_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function listAbacEnforceOrgIds(): string[] {
  return [...parseEnforceOrgIds()];
}

export function isAbacEnforceEnabledForOrg(organizationId: string): boolean {
  if (!isEnabled("platform.abac-enforce")) return false;
  const allowlist = parseEnforceOrgIds();
  if (allowlist.size === 0) return false;
  return allowlist.has(organizationId);
}

export async function getAbacEnforceDenialReason(
  request: AccessRequest,
  options?: AbacGateOptions,
): Promise<string | null> {
  if (!isAbacEnforceEnabledForOrg(request.organizationId)) return null;

  const abac = await evaluateAccess(buildAbacContext(request, options));
  if (abac.allowed) return null;

  return abac.policyName
    ? `ABAC policy denied: ${abac.policyName}`
    : "ABAC access denied";
}
