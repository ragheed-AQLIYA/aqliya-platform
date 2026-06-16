// ─── WorkflowOS Services Tests ───

import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// Stateful mock store
const clientStore: Array<Record<string, unknown>> = [];
const membershipStore: Array<Record<string, unknown>> = [];
const auditEventStore: Array<Record<string, unknown>> = [];
const recordStore: Array<Record<string, unknown>> = [];
const documentStore: Array<Record<string, unknown>> = [];
const reviewStore: Array<Record<string, unknown>> = [];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    sunbulClient: {
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        let results = [...clientStore];
        if (where && Object.keys(where).length > 0) {
          const w = where as Record<string, unknown>;
          if (w.platformOrganizationId) {
            results = results.filter((c) => c.platformOrganizationId === w.platformOrganizationId);
          }
        }
        return results;
      }),
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const w = where as Record<string, unknown>;
        if (w.id) {
          return clientStore.find((c) => c.id === w.id) ?? null;
        }
        if (w.slug) {
          return clientStore.find((c) => c.slug === w.slug) ?? null;
        }
        return null;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `client-${clientStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        clientStore.push(record);
        return record;
      }),
      update: jest.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const idx = clientStore.findIndex((c) => c.id === (where as { id: string }).id);
        if (idx === -1) throw new Error("Client not found");
        clientStore[idx] = { ...clientStore[idx], ...data, updatedAt: new Date() };
        return clientStore[idx];
      }),
    },
    sunbulUserMembership: {
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        let results = [...membershipStore];
        if (where) {
          const w = where as Record<string, unknown>;
          if (w.userId) results = results.filter((m) => m.userId === w.userId);
          if (w.clientId) results = results.filter((m) => m.clientId === w.clientId);
          if (w.status) results = results.filter((m) => m.status === w.status);
        }
        return results;
      }),
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const w = where as Record<string, unknown>;
        if (w.clientId_userId) {
          const cu = w.clientId_userId as Record<string, string>;
          return membershipStore.find((m) => m.clientId === cu.clientId && m.userId === cu.userId) ?? null;
        }
        return membershipStore.find((m) => m.id === (w as { id: string }).id) ?? null;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `mem-${membershipStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), status: "Active", ...data };
        membershipStore.push(record);
        return record;
      }),
      update: jest.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const idx = membershipStore.findIndex((m) => m.id === (where as { id: string }).id);
        if (idx === -1) throw new Error("Membership not found");
        membershipStore[idx] = { ...membershipStore[idx], ...data, updatedAt: new Date() };
        return membershipStore[idx];
      }),
    },
    sunbulAuditEvent: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `audit-${auditEventStore.length + 1}`, createdAt: new Date(), ...data };
        auditEventStore.push(record);
        return record;
      }),
    },
    sunbulRecord: {
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        let results = [...recordStore];
        if (where) {
          const w = where as Record<string, unknown>;
          if (w.clientId) results = results.filter((r) => r.clientId === w.clientId);
          if (w.status) results = results.filter((r) => r.status === w.status);
        }
        return results;
      }),
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        return recordStore.find((r) => r.id === (where as { id: string }).id) ?? null;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `rec-${recordStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        recordStore.push(record);
        return record;
      }),
      update: jest.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const idx = recordStore.findIndex((r) => r.id === (where as { id: string }).id);
        if (idx === -1) throw new Error("Record not found");
        recordStore[idx] = { ...recordStore[idx], ...data, updatedAt: new Date() };
        return recordStore[idx];
      }),
    },
    sunbulDocument: {
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        let results = [...documentStore];
        if (where) {
          const w = where as Record<string, unknown>;
          if (w.recordId) results = results.filter((d) => d.recordId === w.recordId);
        }
        return results;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `doc-${documentStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        documentStore.push(record);
        return record;
      }),
    },
    sunbulReview: {
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        let results = [...reviewStore];
        if (where) {
          const w = where as Record<string, unknown>;
          if (w.recordId) results = results.filter((r) => r.recordId === w.recordId);
        }
        return results;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `rev-${reviewStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        reviewStore.push(record);
        return record;
      }),
    },
  },
}));

// Mock auth
jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

// Mock tenant guard
jest.mock("@/lib/workflowos/tenant-guard", () => ({
  requireClientAccess: jest.fn(),
  requireWorkflowAdmin: jest.fn(),
}));

// Mock audit
jest.mock("@/lib/workflowos/audit", () => ({
  createWorkflowAuditEvent: jest.fn(),
}));

import { getCurrentUser } from "@/lib/auth";
import { requireClientAccess, requireWorkflowAdmin } from "@/lib/workflowos/tenant-guard";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";
import {
  listWorkflowClientsForUser,
  getWorkflowClient,
  createWorkflowClient,
  updateWorkflowClientStatus,
  createWorkflowMembership,
  listWorkflowMemberships,
} from "../services";

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockRequireClientAccess = requireClientAccess as jest.Mock;
const mockRequireWorkflowAdmin = requireWorkflowAdmin as jest.Mock;

beforeEach(() => {
  clientStore.length = 0;
  membershipStore.length = 0;
  auditEventStore.length = 0;
  recordStore.length = 0;
  documentStore.length = 0;
  reviewStore.length = 0;
  jest.clearAllMocks();

  mockGetCurrentUser.mockResolvedValue({
    id: "user-1",
    organizationId: "org-1",
    role: "ADMIN",
    platformOrganizationId: "platform-1",
  });

  mockRequireClientAccess.mockResolvedValue(undefined);
  mockRequireWorkflowAdmin.mockResolvedValue({
    id: "user-1",
    role: "ADMIN",
    platformOrganizationId: "platform-1",
  });
});

// ─── listWorkflowClientsForUser ───

describe("listWorkflowClientsForUser", () => {
  it("returns all clients for admin user", async () => {
    clientStore.push({ id: "c1", name: "Client A", slug: "client-a", platformOrganizationId: "platform-1" });
    clientStore.push({ id: "c2", name: "Client B", slug: "client-b", platformOrganizationId: "platform-1" });

    const result = await listWorkflowClientsForUser();
    expect(result).toHaveLength(2);
  });

  it("filters clients by platformOrganizationId for admin with org filter", async () => {
    clientStore.push({ id: "c1", name: "Client A", slug: "client-a", platformOrganizationId: "platform-1" });
    clientStore.push({ id: "c2", name: "Client B", slug: "client-b", platformOrganizationId: "platform-2" });

    // Clear default mock to match specific org
    mockGetCurrentUser.mockResolvedValue({
      id: "user-1",
      organizationId: "org-1",
      role: "ADMIN",
      platformOrganizationId: "platform-1",
    });

    const result = await listWorkflowClientsForUser();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("returns membership clients for non-admin user", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user-2",
      organizationId: "org-2",
      role: "OPERATOR",
    });

    clientStore.push({ id: "c1", name: "Client A", slug: "client-a" });
    membershipStore.push({ userId: "user-2", clientId: "c1", status: "Active", client: { id: "c1", name: "Client A", slug: "client-a" } });

    const result = await listWorkflowClientsForUser();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("returns empty list for non-admin with no memberships", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user-3",
      organizationId: "org-3",
      role: "OPERATOR",
    });

    const result = await listWorkflowClientsForUser();
    expect(result).toHaveLength(0);
  });
});

// ─── getWorkflowClient ───

describe("getWorkflowClient", () => {
  it("returns client by id", async () => {
    clientStore.push({ id: "c1", name: "Client A", slug: "client-a" });
    const result = await getWorkflowClient("c1");
    expect(result).toBeDefined();
    expect(result?.id).toBe("c1");
    expect(mockRequireClientAccess).toHaveBeenCalledWith("c1");
  });

  it("returns null for non-existent client", async () => {
    const result = await getWorkflowClient("nonexistent");
    expect(result).toBeNull();
  });
});

// ─── createWorkflowClient ───

describe("createWorkflowClient", () => {
  it("creates a new client", async () => {
    const result = await createWorkflowClient({
      name: "New Client",
      slug: "new-client",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("New Client");
    expect(result.slug).toBe("new-client");
    expect(createWorkflowAuditEvent).toHaveBeenCalled();
  });

  it("throws on duplicate slug", async () => {
    clientStore.push({ id: "c1", name: "Existing", slug: "duplicate" });

    await expect(createWorkflowClient({
      name: "New Client",
      slug: "duplicate",
    })).rejects.toThrow("Client with this slug already exists");
  });
});

// ─── updateWorkflowClientStatus ───

describe("updateWorkflowClientStatus", () => {
  it("updates client status", async () => {
    clientStore.push({ id: "c1", name: "Client A", slug: "client-a", platformOrganizationId: "platform-1", status: "active" });

    const result = await updateWorkflowClientStatus("c1", "inactive");
    expect(result.status).toBe("inactive");
    expect(createWorkflowAuditEvent).toHaveBeenCalled();
  });

  it("throws for non-existent client", async () => {
    await expect(updateWorkflowClientStatus("nonexistent", "active")).rejects.toThrow("Client not found");
  });

  it("throws for wrong org client", async () => {
    clientStore.push({ id: "c1", name: "Client A", slug: "client-a", platformOrganizationId: "platform-other", status: "active" });

    await expect(updateWorkflowClientStatus("c1", "active")).rejects.toThrow("Access denied");
  });
});

// ─── createWorkflowMembership ───

describe("createWorkflowMembership", () => {
  it("creates a membership with valid role", async () => {
    const result = await createWorkflowMembership({
      clientId: "c1",
      userId: "user-2",
      role: "Reviewer",
    });

    expect(result).toBeDefined();
    expect(result.clientId).toBe("c1");
    expect(result.userId).toBe("user-2");
    expect(result.role).toBe("Reviewer");
    expect(createWorkflowAuditEvent).toHaveBeenCalled();
  });

  it("throws for invalid role", async () => {
    await expect(createWorkflowMembership({
      clientId: "c1",
      userId: "user-2",
      role: "SuperAdmin",
    })).rejects.toThrow("Invalid role: SuperAdmin");
  });
});

// ─── listWorkflowMemberships ───

describe("listWorkflowMemberships", () => {
  it("returns memberships for a client", async () => {
    membershipStore.push({ id: "m1", clientId: "c1", userId: "u1", role: "Operator", status: "Active" });
    membershipStore.push({ id: "m2", clientId: "c1", userId: "u2", role: "Reviewer", status: "Active" });
    membershipStore.push({ id: "m3", clientId: "c2", userId: "u3", role: "Operator", status: "Active" });

    const result = await listWorkflowMemberships("c1");
    expect(result).toHaveLength(2);
    expect(mockRequireClientAccess).toHaveBeenCalledWith("c1");
  });
});
