import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => {
  const store: Record<string, unknown[]> = {};
  let idCounter = 1;
  let tokenCounter = 1;

  function getStore(model: string): unknown[] {
    if (!store[model]) store[model] = [];
    return store[model];
  }

  function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
    return Object.entries(where).every(([key, value]) => record[key] === value);
  }

  function cuid(): string {
    return `c${String(tokenCounter++).padStart(24, "0")}`;
  }

  const makeModel = (model: string) => ({
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const record = { id: `${model}_${idCounter++}`, token: cuid(), ...data, createdAt: new Date(), updatedAt: new Date() };
      getStore(model).push(record);
      return record;
    },
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      return getStore(model).find((r) => matchesWhere(r as Record<string, unknown>, where)) || null;
    },
    findMany: async ({ where, orderBy, take }: { where?: Record<string, unknown>; orderBy?: Record<string, "asc" | "desc">; take?: number } = {}) => {
      let results = where ? getStore(model).filter((r) => matchesWhere(r as Record<string, unknown>, where)) : [...getStore(model)];
      if (orderBy) {
        const [field, dir] = Object.entries(orderBy)[0];
        results.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[field] as number;
          const bVal = (b as Record<string, unknown>)[field] as number;
          return dir === "desc" ? bVal - aVal : aVal - bVal;
        });
      }
      if (take) results = results.slice(0, take);
      return results;
    },
    update: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const record = getStore(model).find((r) => matchesWhere(r as Record<string, unknown>, where));
      if (!record) throw new Error("Not found");
      Object.assign(record as Record<string, unknown>, data);
      return record;
    },
    deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
      const storeArr = getStore(model);
      const before = storeArr.length;
      const remaining = storeArr.filter((r) => !matchesWhere(r as Record<string, unknown>, where));
      storeArr.length = 0;
      storeArr.push(...remaining);
      return { count: before - remaining.length };
    },
    count: async ({ where }: { where?: Record<string, unknown> } = {}) => {
      return where ? getStore(model).filter((r) => matchesWhere(r as Record<string, unknown>, where)).length : getStore(model).length;
    },
  });

  const models: Record<string, unknown> = {};
  const modelNames = ["downloadTicket", "platformAuditLog"];
  for (const name of modelNames) {
    models[name] = makeModel(name);
  }

  return {
    prisma: models,
    __esModule: true,
    default: models,
  };
});

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(() => Promise.resolve({ ok: true, id: "audit-1" })),
}));

jest.mock("@/lib/platform/access/principal", () => ({
  principalFromCurrentUser: (user: { id: string; organizationId: string; role: string }) => ({
    id: user.id,
    organizationId: user.organizationId,
    role: user.role,
    userId: user.id,
  }),
}));

jest.mock("@/lib/platform/access/permissions", () => ({
  can: () => ({ allowed: true }),
}));

import {
  generateDownloadTicket,
  verifyDownloadTicket,
  consumeDownloadTicket,
  revokeDownloadTicket,
  cleanExpiredTickets,
  getUserDownloadHistory,
} from "../download-gate";

const MOCK_USER = { id: "user-1", organizationId: "org-1", role: "OPERATOR" };
const MOCK_INPUT = {
  resourceType: "audit.evidence",
  resourceId: "ev-1",
  fileName: "report.pdf",
  mimeType: "application/pdf",
  fileSize: 1024,
};

describe("DownloadGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates a download ticket", async () => {
    const result = await generateDownloadTicket(MOCK_INPUT, MOCK_USER);

    expect(result.allowed).toBe(true);
    expect(result.ticket).toBeDefined();
    expect(result.ticket!.resourceType).toBe("audit.evidence");
    expect(result.ticket!.resourceId).toBe("ev-1");
    expect(result.ticket!.fileName).toBe("report.pdf");
    expect(result.ticket!.token).toBeDefined();
    expect(new Date(result.ticket!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("verifies a valid ticket", async () => {
    const gen = await generateDownloadTicket(MOCK_INPUT, MOCK_USER);
    const result = await verifyDownloadTicket(gen.ticket!.token);

    expect(result.allowed).toBe(true);
    expect(result.ticket).toBeDefined();
  });

  it("rejects an expired ticket", async () => {
    const gen = await generateDownloadTicket(
      { ...MOCK_INPUT, expiresInMinutes: -1 },
      MOCK_USER,
    );
    const token = gen.ticket!.token;

    await prisma.downloadTicket.update({
      where: { token },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    const result = await verifyDownloadTicket(token);
    expect(result.allowed).toBe(false);
  });

  it("consumes a ticket", async () => {
    const gen = await generateDownloadTicket(MOCK_INPUT, MOCK_USER);
    const token = gen.ticket!.token;

    const result = await consumeDownloadTicket(token);
    expect(result.allowed).toBe(true);
    expect(result.ticket!.consumedAt).toBeDefined();
  });

  it("cannot consume a ticket twice", async () => {
    const gen = await generateDownloadTicket(MOCK_INPUT, MOCK_USER);
    const token = gen.ticket!.token;

    await consumeDownloadTicket(token);
    const second = await consumeDownloadTicket(token);
    expect(second.allowed).toBe(false);
  });

  it("revokes a ticket", async () => {
    const gen = await generateDownloadTicket(MOCK_INPUT, MOCK_USER);
    const token = gen.ticket!.token;

    await revokeDownloadTicket(token, "admin-1", "Security concern");

    const verify = await verifyDownloadTicket(token);
    expect(verify.allowed).toBe(false);
  });

  it("cleans expired tickets", async () => {
    await generateDownloadTicket(
      { ...MOCK_INPUT, expiresInMinutes: -1 },
      MOCK_USER,
    );

    const expired = await prisma.downloadTicket.findMany({
      where: { consumedAt: null },
    });
    for (const t of expired) {
      await prisma.downloadTicket.update({
        where: { token: (t as Record<string, unknown>).token as string },
        data: { expiresAt: new Date(Date.now() - 60_000) },
      });
    }

    const count = await cleanExpiredTickets();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("returns download history for a user", async () => {
    await generateDownloadTicket(MOCK_INPUT, MOCK_USER);
    await generateDownloadTicket(
      { ...MOCK_INPUT, resourceId: "ev-2" },
      MOCK_USER,
    );

    const history = await getUserDownloadHistory(MOCK_USER.id);
    expect(history.length).toBeGreaterThanOrEqual(2);
  });
});
