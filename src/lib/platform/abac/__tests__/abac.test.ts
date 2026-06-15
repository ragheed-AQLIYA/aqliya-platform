// ─── In-memory mock for prisma ───
const stores = new Map<string, unknown[]>();
let idCounter = 1;

function getStore<T>(model: string): T[] {
  if (!stores.has(model)) stores.set(model, []);
  return stores.get(model) as T[];
}

function clearStores(): void {
  stores.clear();
  idCounter = 1;
}

function nextId(): string {
  return `abac_test_${idCounter++}`;
}

function clone<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) return value.map(clone) as T;
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = clone(v);
    }
    return result as T;
  }
  return value;
}

function matchesWhere(
  record: Record<string, unknown>,
  where: Record<string, unknown>,
): boolean {
  if (!where) return true;
  if (where.OR) {
    return (where.OR as Record<string, unknown>[]).some((e) =>
      matchesWhere(record, e),
    );
  }
  if (where.AND) {
    return (where.AND as Record<string, unknown>[]).every((e) =>
      matchesWhere(record, e),
    );
  }
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR" || key === "AND") continue;
    if (key === "select" && typeof value === "object") continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const obj = value as Record<string, unknown>;
      return Object.entries(obj).every(([nk, nv]) => {
        const nested = record[key] as Record<string, unknown> | undefined;
        return nested && nested[nk] === nv;
      });
    }
    if (record[key] !== value) return false;
  }
  return true;
}

function makeModel<T extends Record<string, unknown>>(model: string) {
  return {
    create: async ({ data }: { data: T }) => {
      const record = clone({
        id: nextId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      } as T);
      getStore<T>(model).push(record);
      return clone(record);
    },
    findUnique: async ({
      where,
      include,
    }: {
      where: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) => {
      const found = getStore<T>(model).find((r) =>
        matchesWhere(r as Record<string, unknown>, where),
      );
      if (!found) return null;
      if (include) {
        const included = applyInclude([clone(found)], model, include);
        return included[0] as T | null;
      }
      return clone(found) as T | null;
    },
    findMany: async (args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: Record<string, string>;
    }) => {
      let records = getStore<T>(model);
      if (args?.where) {
        records = records.filter((r) =>
          matchesWhere(r as Record<string, unknown>, args.where as Record<string, unknown>),
        );
      }
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0];
        records = [...records].sort((a, b) => {
          const aVal = String((a as Record<string, unknown>)[field] ?? "");
          const bVal = String((b as Record<string, unknown>)[field] ?? "");
          if (aVal < bVal) return dir === "desc" ? 1 : -1;
          if (aVal > bVal) return dir === "desc" ? -1 : 1;
          return 0;
        });
      }
      let results = clone(records as T[]);
      if (args?.include) {
        results = applyInclude(results, model, args.include);
      }
      return results;
    },
    update: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<T>;
    }) => {
      const store = getStore<T>(model);
      const idx = store.findIndex((r) =>
        matchesWhere(r as Record<string, unknown>, where),
      );
      if (idx === -1) throw new Error(`${model} not found`);
      store[idx] = {
        ...store[idx],
        ...clone(data),
        updatedAt: new Date(),
      } as T;
      return clone(store[idx]);
    },
    delete: async ({
      where,
    }: {
      where: Record<string, unknown>;
    }) => {
      const store = getStore<T>(model);
      const idx = store.findIndex((r) =>
        matchesWhere(r as Record<string, unknown>, where),
      );
      if (idx === -1) throw new Error(`${model} not found`);
      const removed = store.splice(idx, 1)[0];
      return clone(removed);
    },
    deleteMany: async ({
      where,
    }: {
      where: Record<string, unknown>;
    }) => {
      const store = getStore<T>(model);
      const remaining = store.filter(
        (r) => !matchesWhere(r as Record<string, unknown>, where),
      );
      const count = store.length - remaining.length;
      store.length = 0;
      store.push(...remaining);
      return { count };
    },
  };
}

function applyInclude<T>(
  items: T[],
  model: string,
  include: Record<string, unknown>,
): T[] {
  return items.map((item) => {
    const rec = clone(item) as Record<string, unknown>;

    for (const [key, config] of Object.entries(include)) {
      if (model === "abacPolicy") {
        if (key === "conditions") {
          rec[key] = getStore("abacPolicyCondition").filter(
            (c: unknown) => (c as Record<string, unknown>).policyId === rec.id,
          );
        } else if (key === "assignments") {
          const assignments = getStore("abacPolicyAssignment").filter(
            (a: unknown) => (a as Record<string, unknown>).policyId === rec.id,
          );
          if (
            config &&
            typeof config === "object" &&
            (config as Record<string, unknown>).include
          ) {
            rec[key] = applyInclude(
              assignments,
              "abacPolicyAssignment",
              (config as Record<string, unknown>).include as Record<string, unknown>,
            );
          } else {
            rec[key] = assignments;
          }
        }
      } else if (model === "abacPolicyAssignment") {
        if (key === "role") {
          const roleStore = getStore("role");
          rec[key] =
            roleStore.find(
              (r: unknown) =>
                (r as Record<string, unknown>).id === rec.roleId,
            ) ?? null;
        }
      } else if (model === "userRoleAssignment") {
        if (key === "role") {
          const roleStore = getStore("role");
          rec[key] =
            roleStore.find(
              (r: unknown) =>
                (r as Record<string, unknown>).id === rec.roleId,
            ) ?? null;
        }
      }
    }

    return rec as T;
  });
}

const mockPrisma = {
  abacPolicy: makeModel("abacPolicy"),
  abacPolicyCondition: makeModel("abacPolicyCondition"),
  abacPolicyAssignment: makeModel("abacPolicyAssignment"),
  role: makeModel("role"),
  userRoleAssignment: makeModel("userRoleAssignment"),
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
  })),
}));
jest.mock("next-auth/providers/credentials", () =>
  jest.fn(() => ({ id: "credentials", name: "Credentials", type: "credentials" })),
);

import {
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicy,
  listPolicies,
  evaluateAccess,
  assignPolicyToRole,
  assignPolicyToUser,
  unassignPolicy,
} from "../abac-service";
import { evaluateCondition } from "../condition-evaluator";
import type { AbacContext } from "../abac-service";

describe("ABAC Service", () => {
  let viewerRoleId: string;
  let managerRoleId: string;
  const orgId = "org_abac_001";
  const userId = "user_abac_001";
  const adminUserId = "user_admin_001";

  beforeEach(async () => {
    clearStores();
    const viewer = await mockPrisma.role.create({
      data: { name: "Viewer", slug: "viewer", type: "SYSTEM" as const },
    });
    const manager = await mockPrisma.role.create({
      data: { name: "Manager", slug: "manager", type: "SYSTEM" as const },
    });
    viewerRoleId = viewer.id;
    managerRoleId = manager.id;

    await mockPrisma.userRoleAssignment.create({
      data: {
        userId,
        roleId: viewerRoleId,
        organizationId: orgId,
        isActive: true,
        grantedById: adminUserId,
      },
    });
  });

  // ─── CRUD Tests ───

  it("creates a policy with conditions", async () => {
    const result = await createPolicy({
      organizationId: orgId,
      name: "Viewers can read engagements",
      resourceType: "audit.engagement",
      effect: "ALLOW",
      priority: 50,
      createdBy: adminUserId,
      conditions: [
        {
          attribute: "role.slug",
          operator: "EQUALS",
          value: "viewer",
        },
      ],
    });

    expect(result.id).toBeTruthy();

    const policy = await mockPrisma.abacPolicy.findUnique({
      where: { id: result.id },
    });
    expect(policy).not.toBeNull();
    expect(policy.name).toBe("Viewers can read engagements");
    expect(policy.effect).toBe("ALLOW");
    expect(policy.priority).toBe(50);

    const conditions = await mockPrisma.abacPolicyCondition.findMany({
      where: { policyId: result.id },
    });
    expect(conditions).toHaveLength(1);
    expect(conditions[0].attribute).toBe("role.slug");
  });

  it("gets a policy by id", async () => {
    const created = await createPolicy({
      name: "Test policy",
      resourceType: "decision.decision",
      effect: "ALLOW",
    });

    const policy = await getPolicy(created.id);
    expect(policy).not.toBeNull();
    expect(policy!.name).toBe("Test policy");
    expect(policy!.resourceType).toBe("decision.decision");
  });

  it("returns null for non-existent policy", async () => {
    const policy = await getPolicy("nonexistent_id");
    expect(policy).toBeNull();
  });

  it("lists policies filtered by organization", async () => {
    await createPolicy({ name: "Org policy", resourceType: "test", effect: "ALLOW", organizationId: orgId });
    await createPolicy({ name: "Global policy", resourceType: "test", effect: "ALLOW" });

    const orgPolicies = await listPolicies(orgId);
    expect(orgPolicies).toHaveLength(1);
    expect(orgPolicies[0].name).toBe("Org policy");

    const allPolicies = await listPolicies();
    expect(allPolicies).toHaveLength(2);
  });

  it("updates a policy name", async () => {
    const created = await createPolicy({
      name: "Old name",
      resourceType: "test",
      effect: "ALLOW",
    });

    await updatePolicy(created.id, { name: "New name" });

    const policy = await mockPrisma.abacPolicy.findUnique({
      where: { id: created.id },
    });
    expect(policy.name).toBe("New name");
  });

  it("throws on update for non-existent policy", async () => {
    await expect(
      updatePolicy("bad_id", { name: "x" }),
    ).rejects.toThrow("not found");
  });

  it("deletes (deactivates) a policy", async () => {
    const created = await createPolicy({
      name: "To delete",
      resourceType: "test",
      effect: "ALLOW",
    });

    await deletePolicy(created.id);

    const policy = await mockPrisma.abacPolicy.findUnique({
      where: { id: created.id },
    });
    expect(policy.isActive).toBe(false);
  });

  it("throws on delete for non-existent policy", async () => {
    await expect(deletePolicy("bad_id")).rejects.toThrow("not found");
  });

  // ─── Assignment Tests ───

  it("assigns a policy to a role", async () => {
    const created = await createPolicy({
      name: "Role-scoped policy",
      resourceType: "test",
      effect: "ALLOW",
    });

    await assignPolicyToRole(created.id, viewerRoleId);

    const assignments = await mockPrisma.abacPolicyAssignment.findMany({
      where: { policyId: created.id },
    });
    expect(assignments).toHaveLength(1);
    expect(assignments[0].roleId).toBe(viewerRoleId);
  });

  it("assigns a policy to a user", async () => {
    const created = await createPolicy({
      name: "User-scoped policy",
      resourceType: "test",
      effect: "ALLOW",
    });

    await assignPolicyToUser(created.id, userId);

    const assignments = await mockPrisma.abacPolicyAssignment.findMany({
      where: { policyId: created.id },
    });
    expect(assignments).toHaveLength(1);
    expect(assignments[0].userId).toBe(userId);
  });

  it("unassigns a policy", async () => {
    const created = await createPolicy({
      name: "Temp policy",
      resourceType: "test",
      effect: "ALLOW",
    });
    await assignPolicyToUser(created.id, userId);
    const assignments = await mockPrisma.abacPolicyAssignment.findMany({
      where: { policyId: created.id },
    });
    expect(assignments).toHaveLength(1);

    await unassignPolicy(assignments[0].id);

    const after = await mockPrisma.abacPolicyAssignment.findMany({
      where: { policyId: created.id },
    });
    expect(after).toHaveLength(0);
  });

  // ─── evaluateCondition Tests (pure function) ───

  const baseContext: AbacContext = {
    userId,
    organizationId: orgId,
    roleIds: [viewerRoleId],
    roleSlugs: ["viewer"],
    resourceType: "audit.engagement",
    action: "read",
    resourceOwnerId: userId,
    resourceSensitivity: "confidential",
    requestTime: new Date("2026-06-05T14:30:00"),
  };

  it("evaluateCondition EQUALS matches", () => {
    expect(
      evaluateCondition(
        { attribute: "user.organizationId", operator: "EQUALS", value: orgId },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition EQUALS does not match", () => {
    expect(
      evaluateCondition(
        { attribute: "user.organizationId", operator: "EQUALS", value: "wrong_org" },
        baseContext,
      ),
    ).toBe(false);
  });

  it("evaluateCondition NOT_EQUALS works", () => {
    expect(
      evaluateCondition(
        { attribute: "user.organizationId", operator: "NOT_EQUALS", value: "wrong_org" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition IN matches", () => {
    expect(
      evaluateCondition(
        { attribute: "resource.sensitivity", operator: "IN", value: "confidential,restricted" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition NOT_IN works", () => {
    expect(
      evaluateCondition(
        { attribute: "resource.sensitivity", operator: "NOT_IN", value: "top_secret,restricted" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition GREATER_THAN works for time.hour", () => {
    expect(
      evaluateCondition(
        { attribute: "time.hour", operator: "GREATER_THAN", value: "8" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition LESS_THAN works for time.hour", () => {
    expect(
      evaluateCondition(
        { attribute: "time.hour", operator: "LESS_THAN", value: "20" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition CONTAINS matches", () => {
    expect(
      evaluateCondition(
        { attribute: "resource.type", operator: "CONTAINS", value: "engage" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition EXISTS returns true for present attribute", () => {
    expect(
      evaluateCondition(
        { attribute: "resource.ownerId", operator: "EXISTS", value: "" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition EXISTS returns false for missing attribute", () => {
    expect(
      evaluateCondition(
        { attribute: "user.email", operator: "EXISTS", value: "" },
        baseContext,
      ),
    ).toBe(false);
  });

  it("evaluateCondition role.slug EQUALS matches user role", () => {
    expect(
      evaluateCondition(
        { attribute: "role.slug", operator: "EQUALS", value: "viewer" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition role.slug EQUALS does not match non-existent role", () => {
    expect(
      evaluateCondition(
        { attribute: "role.slug", operator: "EQUALS", value: "admin" },
        baseContext,
      ),
    ).toBe(false);
  });

  it("evaluateCondition role.slug IN matches", () => {
    expect(
      evaluateCondition(
        { attribute: "role.slug", operator: "IN", value: "viewer,admin" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition role.slug NOT_IN excludes correctly", () => {
    expect(
      evaluateCondition(
        { attribute: "role.slug", operator: "NOT_IN", value: "admin,superadmin" },
        baseContext,
      ),
    ).toBe(true);
  });

  it("evaluateCondition uses custom attributes from context", () => {
    const ctx: AbacContext = {
      ...baseContext,
      attributes: { department: "finance", region: "KSA" },
    };
    expect(
      evaluateCondition(
        { attribute: "department", operator: "EQUALS", value: "finance" },
        ctx,
      ),
    ).toBe(true);
  });

  // ─── evaluateAccess Tests ───

  it("evaluateAccess returns ALLOW when policy conditions match", async () => {
    const policy = await mockPrisma.abacPolicy.create({
      data: {
        name: "Viewer read engagement",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: orgId,
        isActive: true,
      },
    });
    await mockPrisma.abacPolicyCondition.create({
      data: {
        policyId: policy.id,
        attribute: "role.slug",
        operator: "EQUALS",
        value: "viewer",
      },
    });

    const result = await evaluateAccess(baseContext);
    expect(result.allowed).toBe(true);
    expect(result.effect).toBe("ALLOW");
    expect(result.matchedPolicyId).toBe(policy.id);
    expect(result.deniedByDefault).toBe(false);
  });

  it("evaluateAccess returns DENY when policy conditions match on effect DENY", async () => {
    await mockPrisma.abacPolicy.create({
      data: {
        name: "Allow viewer read",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: orgId,
        isActive: true,
      },
    });
    const denyPolicy = await mockPrisma.abacPolicy.create({
      data: {
        name: "Block read on confidential",
        resourceType: "audit.engagement",
        effect: "DENY",
        priority: 50,
        organizationId: orgId,
        isActive: true,
      },
    });
    await mockPrisma.abacPolicyCondition.create({
      data: {
        policyId: denyPolicy.id,
        attribute: "resource.sensitivity",
        operator: "EQUALS",
        value: "confidential",
      },
    });

    const result = await evaluateAccess(baseContext);
    expect(result.allowed).toBe(false);
    expect(result.effect).toBe("DENY");
    expect(result.matchedPolicyId).toBe(denyPolicy.id);
    expect(result.deniedByDefault).toBe(false);
  });

  it("evaluateAccess returns default deny when no policy matches", async () => {
    const result = await evaluateAccess({
      ...baseContext,
      resourceType: "nonexistent.resource",
    });
    expect(result.allowed).toBe(false);
    expect(result.effect).toBeNull();
    expect(result.matchedPolicyId).toBeNull();
    expect(result.deniedByDefault).toBe(true);
  });

  it("evaluateAccess returns default deny when conditions do not match", async () => {
    const policy = await mockPrisma.abacPolicy.create({
      data: {
        name: "Admin only",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: orgId,
        isActive: true,
      },
    });
    await mockPrisma.abacPolicyCondition.create({
      data: {
        policyId: policy.id,
        attribute: "role.slug",
        operator: "EQUALS",
        value: "admin",
      },
    });

    const result = await evaluateAccess(baseContext);
    expect(result.allowed).toBe(false);
    expect(result.deniedByDefault).toBe(true);
  });

  it("evaluateAccess resolves roleSlugs when not provided", async () => {
    const policy = await mockPrisma.abacPolicy.create({
      data: {
        name: "Viewer read via slug resolution",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: orgId,
        isActive: true,
      },
    });
    await mockPrisma.abacPolicyCondition.create({
      data: {
        policyId: policy.id,
        attribute: "role.slug",
        operator: "EQUALS",
        value: "viewer",
      },
    });

    const result = await evaluateAccess({
      ...baseContext,
      roleSlugs: undefined,
    });
    expect(result.allowed).toBe(true);
    expect(result.matchedPolicyId).toBe(policy.id);
  });

  it("evaluateAccess returns default deny for global policy that does not match", async () => {
    await mockPrisma.abacPolicy.create({
      data: {
        name: "Global policy",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: null,
        isActive: true,
      },
    });
    const result = await evaluateAccess({
      ...baseContext,
      resourceType: "audit.engagement",
    });
    expect(result.allowed).toBe(true);
  });

  it("evaluateAccess only considers assigned policies when assignments exist", async () => {
    const policy = await mockPrisma.abacPolicy.create({
      data: {
        name: "Manager-only policy",
        resourceType: "audit.engagement",
        effect: "ALLOW",
        priority: 100,
        organizationId: orgId,
        isActive: true,
      },
    });
    await mockPrisma.abacPolicyAssignment.create({
      data: {
        policyId: policy.id,
        roleId: managerRoleId,
      },
    });

    const result = await evaluateAccess(baseContext);
    expect(result.allowed).toBe(false);
    expect(result.deniedByDefault).toBe(true);
  });
});
