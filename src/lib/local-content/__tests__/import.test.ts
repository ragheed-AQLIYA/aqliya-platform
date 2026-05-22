import { describe, expect, it } from "@jest/globals";
import { parseLocalContentCSV } from "../import";

describe("LocalContentOS CSV import", () => {
  it("rejects CSV without header row", () => {
    const result = parseLocalContentCSV("");
    expect(result.validRows).toHaveLength(0);
    expect(result.rejectedRows.length).toBeGreaterThan(0);
  });

  it("rejects CSV with no data rows", () => {
    const result = parseLocalContentCSV("amount,supplierName,category,period");
    expect(result.validRows).toHaveLength(0);
  });

  it("parses valid English-header CSV", () => {
    const csv = [
      "amount,supplierName,category,period,currency,contractReference",
      "5000000,شركة التقنية المتقدمة,technology,Q1,SAR,PO-2025-001",
      "3000000,GlobalTech Solutions,technology,Q2,USD,PO-2025-002",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0]!.supplierName).toBe("شركة التقنية المتقدمة");
    expect(result.validRows[0]!.amount).toBe(5000000);
    expect(result.validRows[1]!.currency).toBe("USD");
    expect(result.summary.total).toBe(2);
    expect(result.summary.valid).toBe(2);
    expect(result.summary.rejected).toBe(0);
  });

  it("parses Arabic-header CSV", () => {
    const csv = [
      "المبلغ,اسم المورد,تصنيف الإنفاق,الفترة,العملة",
      "5000000,شركة التقنية,technology,الربع الأول,SAR",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.supplierName).toBe("شركة التقنية");
    expect(result.validRows[0]!.amount).toBe(5000000);
    expect(result.validRows[0]!.period).toBe("الربع الأول");
  });

  it("rejects rows with invalid amounts", () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,المورد الأول,technology,Q1",
      "abc,المورد الثاني,goods,Q2",
      "-100,المورد الثالث,services,Q3",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.rejectedRows).toHaveLength(2);
  });

  it("rejects rows with missing required fields", () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,,technology,Q1",
      "3000000,المورد,,",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.rejectedRows).toHaveLength(2);
  });

  it("handles quoted values", () => {
    const csv = [
      "amount,supplierName,category,period,description",
      '5000000,"شركة التقنية المتقدمة",technology,Q1,"خوادم ومعدات"',
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.description).toBe("خوادم ومعدات");
  });

  it("returns summary counts", () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,المورد الأول,technology,Q1",
      "3000000,المورد الثاني,goods,Q2",
      "abc,المورد الثالث,services,Q3",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.summary.total).toBe(3);
    expect(result.summary.valid).toBe(2);
    expect(result.summary.rejected).toBe(1);
  });

  it("accepts optional columns like description and contractReference", () => {
    const csv = [
      "amount,supplierName,category,period,contractReference,description",
      "5000000,المورد,technology,Q1,PO-001,معدات شبكات",
    ].join("\n");

    const result = parseLocalContentCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.contractReference).toBe("PO-001");
  });
});
