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
  return `test_${idCounter++}`;
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

function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  if (!where) return true;
  if (where.OR) {
    return (where.OR as Record<string, unknown>[]).some((e) => matchesWhere(record, e));
  }
  if (where.AND) {
    return (where.AND as Record<string, unknown>[]).every((e) => matchesWhere(record, e));
  }
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR" || key === "AND") continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const obj = value as Record<string, unknown>;
      if (obj.gte && record[key] instanceof Date && obj.gte instanceof Date) {
        if ((record[key] as Date) < obj.gte) return false;
        continue;
      }
      if (obj.lte && record[key] instanceof Date && obj.lte instanceof Date) {
        if ((record[key] as Date) > obj.lte) return false;
        continue;
      }
      return Object.entries(obj).every(([nk, nv]) => {
        const nested = record[key] as Record<string, unknown> | undefined;
        return nested && nested[nk] === nv;
      });
    }
    if (record[key] !== value) return false;
  }
  return true;
}

type SoDConflictLevel = "HARD" | "SOFT";

const RELATION_MODEL_MAP: Record<string, string> = {
  roleA: "role",
  roleB: "role",
};

function makeModel<T extends Record<string, unknown>>(model: string) {
  return {
    create: async ({ data }: { data: T }) => {
      const record = clone({ id: nextId(), ...data } as T);
      getStore<T>(model).push(record);
      return clone(record);
    },
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      return clone(
        (getStore<T>(model).find((r) => matchesWhere(r as Record<string, unknown>, where)) ??
          null) as T | null,
      );
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
      if (args?.include) {
        return records.map((r) => {
          const rec = clone(r);
          for (const [key, config] of Object.entries(args.include as Record<string, unknown>)) {
            const storeName = RELATION_MODEL_MAP[key] ?? key;
            if ((config as Record<string, unknown>)?.include) {
              (rec as Record<string, unknown>)[key] = (getStore<T>(storeName) as T[]).filter(
                (child) =>
                  (child as Record<string, unknown>).id ===
                  (rec as Record<string, unknown>)[`${storeName}Id`] ||
                  (child as Record<string, unknown>).id ===
                  (rec as Record<string, unknown>)[`${key}Id`],
              );
            } else {
              const childStore = getStore<T>(storeName);
              (rec as Record<string, unknown>)[key] = clone(
                childStore.find(
                  (c) =>
                    (c as Record<string, unknown>).id ===
                    (rec as Record<string, unknown>)[`${key}Id`],
                ) ?? null,
              );
            }
          }
          return rec;
        });
      }
      return clone(records as T[]);
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
      store[idx] = { ...store[idx], ...clone(data), updatedAt: new Date() } as T;
      return clone(store[idx]);
    },
    upsert: async ({
      where,
      create,
      update,
    }: {
      where: Record<string, unknown>;
      create: T;
      update: Partial<T>;
    }) => {
      const existing = getStore<T>(model).find((r) =>
        matchesWhere(r as Record<string, unknown>, where),
      );
      if (existing) {
        Object.assign(existing, clone(update), { updatedAt: new Date() });
        return clone(existing);
      }
      const record = clone({ id: nextId(), ...create } as T);
      getStore<T>(model).push(record);
      return clone(record);
    },
  };
}

const mockPrisma = {
  permission: makeModel("permission"),
  role: makeModel("role"),
  rolePermission: makeModel("rolePermission"),
  userRoleAssignment: makeModel("userRoleAssignment"),
  separationOfDutyRule: makeModel("separationOfDutyRule"),
  soDConflict: makeModel("soDConflict"),
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

import { defineRule, checkForConflict, validateAssignment, resolveConflict, getUserConflicts } from "../sod-service";

describe("SoD Service — Separation of Duties", () => {
  let roleAId: string;
  let roleBId: string;
  let roleCId: string;
  const userId = "user_001";
  const organizationId = "org_001";

  beforeEach(async () => {
    clearStores();
    const roleA = await mockPrisma.role.create({
      data: { name: "Auditor", slug: "auditor", type: "SYSTEM" as const },
    });
    const roleB = await mockPrisma.role.create({
      data: { name: "Reviewer", slug: "reviewer", type: "SYSTEM" as const },
    });
    const roleC = await mockPrisma.role.create({
      data: { name: "Observer", slug: "observer", type: "SYSTEM" as const },
    });
    roleAId = roleA.id;
    roleBId = roleB.id;
    roleCId = roleC.id;

    await mockPrisma.userRoleAssignment.create({
      data: {
        userId,
        roleId: roleAId,
        organizationId,
        isActive: true,
        grantedById: "admin_001",
      },
    });
  });

  it("creates a separation of duty rule", async () => {
    const result = await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    expect(result.id).toBeTruthy();

    const rules = await mockPrisma.separationOfDutyRule.findMany();
    expect(rules).toHaveLength(1);
    expect(rules[0].description).toBe("Auditor cannot also be Reviewer");
  });

  it("detects conflict when assigning conflicting role", async () => {
    await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    const conflict = await checkForConflict(userId, roleBId, organizationId);
    expect(conflict).not.toBeNull();
    expect(conflict!.ruleName).toBe("Auditor cannot also be Reviewer");
    expect(conflict!.conflictRoleId).toBe(roleAId);
    expect(conflict!.conflictLevel).toBe("HARD");
  });

  it("returns no conflict for unrelated roles", async () => {
    await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    const conflict = await checkForConflict(userId, roleCId, organizationId);
    expect(conflict).toBeNull();
  });

  it("prevents assignment when HARD conflict exists", async () => {
    await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    const result = await validateAssignment({
      userId,
      roleId: roleBId,
      organizationId,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("HARD conflict");
  });

  it("allows assignment with warning for SOFT conflict", async () => {
    await defineRule({
      description: "Auditor + Reviewer soft conflict",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "SOFT" as SoDConflictLevel,
    });

    const result = await validateAssignment({
      userId,
      roleId: roleBId,
      organizationId,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toContain("SOFT conflict");
  });

  it("resolves a detected conflict", async () => {
    await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    const conflict = await checkForConflict(userId, roleBId, organizationId);
    expect(conflict).not.toBeNull();

    const conflictRecord = await mockPrisma.soDConflict.create({
      data: {
        ruleId: conflict!.ruleId,
        userId,
        organizationId,
        roleAId,
        roleBId: conflict!.conflictRoleId,
        resolvedAt: null,
      },
    });

    await resolveConflict(conflictRecord.id, {
      resolution: "justified",
      resolvedById: "admin_001",
      notes: "Temporary override for Q4 close",
    });

    const resolved = await mockPrisma.soDConflict.findUnique({
      where: { id: conflictRecord.id },
    });
    expect(resolved.resolution).toBe("justified");
    expect(resolved.resolvedAt).toBeTruthy();
  });

  it("lists active conflicts for a user", async () => {
    await defineRule({
      description: "Auditor cannot also be Reviewer",
      organizationId,
      roleAId,
      roleBId,
      conflictLevel: "HARD" as SoDConflictLevel,
    });

    const conflict = await checkForConflict(userId, roleBId, organizationId);
    expect(conflict).not.toBeNull();

    await mockPrisma.soDConflict.create({
      data: {
        ruleId: conflict!.ruleId,
        userId,
        organizationId,
        roleAId,
        roleBId: conflict!.conflictRoleId,
        resolvedAt: null,
      },
    });

    const conflicts = await getUserConflicts(userId, organizationId);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });
});
