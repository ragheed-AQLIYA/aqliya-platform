// ─── SCIM Provisioning Service ───
// Tenant-scoped SCIM v2 operations for User and Group provisioning.
// All mutations are logged to ScimProvisioningEvent and PlatformAuditLog.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  SCIM_CORE_USER_SCHEMA,
  SCIM_CORE_GROUP_SCHEMA,
  SCIM_CONTENT_TYPE,
  type ScimUser,
  type ScimGroup,
} from "./scim-types";

// ─── Helpers ───

function toISO(date: Date): string {
  return date.toISOString();
}

function buildUserMeta(userId: string, basePath: string): Record<string, unknown> {
  return {
    resourceType: "User",
    created: toISO(new Date()),
    lastModified: toISO(new Date()),
    location: `${basePath}/Users/${userId}`,
  };
}

function buildGroupMeta(groupId: string, basePath: string): Record<string, unknown> {
  return {
    resourceType: "Group",
    created: toISO(new Date()),
    lastModified: toISO(new Date()),
    location: `${basePath}/Groups/${groupId}`,
  };
}

function userToScimUser(user: {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
  externalId?: string | null;
}): ScimUser {
  return {
    schemas: [SCIM_CORE_USER_SCHEMA],
    id: user.id,
    externalId: user.externalId ?? undefined,
    userName: user.email,
    name: {
      formatted: user.name,
      givenName: user.name.split(" ")[0] || user.name,
      familyName: user.name.split(" ").slice(1).join(" ") || undefined,
    },
    displayName: user.name,
    emails: [{ value: user.email, primary: true, type: "work" }],
    active: true,
    roles: user.role ? [{ value: user.role, type: "organization" }] : undefined,
  };
}

// ─── Audit helper ───

async function recordScimEvent(params: {
  organizationId: string;
  direction: string;
  resourceType: string;
  operation: string;
  externalId?: string;
  localId?: string;
  requestBody?: unknown;
  responseStatus?: number;
  responseBody?: unknown;
  success: boolean;
  errorMessage?: string;
  performedById?: string;
}): Promise<void> {
  try {
    await prisma.scimProvisioningEvent.create({
      data: {
        organizationId: params.organizationId,
        direction: params.direction,
        resourceType: params.resourceType,
        operation: params.operation,
        externalId: params.externalId ?? null,
        localId: params.localId ?? null,
        requestBody: (params.requestBody ?? undefined) as Prisma.InputJsonValue | undefined,
        responseStatus: params.responseStatus ?? null,
        responseBody: (params.responseBody ?? undefined) as Prisma.InputJsonValue | undefined,
        success: params.success,
        errorMessage: params.errorMessage ?? null,
        performedById: params.performedById ?? null,
      },
    });
  } catch {
    // Never throw from audit — log and continue
    console.warn("[ScimProvisioningEvent] Failed to record event");
  }
}

async function recordPlatformAudit(params: {
  organizationId: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await writePlatformAuditLog({
    productKey: "platform",
    action: params.action,
    platformOrganizationId: params.organizationId,
    targetType: params.targetType,
    targetId: params.targetId,
    targetLabel: params.targetLabel,
    actorId: params.actorId,
    actorType: "scim_api",
    metadata: params.metadata,
  });
}

// ─── User Operations ───

export async function listUsers(
  organizationId: string,
  filter?: string,
  startIndex = 1,
  count = 100,
): Promise<{ Resources: ScimUser[]; totalResults: number; startIndex: number; itemsPerPage: number }> {
  const safeCount = Math.min(Math.max(count, 1), 1000);
  const safeStart = Math.max(startIndex, 1);

  const where: Prisma.UserWhereInput = { organizationId };

  // Simple filter: only "userName eq" or "email eq" supported
  if (filter) {
    const userNameMatch = filter.match(/^userName\s+eq\s+"(.+)"$/i);
    const emailMatch = filter.match(/^email\s+eq\s+"(.+)"$/i);
    if (userNameMatch) {
      where.email = { contains: userNameMatch[1] };
    } else if (emailMatch) {
      where.email = { contains: emailMatch[1] };
    }
  }

  const totalResults = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    skip: safeStart - 1,
    take: safeCount,
  });

  return {
    Resources: users.map(userToScimUser),
    totalResults,
    startIndex: safeStart,
    itemsPerPage: safeCount,
  };
}

export async function getUser(
  organizationId: string,
  externalId: string,
): Promise<ScimUser | null> {
  const user = await prisma.user.findFirst({
    where: { id: externalId, organizationId },
  });
  return user ? userToScimUser(user) : null;
}

export async function createUser(
  organizationId: string,
  userData: Record<string, unknown>,
  performedById?: string,
): Promise<{ scimUser: ScimUser; created: boolean }> {
  const email = extractString(userData, "userName") || extractEmail(userData);
  const name = extractString(userData, "displayName") || extractString(userData, "name.formatted") || email?.split("@")[0] || "Unknown";
  const displayName = extractString(userData, "displayName") || name;
  const active = userData.active !== false;

  if (!email) {
    throw new Error("userName or email is required");
  }

  // Check for existing user
  const existing = await prisma.user.findFirst({
    where: { email, organizationId },
  });

  if (existing) {
    // Update instead
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: displayName,
        image: extractString(userData, "profileUrl") || undefined,
        emailVerified: userData.active !== false ? new Date() : undefined,
      },
    });

    await recordScimEvent({
      organizationId,
      direction: "inbound",
      resourceType: "User",
      operation: "PUT",
      externalId: existing.id,
      localId: existing.id,
      requestBody: userData,
      success: true,
      performedById,
    });

    await recordPlatformAudit({
      organizationId,
      action: "scim.user.updated",
      targetType: "User",
      targetId: existing.id,
      targetLabel: email,
      actorId: performedById,
    });

    return { scimUser: userToScimUser(updated), created: false };
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      name: displayName,
      organizationId,
      role: extractString(userData, "roles[0].value") as "ADMIN" | "OPERATOR" | "VIEWER" | undefined ?? "OPERATOR",
      emailVerified: active ? new Date() : undefined,
      image: extractString(userData, "profileUrl") || undefined,
    } as unknown as Prisma.UserCreateInput,
  });

  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "User",
    operation: "POST",
    externalId: user.id,
    localId: user.id,
    requestBody: userData,
    responseStatus: 201,
    success: true,
    performedById,
  });

  await recordPlatformAudit({
    organizationId,
    action: "scim.user.created",
    targetType: "User",
    targetId: user.id,
    targetLabel: email,
    actorId: performedById,
  });

  return { scimUser: userToScimUser(user), created: true };
}

export async function updateUser(
  organizationId: string,
  externalId: string,
  userData: Record<string, unknown>,
  performedById?: string,
): Promise<ScimUser | null> {
  const existing = await prisma.user.findFirst({
    where: { id: externalId, organizationId },
  });

  if (!existing) return null;

  const updateData: Prisma.UserUpdateInput = {};

  const userName = extractString(userData, "userName");
  if (userName) {
    updateData.email = userName;
  }

  const displayName = extractString(userData, "displayName");
  if (displayName) {
    updateData.name = displayName;
  }

  if (typeof userData.active === "boolean") {
    updateData.emailVerified = userData.active ? new Date() : null;
  }

  const profileUrl = extractString(userData, "profileUrl");
  if (profileUrl) {
    updateData.image = profileUrl;
  }

  const role = extractString(userData, "roles[0].value");
  if (role && ["ADMIN", "OPERATOR", "VIEWER"].includes(role)) {
    updateData.role = role as "ADMIN" | "OPERATOR" | "VIEWER";
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: updateData,
  });

  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "User",
    operation: "PUT",
    externalId,
    localId: existing.id,
    requestBody: userData,
    success: true,
    performedById,
  });

  await recordPlatformAudit({
    organizationId,
    action: "scim.user.updated",
    targetType: "User",
    targetId: existing.id,
    targetLabel: existing.email,
    actorId: performedById,
  });

  return userToScimUser(updated);
}

export async function patchUser(
  organizationId: string,
  externalId: string,
  patchData: { Operations: Array<{ op: string; path?: string; value: unknown }> },
  performedById?: string,
): Promise<ScimUser | null> {
  const existing = await prisma.user.findFirst({
    where: { id: externalId, organizationId },
  });
  if (!existing) return null;

  const updateData: Prisma.UserUpdateInput = {};

  for (const op of patchData.Operations) {
    if (op.op === "replace" || op.op === "add") {
      if (op.path === "active" || op.path === "urn:ietf:params:scim:schemas:core:2.0:User:active") {
        updateData.emailVerified = op.value ? new Date() : null;
      } else if (op.path === "displayName") {
        updateData.name = String(op.value);
      } else if (op.path === "userName" || op.path === "emails[type eq \"work\"].value") {
        updateData.email = String(op.value);
      } else if (op.path === "name.formatted") {
        updateData.name = String(op.value);
      } else if (!op.path && typeof op.value === "object" && op.value !== null) {
        const val = op.value as Record<string, unknown>;
        if (val.userName) updateData.email = String(val.userName);
        if (val.displayName) updateData.name = String(val.displayName);
        if (typeof val.active === "boolean") {
          updateData.emailVerified = val.active ? new Date() : null;
        }
      }
    } else if (op.op === "remove") {
      if (op.path === "active") {
        updateData.emailVerified = null;
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: updateData,
  });

  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "User",
    operation: "PATCH",
    externalId,
    localId: existing.id,
    requestBody: patchData,
    success: true,
    performedById,
  });

  await recordPlatformAudit({
    organizationId,
    action: "scim.user.patched",
    targetType: "User",
    targetId: existing.id,
    targetLabel: existing.email,
    actorId: performedById,
    metadata: { operations: patchData.Operations.length },
  });

  return userToScimUser(updated);
}

export async function deleteUser(
  organizationId: string,
  externalId: string,
  performedById?: string,
): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: { id: externalId, organizationId },
  });
  if (!existing) return false;

  // Soft-deactivate: clear emailVerified to mark inactive
  await prisma.user.update({
    where: { id: existing.id },
    data: { emailVerified: null },
  });

  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "User",
    operation: "DELETE",
    externalId,
    localId: existing.id,
    success: true,
    performedById,
  });

  await recordPlatformAudit({
    organizationId,
    action: "scim.user.deactivated",
    targetType: "User",
    targetId: existing.id,
    targetLabel: existing.email,
    actorId: performedById,
  });

  return true;
}

// ─── Group Operations (stub — Groups are user-defined in AQLIYA) ───

export async function listGroups(
  organizationId: string,
  _filter?: string,
  startIndex = 1,
  count = 100,
): Promise<{ Resources: ScimGroup[]; totalResults: number; startIndex: number; itemsPerPage: number }> {
  const safeCount = Math.min(Math.max(count, 1), 1000);
  const safeStart = Math.max(startIndex, 1);

  // AQLIYA doesn't have a native Group model — return empty
  return {
    Resources: [],
    totalResults: 0,
    startIndex: safeStart,
    itemsPerPage: safeCount,
  };
}

export async function getGroup(
  _organizationId: string,
  _externalId: string,
): Promise<ScimGroup | null> {
  return null;
}

export async function createGroup(
  organizationId: string,
  groupData: Record<string, unknown>,
  performedById?: string,
): Promise<ScimGroup> {
  const _group: ScimGroup = {
    schemas: [SCIM_CORE_GROUP_SCHEMA],
    displayName: extractString(groupData, "displayName") || "Unnamed Group",
  };

  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "Group",
    operation: "POST",
    requestBody: groupData,
    success: true,
    performedById,
  });

  await recordPlatformAudit({
    organizationId,
    action: "scim.group.created",
    targetType: "Group",
    targetId: "stub",
    targetLabel: _group.displayName,
    actorId: performedById,
    metadata: { note: "Groups not natively supported in AQLIYA" },
  });

  return _group;
}

export async function updateGroup(
  organizationId: string,
  externalId: string,
  groupData: Record<string, unknown>,
  performedById?: string,
): Promise<ScimGroup | null> {
  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "Group",
    operation: "PUT",
    externalId,
    requestBody: groupData,
    success: true,
    performedById,
  });
  return { schemas: [SCIM_CORE_GROUP_SCHEMA], displayName: extractString(groupData, "displayName") || "Unnamed Group" };
}

export async function deleteGroup(
  organizationId: string,
  externalId: string,
  performedById?: string,
): Promise<boolean> {
  await recordScimEvent({
    organizationId,
    direction: "inbound",
    resourceType: "Group",
    operation: "DELETE",
    externalId,
    success: true,
    performedById,
  });
  return true;
}

// ─── Internal Helpers ───

function extractString(data: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = data;
  for (const part of parts) {
    // Handle array notation like roles[0].value
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      if (typeof current === "object" && current !== null && Array.isArray((current as Record<string, unknown>)[key])) {
        current = (current as Record<string, unknown>)[key] as Array<unknown>;
        const idx = parseInt(index, 10);
        if (idx >= 0 && idx < (current as Array<unknown>).length) {
          current = (current as Array<unknown>)[idx];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } else if (typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function extractEmail(data: Record<string, unknown>): string | undefined {
  const emails = data.emails;
  if (Array.isArray(emails) && emails.length > 0) {
    const primary = emails.find((e: Record<string, unknown>) => e.primary === true);
    return primary?.value as string | undefined;
  }
  return undefined;
}
