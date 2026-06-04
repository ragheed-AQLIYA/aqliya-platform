import { describe, expect, it } from "@jest/globals";
import {
  getDefaultMappingsForProvider,
  getCategoryMapForProvider,
  mapErpSpendToLocalContent,
  type FieldMappingConfig,
} from "../field-mapping";
import type { ErpSpendRecord } from "../types";

describe("ERP field mapping", () => {
  it("returns default SAP mappings", () => {
    const mappings = getDefaultMappingsForProvider("sap");
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings.some((m) => m.targetField === "amount")).toBe(true);
    expect(mappings.some((m) => m.targetField === "supplierName")).toBe(true);
    expect(mappings.some((m) => m.targetField === "period")).toBe(true);
  });

  it("returns default Oracle mappings", () => {
    const mappings = getDefaultMappingsForProvider("oracle");
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings.some((m) => m.targetField === "amount")).toBe(true);
    expect(mappings.some((m) => m.targetField === "vendor_name")).toBe(true);
  });

  it("returns default CSV mappings for unknown provider", () => {
    const mappings = getDefaultMappingsForProvider("unknown-system");
    expect(mappings.some((m) => m.targetField === "amount")).toBe(true);
    expect(mappings.some((m) => m.targetField === "supplierName")).toBe(true);
  });

  it("returns SAP category map", () => {
    const catMap = getCategoryMapForProvider("sap");
    expect(catMap["ROH"]).toBe("goods");
    expect(catMap["DIEN"]).toBe("services");
  });

  it("returns empty category map for CSV provider", () => {
    const catMap = getCategoryMapForProvider("csv-upload");
    expect(Object.keys(catMap)).toHaveLength(0);
  });
});

describe("mapErpSpendToLocalContent", () => {
  const baseErpRecord: ErpSpendRecord = {
    sourceId: "PO-001",
    amount: 5000000,
    currency: "SAR",
    category: "goods",
    supplierName: "شركة التقنية",
    period: "2024-Q1",
    contractReference: "PO-001",
  };

  it("maps SAP record with default mappings", async () => {
    const sapRecord: ErpSpendRecord = {
      ...baseErpRecord,
      sourceId: "4500012345",
      amount: 2500000,
      category: "DIEN",
    };

    const result = await mapErpSpendToLocalContent(sapRecord, "sap");
    expect(result.supplierName).toBe("شركة التقنية");
    expect(result.amount).toBe(2500000);
    expect(result.sourceId).toBe("4500012345");
  });

  it("maps Oracle record with default mappings", async () => {
    const oracleRecord: ErpSpendRecord = {
      ...baseErpRecord,
      sourceId: "INV-2024-001",
      amount: 750000,
      supplierRegistrationNumber: "CR-12345",
      invoiceNumber: "INV-001",
    };

    const result = await mapErpSpendToLocalContent(oracleRecord, "oracle");
    expect(result.supplierName).toBe("شركة التقنية");
    expect(result.amount).toBe(750000);
    expect(result.invoiceNumber).toBe("INV-001");
  });

  it("maps CSV record with default mappings", async () => {
    const result = await mapErpSpendToLocalContent(baseErpRecord, "csv-upload");
    expect(result.supplierName).toBe("شركة التقنية");
    expect(result.amount).toBe(5000000);
    expect(result.currency).toBe("SAR");
  });

  it("applies custom mapping overrides", async () => {
    const record: ErpSpendRecord = {
      ...baseErpRecord,
      supplierName: "VENDOR_X",
    };

    const result = await mapErpSpendToLocalContent(record, "csv-upload", {
      supplierName: "vendorName",
    });

    expect(result.supplierName).toBe("VENDOR_X");
  });

  it("returns zero for NaN amount", async () => {
    const record: ErpSpendRecord = {
      ...baseErpRecord,
      amount: NaN,
    };

    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.amount).toBe(0);
  });

  it("handles missing optional fields gracefully", async () => {
    const record: ErpSpendRecord = {
      sourceId: "S-001",
      amount: 100000,
      currency: "SAR",
      category: "services",
      supplierName: "مورد",
      period: "2024",
    };

    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.contractReference).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.invoiceNumber).toBeUndefined();
  });
});
