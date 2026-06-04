"use server"

import { requireUserContext } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { requireEnabled } from "@/lib/platform/feature-flags/registry"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

export interface TenantListResult {
  id: string
  slug: string
  name: string
  displayName: string | null
  status: string
  organizationCount: number
  createdAt: string
  updatedAt: string
}

export interface TenantDetailResult {
  id: string
  slug: string
  name: string
  displayName: string | null
  status: string
  metadata: Record<string, unknown> | null
  organizationCount: number
  clientWorkspaceCount: number
  createdById: string | null
  createdAt: string
  updatedAt: string
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

async function resolveActorPlatformOrgId(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { platformOrganizationId: true },
  })
  if (!org?.platformOrganizationId) {
    throw new Error("Access denied: organization is not linked to a platform tenant")
  }
  return org.platformOrganizationId
}

async function assertPlatformOrgAccess(
  platformOrgId: string,
  actorOrganizationId: string,
): Promise<void> {
  const allowed = await resolveActorPlatformOrgId(actorOrganizationId)
  if (platformOrgId !== allowed) {
    throw new Error("Access denied: platform organization mismatch")
  }
}

export async function listTenantsAction(): Promise<TenantListResult[]> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")
  const platformOrgId = await resolveActorPlatformOrgId(user.organizationId)

  const orgs = await prisma.platformOrganization.findMany({
    where: { id: platformOrgId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { organizations: true } },
    },
  })

  return orgs.map((o) => ({
    id: o.id,
    slug: o.slug,
    name: o.name,
    displayName: o.displayName,
    status: o.status,
    organizationCount: o._count.organizations,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }))
}

export async function getTenantAction(id: string): Promise<TenantDetailResult | null> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")
  await assertPlatformOrgAccess(id, user.organizationId)

  const org = await prisma.platformOrganization.findUnique({
    where: { id },
    include: {
      _count: {
        select: { organizations: true, clientWorkspaces: true },
      },
    },
  })

  if (!org) return null

  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    displayName: org.displayName,
    status: org.status,
    metadata: org.metadata as Record<string, unknown> | null,
    organizationCount: org._count.organizations,
    clientWorkspaceCount: org._count.clientWorkspaces,
    createdById: org.createdById,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  }
}

export interface CreateTenantInput {
  name: string
  slug?: string
  displayName?: string
}

export async function createTenantAction(input: CreateTenantInput): Promise<{ id: string; slug: string }> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")

  const slug = input.slug || toSlug(input.name)

  const existing = await prisma.platformOrganization.findUnique({ where: { slug } })
  if (existing) {
    throw new Error(`Organization with slug "${slug}" already exists`)
  }

  const org = await prisma.platformOrganization.create({
    data: {
      slug,
      name: input.name,
      displayName: input.displayName || input.name,
      status: "active",
      createdById: user.id,
    },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "tenant.create",
    targetType: "platform_organization",
    targetId: org.id,
    actorId: user.id,
    severity: "info",
    status: "recorded",
    sourceSystem: "tenant_actions",
    metadata: { slug, name: input.name },
  })

  revalidatePath("/organizations")
  return { id: org.id, slug: org.slug }
}

export interface UpdateTenantInput {
  name?: string
  displayName?: string
  status?: "active" | "suspended" | "archived"
}

export async function updateTenantAction(
  id: string,
  input: UpdateTenantInput,
): Promise<void> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")
  await assertPlatformOrgAccess(id, user.organizationId)

  const existing = await prisma.platformOrganization.findUnique({ where: { id } })
  if (!existing) throw new Error("Organization not found")

  const data: Prisma.PlatformOrganizationUpdateInput = {}

  if (input.name !== undefined) data.name = input.name
  if (input.displayName !== undefined) data.displayName = input.displayName
  if (input.status !== undefined) data.status = input.status

  await prisma.platformOrganization.update({
    where: { id },
    data,
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "tenant.update",
    targetType: "platform_organization",
    targetId: id,
    actorId: user.id,
    severity: "info",
    status: "recorded",
    sourceSystem: "tenant_actions",
    metadata: {
      changes: {
        ...(input.name !== undefined && { name: { from: existing.name, to: input.name } }),
        ...(input.status !== undefined && { status: { from: existing.status, to: input.status } }),
      },
    },
  })

  revalidatePath("/organizations")
  revalidatePath(`/organizations/${id}`)
}

export async function archiveTenantAction(id: string): Promise<void> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")
  await assertPlatformOrgAccess(id, user.organizationId)

  const existing = await prisma.platformOrganization.findUnique({ where: { id } })
  if (!existing) throw new Error("Organization not found")

  await prisma.platformOrganization.update({
    where: { id },
    data: { status: "archived" },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "tenant.archive",
    targetType: "platform_organization",
    targetId: id,
    actorId: user.id,
    severity: "warn",
    status: "recorded",
    sourceSystem: "tenant_actions",
    metadata: { previousStatus: existing.status, newStatus: "archived" },
  })

  revalidatePath("/organizations")
}

export async function activateTenantAction(id: string): Promise<void> {
  requireEnabled("tenant.lifecycle")
  const user = await requireUserContext("ADMIN")
  await assertPlatformOrgAccess(id, user.organizationId)

  const existing = await prisma.platformOrganization.findUnique({ where: { id } })
  if (!existing) throw new Error("Organization not found")

  await prisma.platformOrganization.update({
    where: { id },
    data: { status: "active" },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "tenant.activate",
    targetType: "platform_organization",
    targetId: id,
    actorId: user.id,
    severity: "info",
    status: "recorded",
    sourceSystem: "tenant_actions",
    metadata: { previousStatus: existing.status, newStatus: "active" },
  })

  revalidatePath("/organizations")
}
