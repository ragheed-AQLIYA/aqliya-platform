import { describe, expect, it } from "@jest/globals";
import {
  getDefaultMappingsForProvider,
  getCategoryMapForProvider,
  mapErpSpendToLocalContent,
  PROVIDER_DEFAULTS,
} from "../erp/field-mapping";
import type { ErpSpendRecord } from "../erp/types";
import { detectFileFormat } from "../erp/file-importer";

// --- getDefaultMappingsForProvider ---

describe("getDefaultMappingsForProvider - all providers", () => {
  it("returns SAP mappings for sap provider", () => {
    const mappings = getDefaultMappingsForProvider("sap");
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings.some((m) => m.targetField === "amount" && m.transform === "parseFloat")).toBe(true);
    expect(mappings.some((m) => m.targetField === "supplierName" && m.required)).toBe(true);
    expect(mappings.some((m) => m.targetField === "period" && m.required)).toBe(true);
    expect(mappings.some((m) => m.targetField === "costCenter")).toBe(true);
  });

  it("returns Oracle mappings for oracle provider", () => {
    const mappings = getDefaultMappingsForProvider("oracle");
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings.some((m) => m.targetField === "vendor_name")).toBe(true);
    expect(mappings.some((m) => m.targetField === "costCenter")).toBe(true);
  });

  it("returns CSV mappings for csv-upload provider", () => {
    const mappings = getDefaultMappingsForProvider("csv-upload");
    expect(mappings.some((m) => m.targetField === "amount")).toBe(true);
    expect(mappings.some((m) => m.targetField === "supplierName")).toBe(true);
  });

  it("returns CSV mappings for unknown provider", () => {
    const mappings = getDefaultMappingsForProvider("unknown-system");
    expect(mappings.some((m) => m.targetField === "amount")).toBe(true);
    expect(mappings.some((m) => m.targetField === "supplierName")).toBe(true);
  });
});

// --- getCategoryMapForProvider ---

describe("getCategoryMapForProvider - category mappings", () => {
  it("returns SAP category map", () => {
    const catMap = getCategoryMapForProvider("sap");
    expect(catMap["ROH"]).toBe("goods");
    expect(catMap["FERT"]).toBe("goods");
    expect(catMap["DIEN"]).toBe("services");
    expect(catMap["LEER"]).toBe("services");
  });

  it("returns Oracle category map", () => {
    const catMap = getCategoryMapForProvider("oracle");
    expect(catMap["GOODS"]).toBe("goods");
    expect(catMap["SERVICES"]).toBe("services");
    expect(catMap["CONSTRUCTION"]).toBe("construction");
    expect(catMap["TECHNOLOGY"]).toBe("technology");
  });

  it("returns empty category map for csv-upload", () => {
    const catMap = getCategoryMapForProvider("csv-upload");
    expect(Object.keys(catMap)).toHaveLength(0);
  });

  it("returns empty category map for unknown provider", () => {
    const catMap = getCategoryMapForProvider("nonexistent");
    expect(Object.keys(catMap)).toHaveLength(0);
  });
});

// --- mapErpSpendToLocalContent transforms ---

const baseRecord: ErpSpendRecord = {
  sourceId: "PO-001",
  amount: 5000000,
  currency: "SAR",
  category: "goods",
  supplierName: "Test Supplier",
  period: "2024-Q1",
  contractReference: "CTR-001",
};

describe("mapErpSpendToLocalContent - transforms and mappings", () => {
  it("maps SAP DIEN category to services", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "DIEN", sourceId: "SAP-001" };
    const result = await mapErpSpendToLocalContent(record, "sap");
    expect(result.category).toBe("services");
    expect(result.sourceId).toBe("SAP-001");
  });

  it("maps SAP ROH category to goods", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "ROH", sourceId: "SAP-002" };
    const result = await mapErpSpendToLocalContent(record, "sap");
    expect(result.category).toBe("goods");
  });

  it("maps Oracle GOODS category to goods", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "GOODS", sourceId: "ORA-001" };
    const result = await mapErpSpendToLocalContent(record, "oracle");
    expect(result.category).toBe("goods");
  });

  it("maps Oracle SERVICES category to services", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "SERVICES", sourceId: "ORA-002" };
    const result = await mapErpSpendToLocalContent(record, "oracle");
    expect(result.category).toBe("services");
  });

  it("maps Oracle CONSTRUCTION category to construction", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "CONSTRUCTION", sourceId: "ORA-003" };
    const result = await mapErpSpendToLocalContent(record, "oracle");
    expect(result.category).toBe("construction");
  });

  it("preserves unknown category as lowercase for csv-upload", async () => {
    const record: ErpSpendRecord = { ...baseRecord, category: "CustomCategory" };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.category).toBe("customcategory");
  });

  it("handles NaN amount by returning 0", async () => {
    const record: ErpSpendRecord = { ...baseRecord, amount: NaN };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.amount).toBe(0);
  });

  it("handles zero amount correctly", async () => {
    const record: ErpSpendRecord = { ...baseRecord, amount: 0 };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.amount).toBe(0);
  });

  it("handles very large amounts", async () => {
    const record: ErpSpendRecord = { ...baseRecord, amount: 999999999999 };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.amount).toBe(999999999999);
  });

  it("preserves supplier name", async () => {
    const record: ErpSpendRecord = { ...baseRecord, supplierName: "Saudi Company Ltd" };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.supplierName).toBe("Saudi Company Ltd");
  });

  it("returns undefined for missing optional fields", async () => {
    const record: ErpSpendRecord = {
      sourceId: "S-001",
      amount: 100000,
      currency: "SAR",
      category: "services",
      supplierName: "Minimal Supplier",
      period: "2024",
    };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.contractReference).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.invoiceNumber).toBeUndefined();
    expect(result.costCenter).toBeUndefined();
  });

  it("sets sourceSystem to provider name", async () => {
    const result = await mapErpSpendToLocalContent(baseRecord, "sap");
    expect(result.sourceSystem).toBe("sap");
  });

  it("applies custom mapping overrides", async () => {
    const record: ErpSpendRecord = { ...baseRecord, supplierName: "VENDOR_X" };
    const result = await mapErpSpendToLocalContent(record, "csv-upload", {
      supplierName: "vendorName",
    });
    expect(result.supplierName).toBe("VENDOR_X");
  });

  it("uses default currency SAR when not provided", async () => {
    const record: ErpSpendRecord = { ...baseRecord, currency: "" };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.currency).toBe("SAR");
  });

  it("preserves explicit currency", async () => {
    const record: ErpSpendRecord = { ...baseRecord, currency: "USD" };
    const result = await mapErpSpendToLocalContent(record, "csv-upload");
    expect(result.currency).toBe("USD");
  });

  it("maps all provider defaults have consistent structure", () => {
    expect(PROVIDER_DEFAULTS["sap"]).toBeDefined();
    expect(PROVIDER_DEFAULTS["oracle"]).toBeDefined();
    expect(PROVIDER_DEFAULTS["csv-upload"]).toBeDefined();
    for (const key of Object.keys(PROVIDER_DEFAULTS)) {
      const def = PROVIDER_DEFAULTS[key];
      expect(Array.isArray(def.mappings)).toBe(true);
      expect(typeof def.categoryMap).toBe("object");
    }
  });
});

// --- detectFileFormat ---

describe("detectFileFormat", () => {
  it("detects CSV files", () => {
    expect(detectFileFormat("data.csv")).toBe("csv");
    expect(detectFileFormat("DATA.CSV")).toBe("csv");
  });

  it("detects XLSX files", () => {
    expect(detectFileFormat("report.xlsx")).toBe("excel");
    expect(detectFileFormat("REPORT.XLSX")).toBe("excel");
  });

  it("detects XLS files", () => {
    expect(detectFileFormat("old.xls")).toBe("excel");
  });

  it("returns unknown for unrecognized extensions", () => {
    expect(detectFileFormat("data.txt")).toBe("unknown");
    expect(detectFileFormat("data.json")).toBe("unknown");
    expect(detectFileFormat("data")).toBe("unknown");
  });
});