// ─── Platform Organization Context ───
// Read-only helpers for resolving PlatformOrganization from legacy identifiers.
// Does not modify database records, auth sessions, or tenant guards.

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface PlatformOrganizationContext {
  platformOrganizationId: string;
  slug: string;
  name: string;
  displayName: string | null;
  status: string;
  source:
    | "platform_org_id"
    | "slug"
    | "legacy_organization"
    | "audit_organization";
  legacyOrganizationId: string | null;
  auditOrganizationId: string | null;
}

export type PlatformOrganizationLookup =
  | { type: "platform_org_id"; value: string }
  | { type: "slug"; value: string }
  | { type: "legacy_organization_id"; value: string }
  | { type: "audit_organization_id"; value: string };

// ─── Error Classes ───

export class PlatformOrganizationNotFoundError extends Error {
  constructor(lookup: string) {
    super(`PlatformOrganization not found: ${lookup}`);
    this.name = "PlatformOrganizationNotFoundError";
  }
}

export class PlatformOrganizationUnlinkedError extends Error {
  constructor(entityType: string, entityId: string) {
    super(
      `${entityType} ${entityId} is not linked to any PlatformOrganization`,
    );
    this.name = "PlatformOrganizationUnlinkedError";
  }
}

export class PlatformOrganizationInactiveError extends Error {
  constructor(platformOrganizationId: string, status: string) {
    super(
      `PlatformOrganization ${platformOrganizationId} has status "${status}"`,
    );
    this.name = "PlatformOrganizationInactiveError";
  }
}

// ─── Core Helpers ───

function toContext(
  po: {
    id: string;
    slug: string;
    name: string;
    displayName: string | null;
    status: string;
  },
  source: PlatformOrganizationContext["source"],
  legacyOrganizationId: string | null,
  auditOrganizationId: string | null,
): PlatformOrganizationContext {
  return {
    platformOrganizationId: po.id,
    slug: po.slug,
    name: po.name,
    displayName: po.displayName,
    status: po.status,
    source,
    legacyOrganizationId,
    auditOrganizationId,
  };
}

export async function getPlatformOrganizationById(
  platformOrganizationId: string,
): Promise<PlatformOrganizationContext> {
  const po = await prisma.platformOrganization.findUnique({
    where: { id: platformOrganizationId },
  });

  if (!po) {
    throw new PlatformOrganizationNotFoundError(
      `id="${platformOrganizationId}"`,
    );
  }

  return toContext(po, "platform_org_id", null, null);
}

export async function getPlatformOrganizationBySlug(
  slug: string,
): Promise<PlatformOrganizationContext> {
  const po = await prisma.platformOrganization.findUnique({
    where: { slug },
  });

  if (!po) {
    throw new PlatformOrganizationNotFoundError(`slug="${slug}"`);
  }

  return toContext(po, "slug", null, null);
}

export async function getPlatformOrganizationByLegacyOrganizationId(
  organizationId: string,
): Promise<PlatformOrganizationContext> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      platformOrganizationId: true,
      platformOrganization: {
        select: {
          id: true,
          slug: true,
          name: true,
          displayName: true,
          status: true,
        },
      },
    },
  });

  if (!org) {
    throw new PlatformOrganizationNotFoundError(
      `legacy Organization id="${organizationId}" not found`,
    );
  }

  if (!org.platformOrganization || !org.platformOrganizationId) {
    throw new PlatformOrganizationUnlinkedError("Organization", organizationId);
  }

  return toContext(
    org.platformOrganization,
    "legacy_organization",
    organizationId,
    null,
  );
}

export async function getPlatformOrganizationByAuditOrganizationId(
  auditOrganizationId: string,
): Promise<PlatformOrganizationContext> {
  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: auditOrganizationId },
    select: {
      platformOrganizationId: true,
      platformOrganization: {
        select: {
          id: true,
          slug: true,
          name: true,
          displayName: true,
          status: true,
        },
      },
    },
  });

  if (!auditOrg) {
    throw new PlatformOrganizationNotFoundError(
      `AuditOrganization id="${auditOrganizationId}" not found`,
    );
  }

  if (!auditOrg.platformOrganization || !auditOrg.platformOrganizationId) {
    throw new PlatformOrganizationUnlinkedError(
      "AuditOrganization",
      auditOrganizationId,
    );
  }

  return toContext(
    auditOrg.platformOrganization,
    "audit_organization",
    null,
    auditOrganizationId,
  );
}

/**
 * Resolve PlatformOrganization from any supported lookup type.
 * Priority: platform_org_id → slug → legacy_organization_id → audit_organization_id
 */
export async function resolvePlatformOrganizationContext(
  lookup: PlatformOrganizationLookup,
): Promise<PlatformOrganizationContext> {
  switch (lookup.type) {
    case "platform_org_id":
      return getPlatformOrganizationById(lookup.value);
    case "slug":
      return getPlatformOrganizationBySlug(lookup.value);
    case "legacy_organization_id":
      return getPlatformOrganizationByLegacyOrganizationId(lookup.value);
    case "audit_organization_id":
      return getPlatformOrganizationByAuditOrganizationId(lookup.value);
  }
}

/**
 * Assert that a PlatformOrganization exists and is linked for the given lookup.
 * Throws PlatformOrganizationNotFoundError or PlatformOrganizationUnlinkedError on failure.
 * Optionally throws PlatformOrganizationInactiveError if status is not "active".
 */
export async function assertPlatformOrganizationLinked(
  lookup: PlatformOrganizationLookup,
  options?: { requireActive?: boolean },
): Promise<PlatformOrganizationContext> {
  const ctx = await resolvePlatformOrganizationContext(lookup);

  if (options?.requireActive && ctx.status !== "active") {
    throw new PlatformOrganizationInactiveError(
      ctx.platformOrganizationId,
      ctx.status,
    );
  }

  return ctx;
}
