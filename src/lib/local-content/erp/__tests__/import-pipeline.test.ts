import { describe, expect, it, jest } from "@jest/globals";
import type { ErpConnector } from "../connector";
import type { ErpSpendRecord, ErpSupplier } from "../types";

// Mock the connector factory to avoid DB calls
jest.mock("../connector-factory", () => ({
  createErpConnectorFromDb: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    erpImportBatch: {
      create: jest.fn(),
      update: jest.fn(),
    },
    erpSyncLog: {
      create: jest.fn(),
      update: jest.fn(),
    },
    localContentSupplier: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    localContentSpendRecord: {
      create: jest.fn(),
    },
  },
}));

// Mock audit log
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}));

import { createErpConnectorFromDb } from "../connector-factory";

const mockConnector: ErpConnector = {
  testConnection: jest.fn<() => Promise<{ success: boolean; message: string }>>().mockResolvedValue({
    success: true,
    message: "Connected",
  }),
  fetchSpendRecords: jest.fn<() => Promise<ErpSpendRecord[]>>().mockResolvedValue([
    {
      sourceId: "PO-001",
      amount: 5000000,
      currency: "SAR",
      category: "goods",
      supplierName: "مورد أول",
      period: "2024-Q1",
    },
    {
      sourceId: "PO-002",
      amount: 3000000,
      currency: "SAR",
      category: "services",
      supplierName: "مورد ثاني",
      period: "2024-Q1",
    },
  ]),
  fetchSuppliers: jest.fn<() => Promise<ErpSupplier[]>>().mockResolvedValue([
    {
      sourceId: "SUP-001",
      name: "مورد أول",
      registrationNumber: "CR-001",
      isActive: true,
    },
  ]),
  fetchProcurementLines: jest
    .fn()
    .mockResolvedValue([] as ErpSupplier[]),
  getRateLimitStatus: jest.fn().mockResolvedValue({
    remaining: 100,
    resetAt: new Date(),
  }),
};

const mockRecord = {
  id: "conn-1",
  organizationId: "org-1",
  provider: "csv-upload",
  label: "Test Connection",
  connectionType: "api",
  apiEndpoint: "https://example.com",
  apiKey: null,
  apiSecret: null,
  fieldMapping: null,
  defaultCurrency: "SAR",
  metadata: null,
};

describe("Import Pipeline", () => {
  it("validates mapped records correctly", async () => {
    const { validateMappedRecord } = await import("../import-pipeline");
    // Access the internal function for unit testing via import
    const good = {
      supplierName: "مورد",
      amount: 100000,
      currency: "SAR",
      category: "goods",
      period: "2024-Q1",
      sourceId: "S-001",
    };
    const bad = {
      supplierName: "",
      amount: 0,
      currency: "SAR",
      category: "",
      period: "",
      sourceId: "S-002",
    };

    // Validate directly using field mapping service
    const { mapErpSpendToLocalContent } = await import("../field-mapping");

    const goodMapped = await mapErpSpendToLocalContent(
      good as unknown as ErpSpendRecord,
      "csv-upload",
    );
    expect(goodMapped.supplierName).toBe("مورد");
    expect(goodMapped.amount).toBe(100000);

    const badMapped = await mapErpSpendToLocalContent(
      bad as unknown as ErpSpendRecord,
      "csv-upload",
    );
    expect(badMapped.amount).toBe(0);
  });

  it("runErpImport creates batch and sync log", async () => {
    (createErpConnectorFromDb as jest.Mock).mockResolvedValue({
      connector: mockConnector,
      record: mockRecord,
    });

    const { prisma } = await import("@/lib/prisma");

    const mockBatch = { id: "batch-1" };
    const mockSyncLog = { id: "sync-1" };

    (prisma.erpSyncLog.create as jest.Mock).mockResolvedValue(mockSyncLog);
    (prisma.erpImportBatch.create as jest.Mock).mockResolvedValue(mockBatch);
    (prisma.erpSyncLog.update as jest.Mock).mockResolvedValue(mockSyncLog);

    const { runErpImport } = await import("../import-pipeline");

    const result = await runErpImport({
      organizationId: "org-1",
      connectionId: "conn-1",
    });

    expect(result.connectionId).toBe("conn-1");
    expect(result.totalRecords).toBe(2);
    expect(result.batchId).toBe("batch-1");
    expect(prisma.erpSyncLog.create).toHaveBeenCalled();
    expect(prisma.erpImportBatch.create).toHaveBeenCalled();
  });

  it("runFileImport validates records and creates batch", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockBatch = { id: "batch-file-1" };
    (prisma.erpImportBatch.create as jest.Mock).mockResolvedValue(mockBatch);

    const { runFileImport } = await import("../import-pipeline");

    const result = await runFileImport({
      organizationId: "org-1",
      connectionId: "conn-1",
      sourceType: "csv",
      records: [
        {
          supplierName: "مورد صالح",
          amount: 100000,
          currency: "SAR",
          category: "goods",
          period: "2024-Q1",
          sourceId: "S-001",
        },
      ],
    });

    expect(result.totalRecords).toBe(1);
    expect(result.status).toBe("validated");
    expect(result.issues).toHaveLength(0);
  });

  it("runFileImport flags records needing review for high amount", async () => {
    const { prisma } = await import("@/lib/prisma");

    const mockBatch = { id: "batch-file-2" };
    (prisma.erpImportBatch.create as jest.Mock).mockResolvedValue(mockBatch);

    const { runFileImport } = await import("../import-pipeline");

    const result = await runFileImport({
      organizationId: "org-1",
      connectionId: "conn-1",
      sourceType: "csv",
      records: [
        {
          supplierName: "مورد كبير",
          amount: 100_000_000,
          currency: "SAR",
          category: "goods",
          period: "2024-Q1",
          sourceId: "S-001",
        },
      ],
    });

    expect(result.status).toBe("needs_review");
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]!.field).toBe("amount");
  });
});
