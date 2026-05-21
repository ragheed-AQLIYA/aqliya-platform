// ─── Platform Organization Guard (Report-Only Mode) ───
// Diagnoses platform organization consistency without enforcing access globally.
// Default mode is report-only / non-blocking.

import type { CurrentUser } from "@/lib/auth";
import { getPlatformOrganizationByLegacyOrganizationId } from "@/lib/platform/platform-organization-context";

// ─── Types ───

export interface PlatformOrgGuardReport {
  ok: boolean;
  severity: "ok" | "warning" | "error";
  platformOrganizationId: string | null;
  resolvedPlatformOrganizationId: string | null;
  slug: string | null;
  warnings: string[];
  errors: string[];
}

export interface PlatformOrgGuardOptions {
  /**
   * If true, requirePlatformOrganization throws instead of returning a report.
   * Default: false (report-only)
   */
  throwOnError?: boolean;

  /**
   * If true, check that the PlatformOrganization status is "active".
   * Default: false
   */
  requireActive?: boolean;
}

// ─── Guard Report ───

/**
 * Generate a platform organization guard report for the current user.
 * Non-blocking by default — returns diagnostics without throwing.
 */
export async function getPlatformOrgGuardReport(
  currentUser: CurrentUser,
  options?: PlatformOrgGuardOptions,
): Promise<PlatformOrgGuardReport> {
  const report: PlatformOrgGuardReport = {
    ok: true,
    severity: "ok",
    platformOrganizationId: currentUser.platformOrganizationId ?? null,
    resolvedPlatformOrganizationId: null,
    slug: null,
    warnings: [],
    errors: [],
  };

  // Check 1: session has platformOrganizationId
  if (!currentUser.platformOrganizationId) {
    report.ok = false;
    report.severity = "warning";
    report.warnings.push("Session does not include platformOrganizationId");
  }

  // Check 2: legacy organization resolves to PlatformOrganization
  let resolved = null;
  try {
    resolved = await getPlatformOrganizationByLegacyOrganizationId(
      currentUser.organizationId,
    );
    report.resolvedPlatformOrganizationId = resolved.platformOrganizationId;
    report.slug = resolved.slug;
  } catch {
    report.ok = false;
    report.severity = "error";
    report.errors.push(
      `Legacy Organization ${currentUser.organizationId} is not linked to any PlatformOrganization`,
    );
  }

  // Check 3: session platformOrganizationId matches resolved PlatformOrganization
  if (
    resolved &&
    currentUser.platformOrganizationId &&
    currentUser.platformOrganizationId !== resolved.platformOrganizationId
  ) {
    report.ok = false;
    report.severity = "error";
    report.warnings.push(
      `Session platformOrganizationId (${currentUser.platformOrganizationId}) does not match resolved (${resolved.platformOrganizationId})`,
    );
  }

  // Check 4: PlatformOrganization status is active
  if (options?.requireActive && resolved && resolved.status !== "active") {
    report.ok = false;
    report.severity = "warning";
    report.warnings.push(
      `PlatformOrganization has status "${resolved.status}"`,
    );
  }

  if (options?.throwOnError && !report.ok) {
    const messages = [...report.errors, ...report.warnings];
    throw new Error(
      `Platform organization guard failed: ${messages.join("; ")}`,
    );
  }

  return report;
}

/**
 * Assert platform organization context for the current user.
 * Report-only by default — returns report without throwing.
 * Set throwOnError: true to make it blocking.
 */
export async function assertPlatformOrgContext(
  currentUser: CurrentUser,
  options?: PlatformOrgGuardOptions,
): Promise<PlatformOrgGuardReport> {
  return getPlatformOrgGuardReport(currentUser, options);
}

/**
 * Require a valid platform organization context.
 * Always throws on failure — use for routes that require platform org.
 * NOT yet wired into any existing routes.
 */
export async function requirePlatformOrganization(
  currentUser: CurrentUser,
  options?: Omit<PlatformOrgGuardOptions, "throwOnError">,
): Promise<PlatformOrgGuardReport> {
  return getPlatformOrgGuardReport(currentUser, {
    ...options,
    throwOnError: true,
  });
}
