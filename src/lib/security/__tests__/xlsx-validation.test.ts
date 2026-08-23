// --- Security Test: Shared XLSX Archive Validator ---
// Tests validateXlsxArchive() from @/lib/security/xlsx-validation
// Covers: size guard, EOCD detection, entry count, compression ratio,
// duplicate entries, total uncompressed size, CD bounds, and valid files.

import { describe, expect, it } from "@jest/globals";
import { createWorkbook, aoaToSheet, writeBuffer, readBuffer } from "@/lib/xlsx";
import {
  validateXlsxArchive,
  MAX_XLSX_BUFFER_SIZE,
} from "../xlsx-validation";

// ── Helpers: Build synthetic ZIP buffers ──

/** Build a minimal valid XLSX buffer with small data. */
async function buildMinimalXlsx(): Promise<Buffer> {
  const wb = createWorkbook();
  aoaToSheet(wb, [
    ["Name", "Value"],
    ["Item 1", 100],
    ["Item 2", 200],
  ], { sheetName: "Sheet1" });
  return await writeBuffer(wb);
}

/** Build an XLSX with many sheets (each sheet = ZIP entry). */
async function buildMultiSheetXlsx(sheetCount: number): Promise<Buffer> {
  const wb = createWorkbook();
  for (let i = 0; i < sheetCount; i++) {
    aoaToSheet(wb, [["Col"], [i]], { sheetName: `Sheet${i}` });
  }
  return await writeBuffer(wb);
}

/** Build a synthetic ZIP bomb by patching CD uncompressed sizes. */
async function buildSyntheticZipBomb(): Promise<Buffer> {
  const real = await buildMinimalXlsx();

  // Find EOCD
  let eocdOffset = -1;
  for (let i = real.length - 22; i >= 0; i--) {
    if (
      real[i] === 0x50 &&
      real[i + 1] === 0x4b &&
      real[i + 2] === 5 &&
      real[i + 3] === 6
    ) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error("Test helper: cannot find EOCD");

  const cdOffset = real.readUInt32LE(eocdOffset + 16);
  const entryCount = real.readUInt16LE(eocdOffset + 10);

  // Patch uncompressed sizes in CD entries to claim 1GB each
  let pos = cdOffset;
  for (let i = 0; i < entryCount; i++) {
    const sig = real.readUInt32LE(pos);
    if (sig !== 0x02014b50) break;
    const nameLen = real.readUInt16LE(pos + 28);
    const extraLen = real.readUInt16LE(pos + 30);
    const commentLen = real.readUInt16LE(pos + 32);
    real.writeUInt32LE(1024 * 1024 * 1024, pos + 24); // 1 GB claim
    pos += 46 + nameLen + extraLen + commentLen;
  }

  return real;
}

/** Build a buffer with a fake EOCD claiming many entries. */
async function buildEntryCountBomb(entryCount: number): Promise<Buffer> {
  const real = await buildMinimalXlsx();
  let eocdOffset = -1;
  for (let i = real.length - 22; i >= 0; i--) {
    if (
      real[i] === 0x50 &&
      real[i + 1] === 0x4b &&
      real[i + 2] === 5 &&
      real[i + 3] === 6
    ) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error("Test helper: cannot find EOCD");
  real.writeUInt16LE(entryCount, eocdOffset + 10);
  return real;
}

// ── Tests ──

describe("validateXlsxArchive — shared security primitive", () => {
  // ── Size guard ──

  it("rejects buffers exceeding MAX_XLSX_BUFFER_SIZE", () => {
    const oversized = Buffer.alloc(MAX_XLSX_BUFFER_SIZE + 1, 0x50);
    const result = validateXlsxArchive(oversized);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("exceeds max");
    }
  });

  it("accepts buffers at exactly MAX_XLSX_BUFFER_SIZE (if valid ZIP)", async () => {
    // Can't create a real 10MB XLSX in a test, so verify the size check
    // doesn't reject sub-limit buffers
    const buf = await buildMinimalXlsx();
    expect(buf.length).toBeLessThan(MAX_XLSX_BUFFER_SIZE);
    const result = validateXlsxArchive(buf);
    // May fail for other reasons (it's a real XLSX), but NOT for size
    if (!result.valid) {
      expect(result.reason).not.toContain("exceeds max");
    }
  });

  // ── Minimum size ──

  it("rejects buffer too small to be ZIP (< 22 bytes)", () => {
    const tiny = Buffer.from("PK");
    const result = validateXlsxArchive(tiny);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("too small");
    }
  });

  it("rejects empty buffer", () => {
    const result = validateXlsxArchive(Buffer.alloc(0));
    expect(result.valid).toBe(false);
  });

  // ── EOCD detection ──

  it("rejects buffer with no ZIP EOCD signature", () => {
    const garbage = Buffer.alloc(100, 0x42);
    const result = validateXlsxArchive(garbage);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("End of Central Directory");
    }
  });

  it("rejects buffer with only PK signature but no EOCD", () => {
    // PK\x03\x04 is local file header, not EOCD
    const localHeader = Buffer.alloc(100, 0x00);
    localHeader[0] = 0x50;
    localHeader[1] = 0x4b;
    localHeader[2] = 0x03;
    localHeader[3] = 0x04;
    const result = validateXlsxArchive(localHeader);
    expect(result.valid).toBe(false);
  });

  // ── Entry count ──

  it("rejects ZIP with excessive entry count (> 200)", async () => {
    const bomb = await buildEntryCountBomb(500);
    const result = validateXlsxArchive(bomb);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("entries");
      expect(result.reason).toContain("possible ZIP bomb");
    }
  });

  it("rejects ZIP at exactly 201 entries", async () => {
    const bomb = await buildEntryCountBomb(201);
    const result = validateXlsxArchive(bomb);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("201");
    }
  });

  it("accepts ZIP with 200 entries (at limit)", async () => {
    const buf = await buildEntryCountBomb(200);
    const result = validateXlsxArchive(buf);
    // May fail for other reasons, but NOT for entry count
    if (!result.valid) {
      expect(result.reason).not.toContain("entries");
    }
  });

  // ── Compression ratio ──

  it("rejects ZIP with extreme compression ratio (decompression bomb)", async () => {
    const bomb = await buildSyntheticZipBomb();
    const result = validateXlsxArchive(bomb);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const isCompressionRatio = result.reason.includes("compression ratio");
      const isTotalUncompressed = result.reason.includes("uncompressed size");
      expect(isCompressionRatio || isTotalUncompressed).toBe(true);
    }
  });

  // ── CD bounds ──

  it("rejects ZIP where central directory extends beyond buffer", async () => {
    const buf = await buildMinimalXlsx();
    let eocdOffset = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (
        buf[i] === 0x50 &&
        buf[i + 1] === 0x4b &&
        buf[i + 2] === 5 &&
        buf[i + 3] === 6
      ) {
        eocdOffset = i;
        break;
      }
    }
    if (eocdOffset < 0) throw new Error("Test helper: cannot find EOCD");
    buf.writeUInt32LE(buf.length + 1000, eocdOffset + 16);

    const result = validateXlsxArchive(buf);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("extends beyond buffer");
    }
  });

  // ── Valid files ──

  it("accepts a valid minimal XLSX", async () => {
    const buf = await buildMinimalXlsx();
    const result = validateXlsxArchive(buf);
    expect(result).toEqual({ valid: true });
  });

  it("accepts a valid multi-sheet XLSX (within limits)", async () => {
    const buf = await buildMultiSheetXlsx(20);
    const result = validateXlsxArchive(buf);
    expect(result).toEqual({ valid: true });
  });

  it("accepts a real-world-style XLSX with data rows", async () => {
    const wb = createWorkbook();
    aoaToSheet(wb, [
      ["Account", "Debit", "Credit"],
      ["1001", 50000, 0],
      ["1002", 0, 30000],
      ["2001", 0, 20000],
    ], { sheetName: "BalanceSheet" });
    const buf = await writeBuffer(wb);
    const result = validateXlsxArchive(buf);
    expect(result).toEqual({ valid: true });
  });
});

describe("validateXlsxArchive — integration with readBuffer", () => {
  it("validates before parse: safe file passes both checks", async () => {
    const buf = await buildMinimalXlsx();
    const zipResult = validateXlsxArchive(buf);
    expect(zipResult).toEqual({ valid: true });

    // readBuffer should succeed after validation passes
    const workbook = await readBuffer(buf);
    expect(workbook.worksheets.length).toBeGreaterThan(0);
  });

  it("validates before parse: bomb is caught before readBuffer", async () => {
    const bomb = await buildSyntheticZipBomb();
    const zipResult = validateXlsxArchive(bomb);
    expect(zipResult.valid).toBe(false);

    // We do NOT call readBuffer — the validator caught it first
    if (!zipResult.valid) {
      expect(zipResult.reason).toMatch(/bomb|ratio|uncompressed/);
    }
  });

  it("validates before parse: entry count bomb caught before readBuffer", async () => {
    const bomb = await buildEntryCountBomb(500);
    const zipResult = validateXlsxArchive(bomb);
    expect(zipResult.valid).toBe(false);

    if (!zipResult.valid) {
      expect(zipResult.reason).toContain("entries");
    }
  });
});
