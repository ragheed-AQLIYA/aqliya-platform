// ─── خدمة فصل المهام (Separation of Duties) ───
// تمنع تعارض الأدوار وتكشف التضارب قبل منح الصلاحيات.

import { prisma } from "@/lib/prisma";
import { auditLogger, Product } from "../audit-logger";
import type { AuditLoggerTarget } from "../audit-logger";

export type SoDConflictLevel = "HARD" | "SOFT";

// ─── Types ───

export interface ValidateAssignmentInput {
  userId: string;
  roleId: string;
  organizationId: string;
}

export interface ValidateAssignmentResult {
  allowed: boolean;
  conflict?: SoDConflictInfo;
  reason?: string;
}

export interface SoDConflictInfo {
  ruleId: string;
  ruleName: string;
  conflictRoleId: string;
  conflictRoleName: string;
  conflictLevel: SoDConflictLevel;
  existingAssignmentId?: string;
}

export interface CreateRuleInput {
  organizationId: string;
  description?: string;
  roleAId: string;
  roleBId: string;
  conflictLevel?: SoDConflictLevel;
  createdById?: string;
}

export interface UpdateRuleInput {
  description?: string;
  roleAId?: string;
  roleBId?: string;
  conflictLevel?: SoDConflictLevel;
  isActive?: boolean;
}

export interface ResolveConflictInput {
  resolution: "override" | "removed_role_a" | "removed_role_b" | "justified";
  resolvedById: string;
  notes?: string;
}

// ─── إنشاء قاعدة فصل مهام ───

export async function defineRule(
  input: CreateRuleInput,
): Promise<{ id: string }> {
  const level = input.conflictLevel ?? ("HARD" as SoDConflictLevel);
  const rule = await prisma.separationOfDutyRule.create({
    data: {
      organizationId: input.organizationId,
      description: input.description ?? null,
      roleAId: input.roleAId,
      roleBId: input.roleBId,
      conflictLevel: level,
      isActive: true,
      createdById: input.createdById ?? null,
    },
  });

  await auditLogger({
    productKey: Product.PLATFORM,
    actor: input.createdById ? { id: input.createdById } : undefined,
  }).record("sod.rule.created", {
    type: "separation_of_duty_rule",
    id: rule.id,
    label: input.description ?? `SoD Rule ${rule.id}`,
  });

  return { id: rule.id };
}

// ─── تحديث قاعدة فصل مهام ───

export async function updateRule(
  id: string,
  data: UpdateRuleInput,
): Promise<void> {
  await prisma.separationOfDutyRule.update({
    where: { id },
    data: {
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.roleAId !== undefined ? { roleAId: data.roleAId } : {}),
      ...(data.roleBId !== undefined ? { roleBId: data.roleBId } : {}),
      ...(data.conflictLevel !== undefined ? { conflictLevel: data.conflictLevel } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}

// ─── إلغاء تنشيط قاعدة فصل مهام ───

export async function deleteRule(id: string): Promise<void> {
  await prisma.separationOfDutyRule.update({
    where: { id },
    data: { isActive: false },
  });
}

// ─── الحصول على التضاربات النشطة لمستخدم ───

export async function getUserConflicts(
  userId: string,
  organizationId: string,
): Promise<unknown[]> {
  return prisma.soDConflict.findMany({
    where: {
      userId,
      organizationId,
      resolvedAt: null,
    },
    include: {
      rule: true,
    },
    orderBy: { detectedAt: "desc" },
  });
}

// ─── فحص التضارب قبل منح دور ───

export async function checkForConflict(
  userId: string,
  roleId: string,
  organizationId: string,
): Promise<SoDConflictInfo | null> {
  const activeRules = await prisma.separationOfDutyRule.findMany({
    where: {
      isActive: true,
      OR: [
        { roleAId: roleId },
        { roleBId: roleId },
      ],
    },
    include: {
      roleA: { select: { id: true, name: true } },
      roleB: { select: { id: true, name: true } },
    },
  });

  if (activeRules.length === 0) return null;

  const userAssignments = await prisma.userRoleAssignment.findMany({
    where: {
      userId,
      organizationId,
      isActive: true,
    },
    select: { roleId: true },
  }) as { roleId: string }[];

  const assignedRoleIds = new Set(userAssignments.map((a) => a.roleId));

  for (const rule of activeRules) {
    let conflictRoleId: string | null = null;
    let conflictRoleName: string | null = null;

    if (rule.roleAId === roleId && assignedRoleIds.has(rule.roleBId)) {
      conflictRoleId = rule.roleBId;
      conflictRoleName = rule.roleB.name;
    } else if (rule.roleBId === roleId && assignedRoleIds.has(rule.roleAId)) {
      conflictRoleId = rule.roleAId;
      conflictRoleName = rule.roleA.name;
    }

    if (conflictRoleId) {
      return {
        ruleId: rule.id,
        ruleName: rule.description ?? `SoD Rule ${rule.id}`,
        conflictRoleId,
        conflictRoleName: conflictRoleName ?? "",
        conflictLevel: rule.conflictLevel,
      };
    }
  }

  return null;
}

// ─── حل تضارب ───

export async function resolveConflict(
  conflictId: string,
  input: ResolveConflictInput,
): Promise<void> {
  const conflict = await prisma.soDConflict.findUnique({
    where: { id: conflictId },
  });

  if (!conflict) {
    throw new Error(`SoD conflict ${conflictId} not found`);
  }

  await prisma.soDConflict.update({
    where: { id: conflictId },
    data: {
      resolvedAt: new Date(),
      resolution: input.resolution,
      resolvedById: input.resolvedById,
      description: input.notes ?? null,
    },
  });

  await auditLogger({
    productKey: Product.PLATFORM,
    actor: { id: input.resolvedById },
  }).record("sod.conflict.resolved", {
    type: "sod_conflict",
    id: conflictId,
  }, {
    metadata: {
      resolution: input.resolution,
      userId: conflict.userId,
    },
  });
}

// ─── قائمة قواعد المنظمة ───

export async function getOrganizationRules(
  organizationId: string,
): Promise<unknown[]> {
  return prisma.separationOfDutyRule.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

// ─── التحقق من منح الدور (اختبار قبلي) ───

export async function validateAssignment(
  input: ValidateAssignmentInput,
): Promise<ValidateAssignmentResult> {
  const conflict = await checkForConflict(
    input.userId,
    input.roleId,
    input.organizationId,
  );

  if (!conflict) {
    return { allowed: true };
  }

  if (conflict.conflictLevel === "SOFT") {
    return {
      allowed: true,
      conflict,
      reason: `SOFT conflict with role "${conflict.conflictRoleName}" — warning only`,
    };
  }

  return {
    allowed: false,
    conflict,
    reason: `HARD conflict: role conflicts with "${conflict.conflictRoleName}" (SoD rule: "${conflict.ruleName}")`,
  };
}
