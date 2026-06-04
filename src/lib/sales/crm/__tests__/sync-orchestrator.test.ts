import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// Mock prisma before importing modules under test
jest.mock("@/lib/prisma", () => {
  const { PrismaClient } = jest.requireActual("@/__mocks__/prisma-client-mock.js") as typeof import("@/__mocks__/prisma-client-mock");
  const client = new PrismaClient();
  return { prisma: client };
});

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-1" }),
}));

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { runSync, testCrmConnection, listCrmConnections, listSyncLogs } from "../sync-orchestrator";
import { createConnector } from "../connector-factory";
import type { CrmConnector } from "../connector";
import type { CrmConnection } from "@prisma/client";
import type { CrmAccount, CrmContact, CrmOpportunity } from "../types";

const mockConnector: jest.Mocked<CrmConnector> = {
  provider: "hubspot",
  testConnection: jest.fn(),
  fetchAccounts: jest.fn(),
  fetchContacts: jest.fn(),
  fetchOpportunities: jest.fn(),
  getRateLimitStatus: jest.fn(),
};

jest.mock("../connector-factory", () => ({
  createConnector: jest.fn(() => mockConnector),
}));

function seedConnection(overrides: Partial<CrmConnection> = {}) {
  return prisma.crmConnection.create({
    data: {
      organizationId: "org-1",
      provider: "hubspot",
      label: "Test HubSpot",
      accessToken: Buffer.from("test-token").toString("base64"),
      syncEnabled: true,
      conflictPolicy: "crm_wins",
      ...overrides,
    } as Record<string, unknown>,
  });
}

const mockAccount: CrmAccount = {
  id: "hs-acc-1",
  name: "Synced Corp",
  industry: "Tech",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
};

const mockContact: CrmContact = {
  id: "hs-con-1",
  accountId: "hs-acc-1",
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
};

const mockOpportunity: CrmOpportunity = {
  id: "hs-opp-1",
  accountId: "hs-acc-1",
  name: "Synced Deal",
  amount: 25000,
  stage: "qualified",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
};

describe("SyncOrchestrator", () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Clear in-memory stores
    const models = ["crmConnection", "crmSyncLog", "salesAccount", "salesContact", "salesDeal", "salesAuditEvent"];
    for (const model of models) {
      await prisma[model as keyof typeof prisma].deleteMany({} as Record<string, never>);
    }

    mockConnector.fetchAccounts.mockResolvedValue([mockAccount]);
    mockConnector.fetchContacts.mockResolvedValue([mockContact]);
    mockConnector.fetchOpportunities.mockResolvedValue([mockOpportunity]);
  });

  describe("runSync", () => {
    it("syncs accounts, contacts, and opportunities", async () => {
      const connection = await seedConnection();

      const result = await runSync(connection.id, "org-1", { id: "user-1" });

      expect(result.overallStatus).toBe("success");
      expect(result.resources).toHaveLength(3);

      const accResult = result.resources.find((r) => r.resourceType === "account");
      expect(accResult?.createdRecords).toBe(1);

      const conResult = result.resources.find((r) => r.resourceType === "contact");
      expect(conResult?.createdRecords).toBe(1);

      const oppResult = result.resources.find((r) => r.resourceType === "opportunity");
      expect(oppResult?.createdRecords).toBe(1);

      // Verify audit log was called
      expect(writePlatformAuditLog).toHaveBeenCalled();
    });

    it("updates existing records when conflict policy is crm_wins", async () => {
      const connection = await seedConnection();

      // Create an existing account with CRM id in metadata
      await prisma.salesAccount.create({
        data: {
          organizationId: "org-1",
          name: "Old Name",
          metadata: { crmId: "hs-acc-1" } as Record<string, unknown>,
          createdById: "test",
          updatedById: "test",
        },
      });

      const result = await runSync(connection.id, "org-1", { id: "user-1" });
      const accResult = result.resources.find((r) => r.resourceType === "account");
      expect(accResult?.updatedRecords).toBe(1);
    });

    it("handles partial sync failure gracefully", async () => {
      const connection = await seedConnection();
      mockConnector.fetchAccounts.mockRejectedValueOnce(new Error("API down"));

      const result = await runSync(connection.id, "org-1", { id: "user-1" });

      const accResult = result.resources.find((r) => r.resourceType === "account");
      expect(accResult?.status).toBe("failed");

      const conResult = result.resources.find((r) => r.resourceType === "contact");
      expect(conResult?.status).toBe("success");
    });

    it("respects resource type filter", async () => {
      const connection = await seedConnection();

      const result = await runSync(connection.id, "org-1", { id: "user-1" }, {
        resourceTypes: ["account"],
      });

      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].resourceType).toBe("account");
    });

    it("creates sync logs for each resource", async () => {
      const connection = await seedConnection();

      await runSync(connection.id, "org-1", { id: "user-1" });

      const logs = await prisma.crmSyncLog.findMany({
        where: { connectionId: connection.id },
      });
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it("updates connection last sync status", async () => {
      const connection = await seedConnection();

      await runSync(connection.id, "org-1", { id: "user-1" });

      const updated = await prisma.crmConnection.findFirst({
        where: { id: connection.id },
      });
      expect(updated?.lastSyncStatus).toBe("success");
      expect(updated?.lastSyncAt).toBeDefined();
    });
  });

  describe("testCrmConnection", () => {
    it("tests connection and returns result", async () => {
      const connection = await seedConnection();
      mockConnector.testConnection.mockResolvedValue({ success: true, message: "OK" });

      const result = await testCrmConnection(connection.id, "org-1");
      expect(result.success).toBe(true);
      expect(result.message).toBe("OK");
    });

    it("throws if connection not in org", async () => {
      await expect(
        testCrmConnection("nonexistent", "org-1"),
      ).rejects.toThrow("CRM connection not found for this organization");
    });
  });

  describe("listCrmConnections", () => {
    it("lists connections for organization", async () => {
      await seedConnection({ label: "Conn 1" });
      await seedConnection({ label: "Conn 2", provider: "salesforce" });

      const list = await listCrmConnections("org-1");
      expect(list).toHaveLength(2);
    });

    it("returns empty for org with no connections", async () => {
      const list = await listCrmConnections("org-empty");
      expect(list).toHaveLength(0);
    });
  });

  describe("listSyncLogs", () => {
    it("returns sync logs for a connection", async () => {
      const connection = await seedConnection();

      // Create a sync log
      await prisma.crmSyncLog.create({
        data: {
          connectionId: connection.id,
          organizationId: "org-1",
          resourceType: "account",
          direction: "import",
          status: "success",
          totalRecords: 5,
          createdRecords: 3,
          updatedRecords: 2,
          completedAt: new Date(),
        } as Record<string, unknown>,
      });

      const logs = await listSyncLogs(connection.id, "org-1");
      expect(logs).toHaveLength(1);
      expect(logs[0].totalRecords).toBe(5);
    });
  });
});
