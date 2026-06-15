// ─── CrmProviderAdapter — Unit Tests ───

import { IntegrationType } from "../../types";
import { CrmProviderAdapter, wrapCrmConnector } from "../crm-adapter";
import type { CrmConnector } from "@/lib/sales/crm/connector";

function makeMockCrmConnector(overrides: Partial<CrmConnector> = {}): jest.Mocked<CrmConnector> {
  return {
    provider: "hubspot" as const,
    testConnection: jest.fn().mockResolvedValue({ success: true, message: "OK" }),
    fetchAccounts: jest.fn().mockResolvedValue([
      { id: "acc-1", name: "Acme", industry: "Tech", website: "acme.com", ownerEmail: "a@acme.com", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]),
    fetchContacts: jest.fn().mockResolvedValue([
      { id: "con-1", accountId: "acc-1", firstName: "John", lastName: "Doe", email: "john@acme.com", phone: "+123", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]),
    fetchOpportunities: jest.fn().mockResolvedValue([
      { id: "opp-1", accountId: "acc-1", name: "Big Deal", amount: 50000, stage: "closed_won", closeDate: "2024-06-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]),
    getRateLimitStatus: jest.fn().mockResolvedValue({ remaining: 100, resetAt: new Date() }),
    ...overrides,
  } as jest.Mocked<CrmConnector>;
}

describe("CrmProviderAdapter", () => {
  let mockConnector: jest.Mocked<CrmConnector>;

  beforeEach(() => {
    mockConnector = makeMockCrmConnector();
  });

  describe("wrapCrmConnector", () => {
    it("returns an adapter with correct providerId and providerType", () => {
      const adapter = wrapCrmConnector(mockConnector);
      expect(adapter.providerId).toBe("hubspot");
      expect(adapter.providerType).toBe(IntegrationType.CRM);
    });
  });

  describe("getAccounts", () => {
    it("delegates to inner connector and maps results", async () => {
      const adapter = new CrmProviderAdapter(mockConnector);
      const accounts = await adapter.getAccounts(new Date("2024-01-01"));

      expect(mockConnector.fetchAccounts).toHaveBeenCalled();
      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toMatchObject({
        id: "acc-1",
        name: "Acme",
        industry: "Tech",
      });
    });

    it("returns empty array when no accounts", async () => {
      mockConnector.fetchAccounts.mockResolvedValue([]);
      const adapter = new CrmProviderAdapter(mockConnector);
      const accounts = await adapter.getAccounts();
      expect(accounts).toEqual([]);
    });
  });

  describe("getContacts", () => {
    it("delegates and maps contacts", async () => {
      const adapter = new CrmProviderAdapter(mockConnector);
      const contacts = await adapter.getContacts();

      expect(mockConnector.fetchContacts).toHaveBeenCalled();
      expect(contacts).toHaveLength(1);
      expect(contacts[0]).toMatchObject({
        id: "con-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@acme.com",
      });
    });
  });

  describe("getOpportunities", () => {
    it("delegates and maps opportunities", async () => {
      const adapter = new CrmProviderAdapter(mockConnector);
      const opps = await adapter.getOpportunities();

      expect(mockConnector.fetchOpportunities).toHaveBeenCalled();
      expect(opps).toHaveLength(1);
      expect(opps[0]).toMatchObject({
        id: "opp-1",
        name: "Big Deal",
        amount: 50000,
        stage: "closed_won",
      });
    });
  });

  describe("testConnection", () => {
    it("delegates to inner connector", async () => {
      const adapter = new CrmProviderAdapter(mockConnector);
      const result = await adapter.testConnection();

      expect(mockConnector.testConnection).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("health", () => {
    it("returns healthy when testConnection succeeds", async () => {
      mockConnector.testConnection.mockResolvedValue({ success: true, message: "OK" });
      const adapter = new CrmProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.lastCheck).toBeInstanceOf(Date);
    });

    it("returns unhealthy when testConnection fails", async () => {
      mockConnector.testConnection.mockResolvedValue({ success: false, message: "API unavailable" });
      const adapter = new CrmProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(false);
      expect(result.error).toBe("API unavailable");
    });

    it("returns unhealthy when testConnection throws", async () => {
      mockConnector.testConnection.mockRejectedValue(new Error("Network error"));
      const adapter = new CrmProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(false);
      expect(result.error).toContain("Network error");
    });
  });
});
