// ─── خدمة RBAC المدعومة بقاعدة البيانات ───
// إدارة الأدوار والصلاحيات مع فحص فصل المهام وسجل التدقيق.

import { prisma } from "@/lib/prisma";
import { auditLogger, Product } from "../audit-logger";
import { validateAssignment } from "./sod-service";
import type { ValidateAssignmentResult } from "./sod-service";

// ─── Types ───

export interface AssignRoleOptions {
  workspaceId?: string;
  justification?: string;
  expiresAt?: Date;
}

export interface BatchAssignment {
  userId: string;
  roleId: string;
  organizationId: string;
  workspaceId?: string;
  justification?: string;
  expiresAt?: Date;
}

export interface AssignRoleResult {
  success: boolean;
  assignmentId?: string;
  sodCheck?: ValidateAssignmentResult;
  error?: string;
}

interface SystemPermissionMap {
  [roleSlug: string]: { group: string; slug: string }[];
}

const SYSTEM_ROLES: { slug: string; name: string }[] = [
  { slug: "admin", name: "Admin" },
  { slug: "manager", name: "Manager" },
  { slug: "operator", name: "Operator" },
  { slug: "viewer", name: "Viewer" },
];

const SYSTEM_PERMISSIONS: SystemPermissionMap = {
  admin: [
    { group: "audit.engagement", slug: "audit.engagement.admin" },
    { group: "audit.engagement", slug: "audit.engagement.read" },
    { group: "audit.engagement", slug: "audit.engagement.write" },
    { group: "audit.engagement", slug: "audit.engagement.delete" },
    { group: "audit.engagement", slug: "audit.engagement.export" },
    { group: "audit.evidence", slug: "audit.evidence.read" },
    { group: "audit.evidence", slug: "audit.evidence.write" },
    { group: "audit.evidence", slug: "audit.evidence.delete" },
    { group: "audit.evidence", slug: "audit.evidence.upload" },
    { group: "audit.evidence", slug: "audit.evidence.download" },
    { group: "audit.review", slug: "audit.review.read" },
    { group: "audit.review", slug: "audit.review.write" },
    { group: "audit.review", slug: "audit.review.approve" },
    { group: "audit.review", slug: "audit.review.reject" },
    { group: "decision", slug: "decision.admin" },
    { group: "decision", slug: "decision.read" },
    { group: "decision", slug: "decision.write" },
    { group: "decision", slug: "decision.delete" },
    { group: "decision", slug: "decision.approve" },
    { group: "decision", slug: "decision.reject" },
    { group: "decision", slug: "decision.export" },
    { group: "localcontent", slug: "localcontent.admin" },
    { group: "localcontent", slug: "localcontent.read" },
    { group: "localcontent", slug: "localcontent.write" },
    { group: "localcontent", slug: "localcontent.delete" },
    { group: "localcontent", slug: "localcontent.export" },
    { group: "settings", slug: "settings.admin" },
    { group: "settings", slug: "settings.read" },
    { group: "settings", slug: "settings.write" },
    { group: "user", slug: "user.admin" },
    { group: "user", slug: "user.read" },
    { group: "user", slug: "user.write" },
    { group: "user", slug: "user.manage_roles" },
    { group: "platform", slug: "platform.admin" },
    { group: "platform", slug: "platform.read" },
    { group: "platform", slug: "platform.manage_secrets" },
    { group: "platform", slug: "platform.manage_siem" },
    { group: "platform", slug: "platform.manage_retention" },
    { group: "workflow", slug: "workflow.admin" },
    { group: "workflow", slug: "workflow.read" },
    { group: "workflow", slug: "workflow.write" },
    { group: "workflow", slug: "workflow.delete" },
    { group: "workflow", slug: "workflow.execute" },
    { group: "workflow", slug: "workflow.export" },
  ],
  manager: [
    { group: "audit.engagement", slug: "audit.engagement.read" },
    { group: "audit.engagement", slug: "audit.engagement.write" },
    { group: "audit.engagement", slug: "audit.engagement.export" },
    { group: "audit.evidence", slug: "audit.evidence.read" },
    { group: "audit.evidence", slug: "audit.evidence.write" },
    { group: "audit.evidence", slug: "audit.evidence.upload" },
    { group: "audit.evidence", slug: "audit.evidence.download" },
    { group: "audit.review", slug: "audit.review.read" },
    { group: "audit.review", slug: "audit.review.write" },
    { group: "audit.review", slug: "audit.review.approve" },
    { group: "audit.review", slug: "audit.review.reject" },
    { group: "decision", slug: "decision.read" },
    { group: "decision", slug: "decision.write" },
    { group: "decision", slug: "decision.approve" },
    { group: "decision", slug: "decision.reject" },
    { group: "decision", slug: "decision.export" },
    { group: "localcontent", slug: "localcontent.read" },
    { group: "localcontent", slug: "localcontent.write" },
    { group: "localcontent", slug: "localcontent.export" },
    { group: "settings", slug: "settings.read" },
    { group: "settings", slug: "settings.write" },
    { group: "user", slug: "user.read" },
    { group: "platform", slug: "platform.read" },
    { group: "workflow", slug: "workflow.read" },
    { group: "workflow", slug: "workflow.write" },
    { group: "workflow", slug: "workflow.execute" },
    { group: "workflow", slug: "workflow.export" },
  ],
  operator: [
    { group: "audit.engagement", slug: "audit.engagement.read" },
    { group: "audit.engagement", slug: "audit.engagement.write" },
    { group: "audit.evidence", slug: "audit.evidence.read" },
    { group: "audit.evidence", slug: "audit.evidence.write" },
    { group: "audit.evidence", slug: "audit.evidence.upload" },
    { group: "audit.evidence", slug: "audit.evidence.download" },
    { group: "audit.review", slug: "audit.review.read" },
    { group: "audit.review", slug: "audit.review.write" },
    { group: "decision", slug: "decision.read" },
    { group: "decision", slug: "decision.write" },
    { group: "localcontent", slug: "localcontent.read" },
    { group: "localcontent", slug: "localcontent.write" },
    { group: "settings", slug: "settings.read" },
    { group: "user", slug: "user.read" },
    { group: "platform", slug: "platform.read" },
    { group: "workflow", slug: "workflow.read" },
    { group: "workflow", slug: "workflow.write" },
    { group: "workflow", slug: "workflow.execute" },
  ],
  viewer: [
    { group: "audit.engagement", slug: "audit.engagement.read" },
    { group: "audit.evidence", slug: "audit.evidence.read" },
    { group: "audit.review", slug: "audit.review.read" },
    { group: "decision", slug: "decision.read" },
    { group: "localcontent", slug: "localcontent.read" },
    { group: "settings", slug: "settings.read" },
    { group: "user", slug: "user.read" },
    { group: "platform", slug: "platform.read" },
    { group: "workflow", slug: "workflow.read" },
  ],
};

// ─── إنشاء أو ضمان وجود الأدوار النظامية ───

export async function getOrCreateSystemRoles(): Promise<void> {
  for (const roleDef of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: { name: roleDef.name },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        type: "SYSTEM",
        description: `System ${roleDef.name} role`,
      },
    });

    const perms = SYSTEM_PERMISSIONS[roleDef.slug] ?? [];
    for (const permDef of perms) {
      const slug = permDef.slug;
      const perm = await prisma.permission.upsert({
        where: { slug },
        update: { name: slug, group: permDef.group },
        create: {
          name: slug,
          slug,
          group: permDef.group,
        },
      });

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
}

// ─── منح دور لمستخدم ───

export async function assignRole(
  userId: string,
  roleId: string,
  organizationId: string,
  grantedById: string,
  opts?: AssignRoleOptions,
): Promise<AssignRoleResult> {
  const sodCheck = await validateAssignment({
    userId,
    roleId,
    organizationId,
  });

  if (!sodCheck.allowed) {
    const conflict = sodCheck.conflict;
    if (conflict) {
      await prisma.soDConflict.create({
        data: {
          ruleId: conflict.ruleId,
          userId,
          organizationId,
          roleAId: roleId,
          roleBId: conflict.conflictRoleId,
          description: sodCheck.reason ?? null,
        },
      });
    }

    return {
      success: false,
      sodCheck,
      error: sodCheck.reason ?? "SoD conflict detected",
    };
  }

  const assignment = await prisma.userRoleAssignment.create({
    data: {
      userId,
      roleId,
      organizationId,
      grantedById,
      reason: opts?.justification ?? null,
      isActive: true,
    },
  });

  await auditLogger({
    productKey: Product.PLATFORM,
    actor: { id: grantedById },
    organization: { platformOrganizationId: organizationId },
  }).record("rbac.role.assigned", {
    type: "role_assignment",
    id: assignment.id,
    label: `User ${userId} assigned role ${roleId}`,
  }, {
    metadata: {
      userId,
      roleId,
      organizationId,
      workspaceId: opts?.workspaceId ?? null,
    },
  });

  return { success: true, assignmentId: assignment.id, sodCheck };
}

// ─── إلغاء دور لمستخدم ───

export async function removeRole(
  assignmentId: string,
  revokedById: string,
): Promise<void> {
  const assignment = await prisma.userRoleAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error(`Role assignment ${assignmentId} not found`);
  }

  await prisma.userRoleAssignment.update({
    where: { id: assignmentId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedById,
    },
  });

  await auditLogger({
    productKey: Product.PLATFORM,
    actor: { id: revokedById },
  }).record("rbac.role.removed", {
    type: "role_assignment",
    id: assignmentId,
  });
}

// ─── الأدوار النشطة لمستخدم ───

export async function getUserRoles(
  userId: string,
  organizationId: string,
): Promise<unknown[]> {
  return prisma.userRoleAssignment.findMany({
    where: {
      userId,
      organizationId,
      isActive: true,
      },
    include: {
      role: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── فحص صلاحية محددة لمستخدم ───

export async function hasPermission(
  userId: string,
  permissionSlug: string,
  organizationId: string,
  resource?: string,
): Promise<boolean> {
  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      userId,
      organizationId,
      isActive: true,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  for (const assignment of assignments) {
    for (const rp of assignment.role.permissions) {
      if (rp.permission.slug === permissionSlug) {
        return true;
      }
      if (resource && rp.permission.group === resource && rp.permission.slug.endsWith(".admin")) {
        return true;
      }
    }
  }

  return false;
}

// ─── الصلاحيات الفعلية لمستخدم ───

export async function getEffectivePermissions(
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      userId,
      organizationId,
      isActive: true,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const slugs = new Set<string>();

  for (const assignment of assignments) {
    for (const rp of assignment.role.permissions) {
      slugs.add(rp.permission.slug);
    }
  }

  return Array.from(slugs).sort();
}

// ─── منح جماعي للأدوار ───

export async function batchAssignRoles(
  assignments: BatchAssignment[],
  grantedById: string,
): Promise<AssignRoleResult[]> {
  const results: AssignRoleResult[] = [];

  for (const a of assignments) {
    const result = await assignRole(
      a.userId,
      a.roleId,
      a.organizationId,
      grantedById,
      {
        workspaceId: a.workspaceId,
        justification: a.justification,
      },
    );
    results.push(result);
  }

  return results;
}

// ─── فئة RBAC للاستخدام في حقن التبعيات ───

export class RbacService {
  async getOrCreateSystemRoles(): Promise<void> {
    return getOrCreateSystemRoles();
  }

  async assignRole(
    userId: string,
    roleId: string,
    organizationId: string,
    grantedById: string,
    opts?: AssignRoleOptions,
  ): Promise<AssignRoleResult> {
    return assignRole(userId, roleId, organizationId, grantedById, opts);
  }

  async removeRole(assignmentId: string, revokedById: string): Promise<void> {
    return removeRole(assignmentId, revokedById);
  }

  async getUserRoles(userId: string, organizationId: string): Promise<unknown[]> {
    return getUserRoles(userId, organizationId);
  }

  async hasPermission(
    userId: string,
    permissionSlug: string,
    organizationId: string,
    resource?: string,
  ): Promise<boolean> {
    return hasPermission(userId, permissionSlug, organizationId, resource);
  }

  async getEffectivePermissions(
    userId: string,
    organizationId: string,
  ): Promise<string[]> {
    return getEffectivePermissions(userId, organizationId);
  }

  async batchAssignRoles(
    assignments: BatchAssignment[],
    grantedById: string,
  ): Promise<AssignRoleResult[]> {
    return batchAssignRoles(assignments, grantedById);
  }
}
