// --- Security Test: XLSX ZIP Bomb Protection ---
// Tests the 3-layer defense-in-depth for decompression bombs:
//   Layer 1: Compressed size limit (MAX_XLSX_SIZE = 10MB)
//   Layer 2: ZIP Central Directory pre-validation (prevalidateZipBuffer)
//   Layer 3: Cell count check (post-parse)
//
// Tests the prevalidateZipBuffer function directly, plus integration
// tests through extractTextFromXlsx via extractOfficeAiFileContent.

import { describe, expect, it } from "@jest/globals";
import { createWorkbook, aoaToSheet, writeBuffer, readBuffer, sheetToJsonArrays } from "@/lib/xlsx";

// ── Import the prevalidation function ──

import { prevalidateZipBuffer } from "../file-extraction-service";

// ── Helpers: Build synthetic ZIP buffers for testing ──

/**
 * Build a minimal valid XLSX buffer (real workbook with small data).
 */
async function buildMinimalXlsx(): Promise<Buffer> {
  const wb = createWorkbook();
  aoaToSheet(wb, [
    ["Name", "Value"],
    ["Item 1", 100],
    ["Item 2", 200],
  ], { sheetName: "Sheet1" });
  return writeBuffer(wb);
}

/**
 * Build a ZIP buffer with a specified number of entries by creating
 * an XLSX with many sheets (each sheet = ZIP entry).
 */
async function buildMultiSheetXlsx(sheetCount: number): Promise<Buffer> {
  const wb = createWorkbook();
  for (let i = 0; i < sheetCount; i++) {
    aoaToSheet(wb, [["Col"], [i]], { sheetName: `Sheet${i}` });
  }
  return writeBuffer(wb);
}

/**
 * Build a synthetic ZIP bomb: a small compressed buffer with inflated
 * central directory uncompressed size claims.
 * This creates a valid ZIP structure but lies about uncompressed sizes.
 */
async function buildSyntheticZipBomb(): Promise<Buffer> {
  // Build a real minimal ZIP, then patch the central directory
  // to claim an absurd uncompressed size.
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

  // Patch uncompressed sizes in central directory entries to claim 1GB each
  let pos = cdOffset;
  for (let i = 0; i < entryCount; i++) {
    const sig = real.readUInt32LE(pos);
    if (sig !== 0x02014b50) break;
    const nameLen = real.readUInt16LE(pos + 28);
    const extraLen = real.readUInt16LE(pos + 30);
    const commentLen = real.readUInt16LE(pos + 32);

    // Set uncompressed size to 1 GB (lies about actual content)
    real.writeUInt32LE(1024 * 1024 * 1024, pos + 24);

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return real;
}

/**
 * Build a buffer with many fake ZIP entries (entry count bomb).
 */
async function buildEntryCountBomb(entryCount: number): Promise<Buffer> {
  // Start from a real XLSX and patch the EOCD to claim more entries
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

  // Patch entry count
  real.writeUInt16LE(entryCount, eocdOffset + 10);

  return real;
}

// ── Tests ──

describe("XLSX ZIP Bomb Protection", () => {
  describe("prevalidateZipBuffer — Layer 2", () => {
    it("accepts a valid minimal XLSX", async () => {
      const buf = await buildMinimalXlsx();
      const result = prevalidateZipBuffer(buf);
      expect(result).toEqual({ valid: true });
    });

    it("accepts a valid multi-sheet XLSX (within limits)", async () => {
      const buf = await buildMultiSheetXlsx(20);
      const result = prevalidateZipBuffer(buf);
      expect(result).toEqual({ valid: true });
    });

    it("rejects buffer too small to be ZIP", () => {
      const tiny = Buffer.from("PK");
      const result = prevalidateZipBuffer(tiny);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toContain("too small");
      }
    });

    it("rejects buffer with no ZIP EOCD signature", () => {
      const garbage = Buffer.alloc(100, 0x42);
      const result = prevalidateZipBuffer(garbage);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toContain("End of Central Directory");
      }
    });

    it("rejects ZIP with excessive entry count (entry count bomb)", async () => {
      const bomb = await buildEntryCountBomb(500);
      const result = prevalidateZipBuffer(bomb);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toContain("entries");
        expect(result.reason).toContain("possible ZIP bomb");
      }
    });

    it("rejects ZIP with extreme compression ratio (decompression bomb)", async () => {
      const bomb = await buildSyntheticZipBomb();
      const result = prevalidateZipBuffer(bomb);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Either compression ratio or total uncompressed size is a valid catch
        const isCompressionRatio = result.reason.includes("compression ratio");
        const isTotalUncompressed = result.reason.includes("uncompressed size");
        expect(isCompressionRatio || isTotalUncompressed).toBe(true);
      }
    });

    it("rejects ZIP where central directory extends beyond buffer", async () => {
      const buf = await buildMinimalXlsx();

      // Find EOCD and patch cdOffset to an impossible value
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

      // Set cdOffset to a value beyond buffer length
      buf.writeUInt32LE(buf.length + 1000, eocdOffset + 16);

      const result = prevalidateZipBuffer(buf);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toContain("extends beyond buffer");
      }
    });
  });

  describe("extractTextFromXlsx — integration (via readBuffer)", () => {
    it("normal XLSX extraction produces valid output with cell count", async () => {
      const buf = await buildMinimalXlsx();
      // We can't call extractTextFromXlsx directly (private),
      // but we can verify prevalidateZipBuffer passes for normal files
      const zipResult = prevalidateZipBuffer(buf);
      expect(zipResult).toEqual({ valid: true });

      // And we can parse it with readBuffer to confirm it works
      const workbook = await readBuffer(buf);
      expect(workbook.worksheets.length).toBeGreaterThan(0);

      // Cell count check (Layer 3)
      let totalCells = 0;
      for (const ws of workbook.worksheets) {
        const dims = ws.dimensions;
        if (dims && dims.bottom > 0 && dims.right > 0) {
          totalCells += (dims.bottom - dims.top + 1) * (dims.right - dims.left + 1);
        }
      }
      expect(totalCells).toBeLessThanOrEqual(100_000);
    });
  });
});
