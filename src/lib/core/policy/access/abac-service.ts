import { prisma } from "@/lib/prisma";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { evaluateCondition } from "./condition-evaluator";

import type { AbacEffect, AbacOperator } from "@prisma/client";

export interface AbacContext {
  userId: string;
  organizationId: string;
  roleIds: string[];
  roleSlugs?: string[];
  resourceType: string;
  resourceId?: string;
  resourceOwnerId?: string;
  resourceSensitivity?: string;
  action: string;
  requestTime?: Date;
  attributes?: Record<string, string>;
}

export interface AbacEvaluationResult {
  allowed: boolean;
  effect: AbacEffect | null;
  matchedPolicyId: string | null;
  policyName: string | null;
  deniedByDefault: boolean;
}

export interface CreateConditionInput {
  attribute: string;
  operator: AbacOperator | string;
  value: string;
}

export interface CreatePolicyInput {
  organizationId?: string;
  name: string;
  description?: string;
  resourceType: string;
  effect: AbacEffect | string;
  priority?: number;
  isActive?: boolean;
  createdBy?: string;
  conditions?: CreateConditionInput[];
}

export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  resourceType?: string;
  effect?: AbacEffect | string;
  priority?: number;
  isActive?: boolean;
  updatedBy?: string;
  conditions?: CreateConditionInput[];
}

export interface PolicyWithRelations {
  id: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  resourceType: string;
  effect: string;
  priority: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  conditions?: unknown[];
  assignments?: unknown[];
}

export async function createPolicy(
  input: CreatePolicyInput,
): Promise<{ id: string }> {
  const policy = await prisma.abacPolicy.create({
    data: {
      organizationId: input.organizationId ?? null,
      name: input.name,
      description: input.description ?? null,
      resourceType: input.resourceType,
      effect: input.effect as AbacEffect,
      priority: input.priority ?? 100,
      isActive: input.isActive ?? true,
      createdBy: input.createdBy ?? null,
    },
  });

  if (input.conditions && input.conditions.length > 0) {
    for (const cond of input.conditions) {
      await prisma.abacPolicyCondition.create({
        data: {
          policyId: policy.id,
          attribute: cond.attribute,
          operator: cond.operator as AbacOperator,
          value: cond.value,
        },
      });
    }
  }

  return { id: policy.id };
}

export async function updatePolicy(
  id: string,
  input: UpdatePolicyInput,
): Promise<void> {
  const existing = await prisma.abacPolicy.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`AbacPolicy ${id} not found`);
  }

  await prisma.abacPolicy.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.resourceType !== undefined
        ? { resourceType: input.resourceType }
        : {}),
      ...(input.effect !== undefined ? { effect: input.effect as AbacEffect } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.updatedBy !== undefined ? { updatedBy: input.updatedBy } : {}),
    },
  });

  if (input.conditions !== undefined) {
    await prisma.abacPolicyCondition.deleteMany({
      where: { policyId: id },
    });
    for (const cond of input.conditions) {
      await prisma.abacPolicyCondition.create({
        data: {
          policyId: id,
          attribute: cond.attribute,
          operator: cond.operator as AbacOperator,
          value: cond.value,
        },
      });
    }
  }
}

export async function deletePolicy(id: string): Promise<void> {
  const existing = await prisma.abacPolicy.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`AbacPolicy ${id} not found`);
  }

  await prisma.abacPolicy.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getPolicy(
  id: string,
): Promise<PolicyWithRelations | null> {
  const policy = await prisma.abacPolicy.findUnique({
    where: { id },
    include: {
      conditions: true,
      assignments: true,
    },
  });
  return policy as PolicyWithRelations | null;
}

export async function listPolicies(
  organizationId?: string,
): Promise<PolicyWithRelations[]> {
  const where: Record<string, unknown> = {};
  if (organizationId) {
    where.organizationId = organizationId;
  }
  const policies = await prisma.abacPolicy.findMany({
    where,
    include: {
      conditions: true,
    },
    orderBy: { priority: "asc" },
  });
  return policies as PolicyWithRelations[];
}

export async function assignPolicyToRole(
  policyId: string,
  roleId: string,
): Promise<void> {
  const policy = await prisma.abacPolicy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new Error(`AbacPolicy ${policyId} not found`);
  }
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new Error(`Role ${roleId} not found`);
  }
  await prisma.abacPolicyAssignment.create({
    data: {
      policyId,
      roleId,
    },
  });
}

export async function assignPolicyToUser(
  policyId: string,
  userId: string,
): Promise<void> {
  const policy = await prisma.abacPolicy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    throw new Error(`AbacPolicy ${policyId} not found`);
  }
  await prisma.abacPolicyAssignment.create({
    data: {
      policyId,
      userId,
    },
  });
}

export async function unassignPolicy(id: string): Promise<void> {
  const existing = await prisma.abacPolicyAssignment.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error(`AbacPolicyAssignment ${id} not found`);
  }
  await prisma.abacPolicyAssignment.delete({
    where: { id },
  });
}

export async function evaluateAccess(
  context: AbacContext,
): Promise<AbacEvaluationResult> {
  const resolvedSlugs =
    context.roleSlugs ??
    (await resolveRoleSlugs(context.userId, context.organizationId));

  const policies = await prisma.abacPolicy.findMany({
    where: {
      resourceType: context.resourceType,
      isActive: true,
      OR: [
        { organizationId: context.organizationId },
        { organizationId: null },
      ],
    },
    include: {
      conditions: true,
      assignments: true,
    },
    orderBy: { priority: "asc" },
  });

  const applicablePolicies = policies.filter((policy: Record<string, unknown>) => {
    const assignments = (policy as any).assignments as { userId?: string; roleId?: string }[] | undefined;
    if (!assignments || assignments.length === 0) return true;
    return assignments.some((a) => {
      if (a.userId === context.userId) return true;
      if (a.roleId && context.roleIds.includes(a.roleId)) return true;
      return false;
    });
  });

  let allowMatch: (typeof applicablePolicies)[0] | null = null;
  let denyMatch: (typeof applicablePolicies)[0] | null = null;

  for (const policy of applicablePolicies) {
    const p = policy as any;
    const conditions = p.conditions as { attribute: string; operator: string; value: string }[] | undefined;
    const conditionsMatch =
      !conditions || conditions.length === 0
        ? true
        : conditions.every((c) =>
            evaluateCondition(c, { ...context, roleSlugs: resolvedSlugs }),
          );

    if (conditionsMatch) {
      if (p.effect === "DENY") {
        denyMatch = policy;
      } else if (p.effect === "ALLOW" && !allowMatch) {
        allowMatch = policy;
      }
    }
  }

  if (denyMatch) {
    await auditLogger({
      productKey: Product.PLATFORM,
      actor: { id: context.userId },
      organization: { platformOrganizationId: context.organizationId },
    }).record(
      "abac.evaluate.denied",
      {
        type: "abac_deny",
        id: denyMatch.id as string,
        label: `ABAC DENY: ${denyMatch.name as string} for ${context.resourceType}.${context.action}`,
      },
      {
        metadata: {
          userId: context.userId,
          resourceType: context.resourceType,
          action: context.action,
          policyName: denyMatch.name as string,
          effect: "DENY",
        },
      },
    );

    return {
      allowed: false,
      effect: "DENY" as AbacEffect,
      matchedPolicyId: denyMatch.id as string,
      policyName: denyMatch.name as string,
      deniedByDefault: false,
    };
  }

  if (allowMatch) {
    return {
      allowed: true,
      effect: "ALLOW" as AbacEffect,
      matchedPolicyId: allowMatch.id as string,
      policyName: allowMatch.name as string,
      deniedByDefault: false,
    };
  }

  return {
    allowed: false,
    effect: null,
    matchedPolicyId: null,
    policyName: null,
    deniedByDefault: true,
  };
}

async function resolveRoleSlugs(
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
        select: { slug: true },
      },
    },
  });
  return assignments.map((a: { role: { slug: string } }) => a.role.slug);
}

