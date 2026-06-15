// ─── ErpProviderAdapter — Unit Tests ───

import { IntegrationType } from "../../types";
import { ErpProviderAdapter, wrapErpConnector } from "../erp-adapter";
import type { ErpConnector } from "@/lib/local-content/erp/connector";

function makeMockErpConnector(overrides: Partial<ErpConnector> = {}): jest.Mocked<ErpConnector> {
  return {
    testConnection: jest.fn().mockResolvedValue({ success: true, message: "OK" }),
    fetchSpendRecords: jest.fn().mockResolvedValue([
      { sourceId: "spend-1", amount: 15000, currency: "SAR", category: "goods", supplierName: "Supplier A", period: "2024-Q1" },
    ]),
    fetchSuppliers: jest.fn().mockResolvedValue([
      { sourceId: "sup-1", name: "Supplier A", registrationNumber: "CR-12345", locality: "Riyadh" },
    ]),
    fetchProcurementLines: jest.fn().mockResolvedValue([]),
    getRateLimitStatus: jest.fn().mockResolvedValue({ remaining: 1000, resetAt: new Date() }),
    ...overrides,
  } as jest.Mocked<ErpConnector>;
}

describe("ErpProviderAdapter", () => {
  let mockConnector: jest.Mocked<ErpConnector>;

  beforeEach(() => {
    mockConnector = makeMockErpConnector();
  });

  describe("wrapErpConnector", () => {
    it("returns an adapter with correct providerType", () => {
      const adapter = wrapErpConnector(mockConnector);
      expect(adapter.providerType).toBe(IntegrationType.ERP);
      expect(adapter.providerId).toBe("erp-adapter");
    });
  });

  describe("fetchSpendRecords", () => {
    it("delegates to inner connector", async () => {
      const adapter = new ErpProviderAdapter(mockConnector);
      const records = await adapter.fetchSpendRecords();

      expect(mockConnector.fetchSpendRecords).toHaveBeenCalled();
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({
        sourceId: "spend-1",
        amount: 15000,
        supplierName: "Supplier A",
      });
    });
  });

  describe("fetchSuppliers", () => {
    it("delegates to inner connector", async () => {
      const adapter = new ErpProviderAdapter(mockConnector);
      const suppliers = await adapter.fetchSuppliers();

      expect(mockConnector.fetchSuppliers).toHaveBeenCalled();
      expect(suppliers).toHaveLength(1);
      expect(suppliers[0]).toMatchObject({
        sourceId: "sup-1",
        name: "Supplier A",
        registrationNumber: "CR-12345",
      });
    });
  });

  describe("testConnection", () => {
    it("delegates to inner connector", async () => {
      const adapter = new ErpProviderAdapter(mockConnector);
      const result = await adapter.testConnection();
      expect(result.success).toBe(true);
    });
  });

  describe("health", () => {
    it("returns healthy when connection succeeds", async () => {
      const adapter = new ErpProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("returns unhealthy when connection fails", async () => {
      mockConnector.testConnection.mockResolvedValue({ success: false, message: "ERP unavailable" });
      const adapter = new ErpProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(false);
      expect(result.error).toBe("ERP unavailable");
    });

    it("returns unhealthy on throw", async () => {
      mockConnector.testConnection.mockRejectedValue(new Error("Timeout"));
      const adapter = new ErpProviderAdapter(mockConnector);
      const result = await adapter.health();

      expect(result.healthy).toBe(false);
    });
  });
});
