// ─── ClientWorkspace Context ───
// Read-only helpers for resolving ClientWorkspace from various identifiers.
// Does not modify database records, auth sessions, or tenant guards.

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface ClientWorkspaceContext {
  clientWorkspaceId: string;
  platformOrganizationId: string;
  name: string;
  slug: string;
  workspaceType: string;
  status: string;
  productAccess: Record<string, boolean> | null;
  source: "workspace_id" | "slug" | "audit_client";
  auditClientId: string | null;
}

export type ClientWorkspaceLookup =
  | { type: "workspace_id"; value: string }
  | { type: "slug"; platformOrganizationId: string; slug: string }
  | { type: "audit_client_id"; value: string };

// ─── Error Classes ───

export class ClientWorkspaceNotFoundError extends Error {
  constructor(lookup: string) {
    super(`ClientWorkspace not found: ${lookup}`);
    this.name = "ClientWorkspaceNotFoundError";
  }
}

export class ClientWorkspaceUnlinkedError extends Error {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} ${entityId} is not linked to any ClientWorkspace`);
    this.name = "ClientWorkspaceUnlinkedError";
  }
}

export class ClientWorkspaceInactiveError extends Error {
  constructor(clientWorkspaceId: string, status: string) {
    super(`ClientWorkspace ${clientWorkspaceId} has status "${status}"`);
    this.name = "ClientWorkspaceInactiveError";
  }
}

// ─── Core Helpers ───

function toContext(
  ws: {
    id: string;
    platformOrganizationId: string;
    name: string;
    slug: string;
    workspaceType: string;
    status: string;
    productAccess: unknown;
  },
  source: ClientWorkspaceContext["source"],
  auditClientId: string | null,
): ClientWorkspaceContext {
  const pa = ws.productAccess as Record<string, boolean> | null;
  return {
    clientWorkspaceId: ws.id,
    platformOrganizationId: ws.platformOrganizationId,
    name: ws.name,
    slug: ws.slug,
    workspaceType: ws.workspaceType,
    status: ws.status,
    productAccess: pa,
    source,
    auditClientId,
  };
}

export async function getClientWorkspaceById(
  clientWorkspaceId: string,
): Promise<ClientWorkspaceContext> {
  const ws = await prisma.clientWorkspace.findUnique({
    where: { id: clientWorkspaceId },
  });

  if (!ws) {
    throw new ClientWorkspaceNotFoundError(`id="${clientWorkspaceId}"`);
  }

  return toContext(ws, "workspace_id", null);
}

export async function getClientWorkspaceBySlug(
  platformOrganizationId: string,
  slug: string,
): Promise<ClientWorkspaceContext> {
  const ws = await prisma.clientWorkspace.findFirst({
    where: { platformOrganizationId, slug },
  });

  if (!ws) {
    throw new ClientWorkspaceNotFoundError(
      `slug="${slug}" for org="${platformOrganizationId}"`,
    );
  }

  return toContext(ws, "slug", null);
}

export async function getClientWorkspaceByAuditClientId(
  auditClientId: string,
): Promise<ClientWorkspaceContext> {
  const client = await prisma.auditClient.findUnique({
    where: { id: auditClientId },
    select: {
      clientWorkspaceId: true,
      clientWorkspace: {
        select: {
          id: true,
          platformOrganizationId: true,
          name: true,
          slug: true,
          workspaceType: true,
          status: true,
          productAccess: true,
        },
      },
    },
  });

  if (!client) {
    throw new ClientWorkspaceNotFoundError(
      `auditClient id="${auditClientId}" not found`,
    );
  }

  if (!client.clientWorkspace || !client.clientWorkspaceId) {
    throw new ClientWorkspaceUnlinkedError("AuditClient", auditClientId);
  }

  return toContext(client.clientWorkspace, "audit_client", auditClientId);
}

export async function listClientWorkspacesForPlatformOrganization(
  platformOrganizationId: string,
): Promise<ClientWorkspaceContext[]> {
  const workspaces = await prisma.clientWorkspace.findMany({
    where: { platformOrganizationId },
    orderBy: { name: "asc" },
  });

  return workspaces.map((ws) => toContext(ws, "workspace_id", null));
}

export async function resolveClientWorkspaceContext(
  lookup: ClientWorkspaceLookup,
): Promise<ClientWorkspaceContext> {
  switch (lookup.type) {
    case "workspace_id":
      return getClientWorkspaceById(lookup.value);
    case "slug":
      return getClientWorkspaceBySlug(
        lookup.platformOrganizationId,
        lookup.slug,
      );
    case "audit_client_id":
      return getClientWorkspaceByAuditClientId(lookup.value);
  }
}

export async function assertClientWorkspaceLinked(
  lookup: ClientWorkspaceLookup,
  options?: { requireActive?: boolean },
): Promise<ClientWorkspaceContext> {
  const ctx = await resolveClientWorkspaceContext(lookup);

  if (options?.requireActive && ctx.status !== "active") {
    throw new ClientWorkspaceInactiveError(ctx.clientWorkspaceId, ctx.status);
  }

  return ctx;
}
