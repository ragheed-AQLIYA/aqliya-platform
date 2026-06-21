import type { PrismaClient } from "@prisma/client";

const SYSTEM_POLICIES = [
  {
    name: "ORG-01",
    description: "Deny cross-tenant access attempts on organization resources",
    resourceType: "organization",
    effect: "DENY" as const,
    priority: 10,
    conditions: [
      { attribute: "crossTenantAttempt", operator: "EQ", value: "true" },
    ],
  },
  {
    name: "SENS-02",
    description: "Restrict sensitive exports to admin role",
    resourceType: "platform",
    effect: "DENY" as const,
    priority: 20,
    conditions: [
      { attribute: "request.method", operator: "EQ", value: "export" },
      { attribute: "resource.sensitivity", operator: "EQ", value: "high" },
      { attribute: "role.slug", operator: "NEQ", value: "admin" },
    ],
  },
  {
    name: "APR-01",
    description: "Require elevated role for approval actions",
    resourceType: "platform",
    effect: "DENY" as const,
    priority: 30,
    conditions: [
      { attribute: "request.method", operator: "EQ", value: "approve" },
      { attribute: "role.slug", operator: "NOT_IN", value: "admin,operator" },
    ],
  },
];

export async function seedDefaultAbacPolicies(prisma: PrismaClient): Promise<void> {
  for (const policy of SYSTEM_POLICIES) {
    const existing = await prisma.abacPolicy.findFirst({
      where: { name: policy.name, organizationId: null },
    });
    if (existing) continue;

    const created = await prisma.abacPolicy.create({
      data: {
        organizationId: null,
        name: policy.name,
        description: policy.description,
        resourceType: policy.resourceType,
        effect: policy.effect,
        priority: policy.priority,
        isActive: true,
        createdBy: "system",
      },
    });

    for (const condition of policy.conditions) {
      await prisma.abacPolicyCondition.create({
        data: {
          policyId: created.id,
          attribute: condition.attribute,
          operator: condition.operator as "EQ" | "NEQ" | "NOT_IN",
          value: condition.value,
          createdBy: "system",
        },
      });
    }
  }
}
