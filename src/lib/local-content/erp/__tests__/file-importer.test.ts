import { describe, expect, it } from "@jest/globals";
import { createWorkbook, writeBuffer } from "@/lib/xlsx";
import { parseCsvFile, parseExcelFile, detectFileFormat } from "../file-importer";

describe("ERP file importer — CSV", () => {
  it("parses a valid CSV with English headers", async () => {
    const csv = [
      "amount,supplierName,category,period,currency",
      "5000000,شركة التقنية,technology,Q1,SAR",
      "3000000,GlobalTech,services,Q2,USD",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.totalRows).toBe(2);
    expect(result.validRows).toHaveLength(2);
    expect(result.errorRows).toHaveLength(0);
    expect(result.fileHash).toBeTruthy();
    expect(result.headers).toContain("amount");
  });

  it("parses a valid CSV with Arabic headers", async () => {
    const csv = [
      "المبلغ,اسم المورد,تصنيف الإنفاق,الفترة,العملة",
      "5000000,شركة التقنية,technology,الربع الأول,SAR",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.totalRows).toBe(1);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.data.supplierName).toBe("شركة التقنية");
    expect(result.validRows[0]!.data.amount).toBe("5000000");
  });

  it("rejects rows with invalid amount", async () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,المورد الأول,technology,Q1",
      "abc,المورد الثاني,goods,Q2",
      "-100,المورد الثالث,services,Q3",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.validRows).toHaveLength(1);
    expect(result.errorRows).toHaveLength(2);
  });

  it("rejects rows with missing required fields", async () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,,technology,Q1",
      "3000000,المورد,,Q2",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.validRows).toHaveLength(0);
    expect(result.errorRows).toHaveLength(2);
  });

  it("rejects empty CSV", async () => {
    const result = await parseCsvFile(Buffer.from("", "utf-8"));
    expect(result.totalRows).toBe(0);
    expect(result.errorRows.length).toBeGreaterThan(0);
  });

  it("handles max rows exceeded", async () => {
    const header = "amount,supplierName,category,period\n";
    const rows = Array.from({ length: 100_001 }, (_, i) => `${i},supplier${i},goods,Q1`).join("\n");
    const csv = header + rows;
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"), { maxRows: 100_000 });
    expect(result.totalRows).toBe(0);
    expect(result.errorRows.length).toBeGreaterThan(0);
    expect(result.errorRows[0]!.errors[0]).toContain("الحد الأقصى");
  });

  it("warns on unusually large amount", async () => {
    const csv = [
      "amount,supplierName,category,period",
      "999999999999,المورد,goods,Q1",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.warnings.length).toBeGreaterThan(0);
  });

  it("handles custom column mapping", async () => {
    const csv = [
      "المبلغ,المورد,التصنيف,الفترة",
      "5000000,شركة التقنية,goods,2024-Q1",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"), {
      columnMapping: [
        { sourceField: "المبلغ", targetField: "amount" },
        { sourceField: "المورد", targetField: "supplierName" },
        { sourceField: "التصنيف", targetField: "category" },
        { sourceField: "الفترة", targetField: "period" },
      ],
    });
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.data.amount).toBe("5000000");
  });

  it("warns on unexpected period format", async () => {
    const csv = [
      "amount,supplierName,category,period",
      "5000000,المورد,goods,unknown-period",
    ].join("\n");
    const result = await parseCsvFile(Buffer.from(csv, "utf-8"));
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]!.warnings.some((w) => w.includes("صيغة الفترة"))).toBe(true);
  });
});

describe("detectFileFormat", () => {
  it("detects CSV", () => {
    expect(detectFileFormat("data.csv")).toBe("csv");
    expect(detectFileFormat("DATA.CSV")).toBe("csv");
  });
  it("detects Excel", () => {
    expect(detectFileFormat("file.xlsx")).toBe("excel");
    expect(detectFileFormat("file.xls")).toBe("excel");
  });
  it("returns unknown for other formats", () => {
    expect(detectFileFormat("file.pdf")).toBe("unknown");
    expect(detectFileFormat("file.txt")).toBe("unknown");
  });
});

describe("parseExcelFile", () => {
  it("returns error when buffer is not valid Excel", async () => {
    const result = await parseExcelFile(Buffer.from("not an excel file", "utf-8"));
    expect(result.totalRows).toBe(0);
    expect(result.errorRows.length).toBeGreaterThan(0);
  });

  it("returns fileHash even on error", async () => {
    const result = await parseExcelFile(Buffer.from("", "utf-8"));
    expect(result.fileHash).toBeTruthy();
    expect(result.fileHash.length).toBe(64);
  });

  it("rejects XLSX with excessive uncompressed size claim (ZIP bomb)", async () => {
    // Build a valid XLSX, then patch CD to claim 1GB uncompressed
    const wb = createWorkbook();
    const ws = wb.addWorksheet("Sheet1");
    ws.addRow(["A"]);
    ws.addRow([1]);
    const buf = await writeBuffer(wb);

    // Find EOCD and patch uncompressed size to 1GB
    let eocdOffset = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 5 && buf[i + 3] === 6) {
        eocdOffset = i;
        break;
      }
    }
    if (eocdOffset < 0) throw new Error("Test helper: cannot find EOCD");
    const cdOffset = buf.readUInt32LE(eocdOffset + 16);
    const entryCount = buf.readUInt16LE(eocdOffset + 10);
    let pos = cdOffset;
    for (let i = 0; i < entryCount; i++) {
      const sig = buf.readUInt32LE(pos);
      if (sig !== 0x02014b50) break;
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      buf.writeUInt32LE(1024 * 1024 * 1024, pos + 24); // 1GB claim
      pos += 46 + nameLen + extraLen + commentLen;
    }

    const result = await parseExcelFile(buf);
    expect(result.totalRows).toBe(0);
    expect(result.errorRows.length).toBeGreaterThan(0);
    expect(result.errorRows[0]!.errors[0]).toContain("XLSX rejected");
  });

  it("rejects oversized buffer (> 10MB)", async () => {
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 0x50);
    const result = await parseExcelFile(oversized);
    expect(result.totalRows).toBe(0);
    expect(result.errorRows.length).toBeGreaterThan(0);
    expect(result.errorRows[0]!.errors[0]).toContain("exceeds max");
  });
});
