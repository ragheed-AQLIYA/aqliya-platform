// ─── Office AI File Content Extraction Service ───
// Local text extraction for supported file types.
// No external APIs, no Cloud AI, no OCR.
// Extraction failure never blocks the caller.

import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getStorageProvider } from "@/lib/platform/storage";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import { PDFParse, VerbosityLevel } from "pdf-parse";

// ─── Module-level audit logger ───
const alog = auditLogger({ productKey: Product.OFFICE_AI_ASSISTANT });

// ─── Constants ───

const MAX_TXT_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_CSV_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_XLSX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOCX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_CONTENT_LENGTH = 50 * 1000; // 50,000 chars
const MAX_CSV_ROWS = 500;
const MAX_XLSX_SHEETS = 50;
const MAX_XLSX_ROWS_PER_SHEET = 500;
const MAX_PDF_PAGES = 50;

const SUPPORTED_EXTRACTIONS = ["txt", "csv", "xlsx", "docx", "pdf"] as const;
type SupportedExtraction = (typeof SUPPORTED_EXTRACTIONS)[number];

export function detectSupportedExtractionType(
  fileType: string,
): SupportedExtraction | null {
  const ft = fileType.toLowerCase() as SupportedExtraction;
  return SUPPORTED_EXTRACTIONS.includes(ft) ? ft : null;
}

interface ExtractionResult {
  success: boolean;
  text?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

function normalizeExtractedText(
  text: string,
  maxLen: number = MAX_CONTENT_LENGTH,
): string {
  return text.slice(0, maxLen);
}

// ─── TXT Extractor ───

function extractTextFromTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

// ─── CSV Extractor ───

function extractTextFromCsv(buffer: Buffer): {
  text: string;
  meta: Record<string, unknown>;
} {
  const raw = buffer.toString("utf-8");
  const rows = parse(raw, {
    skip_empty_lines: true,
    relax_column_count: true,
    delimiter: ",",
  });

  const totalRows = rows.length;
  const maxRows = Math.min(totalRows, MAX_CSV_ROWS);
  const headers = rows.length > 0 ? rows[0] : [];

  let output = `**CSV Analysis**\n\n`;
  output += `Total rows: ${totalRows}\n`;
  output += `Columns: ${headers.length > 0 ? headers.join(", ") : "none"}\n\n`;

  if (maxRows > 1) {
    output += `**First ${maxRows - 1} data rows:**\n\n`;
    output += `| ${headers.join(" | ")} |\n`;
    output += `| ${headers.map(() => "---").join(" | ")} |\n`;

    for (let i = 1; i < maxRows; i++) {
      const row = rows[i];
      output += `| ${row.join(" | ")} |\n`;
    }
  }

  const meta: Record<string, unknown> = {
    type: "csv",
    totalRows,
    columns: headers.length,
    sampledRows: Math.max(0, maxRows - 1),
    truncated: totalRows > MAX_CSV_ROWS,
  };

  return { text: output, meta };
}

// ─── XLSX Extractor ───
//
// Defense-in-depth for ZIP / decompression bombs:
//
// Layer 1 — Compressed size limit (MAX_XLSX_SIZE = 10MB)
//     Rejects oversized compressed files before any processing.
//
// Layer 2 — ZIP Central Directory pre-validation (prevalidateZipBuffer)
//     Parses the ZIP central directory structure WITHOUT decompressing
//     file entries. Counts entries, sums declared uncompressed sizes,
//     and checks per-entry compression ratios. This runs BEFORE
//     XLSX.read() so it prevents the library from attempting to
//     decompress bomb payloads.
//
// Layer 3 — Cell count check (post-parse)
//     After XLSX.read() successfully parses the workbook, validates
//     total cell count across all sheets.
//
// NOTE: XLSX.read() with type:"buffer" fully decompresses the ZIP
// into memory. A crafted ZIP with valid central directory entries
// but malicious compressed data could still cause issues. Layers 1+2
// protect against the practical attack surface:
//   - 10MB compressed size limit prevents large payloads
//   - Central directory validation catches entry count and ratio bombs
//   - Cell count check catches bombs that slip through both layers
// For true isolation (untrusted XLSX from external sources), consider
// worker-process sandboxing or WASM-based parsing. For Office AI
// extraction (internal documents), these three layers are sufficient.

const MAX_ZIP_ENTRIES = 200;
const MAX_ZIP_UNCOMPRESSED_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_ENTRY_COMPRESSION_RATIO = 100; // 100:1 compressed:uncompressed

/**
 * Pre-validate a ZIP/XLSX buffer by parsing the Central Directory.
 * Does NOT decompress any entries — reads only metadata from the
 * fixed-size central directory structure at the end of the ZIP.
 *
 * Returns { valid: true } if safe, or { valid: false, reason } if bomb detected.
 *
 * Exported for security testing.
 */
export function prevalidateZipBuffer(
  buffer: Buffer,
): { valid: true } | { valid: false; reason: string } {
  if (buffer.length < 22) {
    return { valid: false, reason: "XLSX buffer too small to be valid ZIP" };
  }

  // Find End of Central Directory (EOCD) record — scans backwards from end
  // EOCD signature: 0x50 0x4B 0x05 0x06 (little-endian)
  let eocdOffset = -1;
  const searchLimit = Math.max(0, buffer.length - 65557);
  for (let i = buffer.length - 22; i >= searchLimit; i--) {
    if (
      buffer[i] === 0x50 &&
      buffer[i + 1] === 0x4b &&
      buffer[i + 2] === 5 &&
      buffer[i + 3] === 6
    ) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset < 0) {
    return { valid: false, reason: "XLSX buffer missing ZIP End of Central Directory" };
  }

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  if (entryCount > MAX_ZIP_ENTRIES) {
    return {
      valid: false,
      reason: `XLSX ZIP contains ${entryCount} entries (max ${MAX_ZIP_ENTRIES}) — possible ZIP bomb`,
    };
  }

  if (cdOffset + cdSize > buffer.length) {
    return { valid: false, reason: "XLSX ZIP central directory extends beyond buffer" };
  }

  // Parse Central Directory entries to check compression ratios
  let totalUncompressedSize = 0;
  const seenNames = new Set<string>();

  let pos = cdOffset;
  for (let i = 0; i < entryCount && pos + 46 <= cdOffset + cdSize; i++) {
    const sig = buffer.readUInt32LE(pos);
    if (sig !== 0x02014b50) {
      return { valid: false, reason: `XLSX ZIP invalid central directory entry at offset ${pos}` };
    }

    const compMethod = buffer.readUInt16LE(pos + 10);
    const compSize = buffer.readUInt32LE(pos + 20);
    const uncompSize = buffer.readUInt32LE(pos + 24);
    const nameLen = buffer.readUInt16LE(pos + 28);
    const extraLen = buffer.readUInt16LE(pos + 30);
    const commentLen = buffer.readUInt16LE(pos + 32);
    const name = buffer.toString("utf8", pos + 46, pos + 46 + nameLen);

    // Check for duplicate entries (ZIP bomb technique)
    if (seenNames.has(name)) {
      return {
        valid: false,
        reason: `XLSX ZIP contains duplicate entry "${name}" — possible ZIP bomb`,
      };
    }
    seenNames.add(name);

    // Check per-entry compression ratio (deflate method only)
    if (compMethod === 8 && compSize > 0 && uncompSize > 0) {
      const ratio = uncompSize / compSize;
      if (ratio > MAX_ENTRY_COMPRESSION_RATIO) {
        return {
          valid: false,
          reason: `XLSX ZIP entry "${name}" has compression ratio ${ratio.toFixed(0)}:1 (max ${MAX_ENTRY_COMPRESSION_RATIO}:1) — possible decompression bomb`,
        };
      }
    }

    totalUncompressedSize += uncompSize;
    pos += 46 + nameLen + extraLen + commentLen;
  }

  if (totalUncompressedSize > MAX_ZIP_UNCOMPRESSED_SIZE) {
    return {
      valid: false,
      reason: `XLSX ZIP total uncompressed size ${(totalUncompressedSize / 1024 / 1024).toFixed(1)} MB (max ${MAX_ZIP_UNCOMPRESSED_SIZE / 1024 / 1024} MB) — possible ZIP bomb`,
    };
  }

  return { valid: true };
}

function extractTextFromXlsx(buffer: Buffer): {
  text: string;
  meta: Record<string, unknown>;
} {
  // Layer 2: Pre-decompression ZIP structure validation
  const zipCheck = prevalidateZipBuffer(buffer);
  if (!zipCheck.valid) {
    throw new Error(`XLSX rejected: ${zipCheck.reason}`);
  }

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellFormula: false,
    cellHTML: false,
  });

  // Layer 3: Post-parse cell count check (catches bombs that bypass layers 1-2)
  const MAX_TOTAL_CELLS = 100_000;
  let totalCells = 0;
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const ref = sheet["!ref"] || "A1";
    const range = XLSX.utils.decode_range(ref);
    totalCells += (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
  }
  if (totalCells > MAX_TOTAL_CELLS) {
    throw new Error(
      `XLSX exceeds maximum total cell count (${MAX_TOTAL_CELLS}) — possible ZIP bomb`,
    );
  }

  const sheetNames = workbook.SheetNames.slice(0, MAX_XLSX_SHEETS);
  const truncated = workbook.SheetNames.length > MAX_XLSX_SHEETS;

  let output = `**Excel Workbook Analysis**\n\n`;
  output += `Total sheets: ${workbook.SheetNames.length}\n`;
  output += `Sheets sampled: ${sheetNames.length}\n\n`;

  const sheetsMeta: Record<string, unknown>[] = [];

  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];
    const totalRows = json.length;
    const maxRows = Math.min(totalRows, MAX_XLSX_ROWS_PER_SHEET);
    const headers =
      json.length > 0
        ? (json[0] as string[]).filter((h) => String(h).trim())
        : [];
    const colCount = headers.length;

    output += `---\n`;
    output += `**Sheet: ${name}**\n`;
    output += `- Rows detected: ${totalRows}\n`;
    output += `- Columns: ${colCount > 0 ? colCount : "none"}\n`;
    if (headers.length > 0) {
      output += `- Headers: ${headers.join(", ")}\n`;
    }

    if (maxRows > 1) {
      output += `\n**First ${Math.min(maxRows - 1, 5)} data rows:**\n\n`;
      if (headers.length > 0) {
        output += `| ${headers.join(" | ")} |\n`;
        output += `| ${headers.map(() => "---").join(" | ")} |\n`;
      }
      const sampleEnd = Math.min(maxRows, 6); // header + 5 rows
      for (let i = 1; i < sampleEnd; i++) {
        const row = json[i] as string[];
        output += `| ${row.join(" | ")} |\n`;
      }
    }
    output += `\n`;

    sheetsMeta.push({
      name,
      rowCount: totalRows,
      columnCount: colCount,
      headers: headers,
    });
  }

  const meta: Record<string, unknown> = {
    type: "xlsx",
    sheetCount: workbook.SheetNames.length,
    sheetsSampled: sheetNames.length,
    sheets: sheetsMeta,
    truncated,
  };

  return { text: output, meta };
}

// ─── DOCX Extractor ───

async function extractTextFromDocx(
  buffer: Buffer,
): Promise<{ text: string; meta: Record<string, unknown> }> {
  const result = await mammoth.extractRawText({ buffer });

  const text = result.value || "";
  const warnings = result.messages.filter(
    (m: { type: string }) => m.type === "warning",
  );
  const warningsCount = warnings.length;

  const warningsText =
    warningsCount > 0
      ? `\n\n**Extraction warnings (${warningsCount}):**\n${warnings.map((m: { message: string }) => `- ${m.message}`).join("\n")}\n`
      : "";

  const output = `${text}${warningsText}`;

  // Normalize whitespace
  const normalized = output
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const meta: Record<string, unknown> = {
    type: "docx",
    charCount: normalized.length,
    warningsCount,
    truncated: false,
  };

  return { text: normalized, meta };
}

// ─── PDF Extractor ───

async function extractTextFromPdf(
  buffer: Buffer,
): Promise<{ text: string; meta: Record<string, unknown> }> {
  const parser = new PDFParse({
    data: buffer as unknown as Uint8Array,
    verbosity: VerbosityLevel.ERRORS,
  });
  const info = await parser.getInfo();
  const textResult = await parser.getText();

  const text = textResult?.text || "";
  const pageCount = info?.pages?.length || info?.total || 0;
  const hasTextLayer = text.trim().length > 0;

  let output = text;

  if (!hasTextLayer) {
    output =
      "[No extractable text layer found in this PDF. The file may be scanned/image-only.]";
  }

  if (pageCount > MAX_PDF_PAGES) {
    output = output.slice(0, MAX_CONTENT_LENGTH);
  }

  const normalized = output
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const meta: Record<string, unknown> = {
    type: "pdf",
    pageCount,
    charCount: normalized.length,
    hasTextLayer,
    truncated: pageCount > MAX_PDF_PAGES,
  };

  return { text: normalized, meta };
}

// ─── Main Extraction ───

export async function extractOfficeAiFileContent(
  fileId: string,
  opts?: { buffer?: Buffer },
): Promise<ExtractionResult> {
  const file = await prisma.officeAiFile.findUnique({ where: { id: fileId } });
  if (!file) return { success: false, error: "File not found" };

  const extractType = detectSupportedExtractionType(file.fileType);
  if (!extractType) {
    await prisma.officeAiFile.update({
      where: { id: fileId },
      data: { extractionStatus: "skipped", extractedAt: new Date() },
    });
    return { success: false, error: `Unsupported file type: ${file.fileType}` };
  }

  // Audit: started
  await alog.record(
    "office_ai.file.extraction_started",
    {
      type: "OfficeAiFile",
      id: fileId,
    },
    {
      severity: "info",
      sourceModel: "OfficeAiFile",
      sourceId: fileId,
      metadata: { fileType: file.fileType, filename: file.filename },
    },
  );

  try {
    let buffer: Buffer;

    if (opts?.buffer) {
      buffer = opts.buffer;
    } else if (file.storageKey) {
      const provider = getStorageProvider();
      const stored = await provider.retrieve(file.storageKey);
      if (!stored) throw new Error("File not found in storage");
      buffer = stored.content;
    } else {
      throw new Error("No file content available — metadata-only attachment");
    }

    // Size checks
    if (extractType === "txt" && buffer.length > MAX_TXT_SIZE) {
      throw new Error(
        `TXT exceeds max size (${MAX_TXT_SIZE / 1024 / 1024} MB)`,
      );
    }
    if (extractType === "csv" && buffer.length > MAX_CSV_SIZE) {
      throw new Error(
        `CSV exceeds max size (${MAX_CSV_SIZE / 1024 / 1024} MB)`,
      );
    }
    if (extractType === "xlsx" && buffer.length > MAX_XLSX_SIZE) {
      throw new Error(
        `XLSX exceeds max size (${MAX_XLSX_SIZE / 1024 / 1024} MB)`,
      );
    }
    if (extractType === "docx" && buffer.length > MAX_DOCX_SIZE) {
      throw new Error(
        `DOCX exceeds max size (${MAX_DOCX_SIZE / 1024 / 1024} MB)`,
      );
    }
    if (extractType === "pdf" && buffer.length > MAX_PDF_SIZE) {
      throw new Error(
        `PDF exceeds max size (${MAX_PDF_SIZE / 1024 / 1024} MB)`,
      );
    }

    let extractedContent: string;
    let extractionMeta: Record<string, unknown>;

    if (extractType === "txt") {
      extractedContent = normalizeExtractedText(extractTextFromTxt(buffer));
      extractionMeta = {
        type: "txt",
        length: extractedContent.length,
        truncated: buffer.length > MAX_CONTENT_LENGTH,
      };
    } else if (extractType === "csv") {
      const result = extractTextFromCsv(buffer);
      extractedContent = normalizeExtractedText(result.text);
      extractionMeta = { ...result.meta, length: extractedContent.length };
    } else if (extractType === "xlsx") {
      const result = extractTextFromXlsx(buffer);
      extractedContent = normalizeExtractedText(result.text);
      extractionMeta = { ...result.meta, length: extractedContent.length };
    } else if (extractType === "docx") {
      const result = await extractTextFromDocx(buffer);
      extractedContent = normalizeExtractedText(result.text);
      extractionMeta = { ...result.meta, length: extractedContent.length };
    } else if (extractType === "pdf") {
      const result = await extractTextFromPdf(buffer);
      extractedContent = normalizeExtractedText(result.text);
      extractionMeta = { ...result.meta, length: extractedContent.length };
    } else {
      throw new Error(`Unsupported extraction type: ${extractType}`);
    }

    await prisma.officeAiFile.update({
      where: { id: fileId },
      data: {
        extractedContent,
        extractionMeta: extractionMeta as unknown as Prisma.InputJsonValue,
        extractedAt: new Date(),
        extractionStatus: "completed",
      },
    });

    // Audit: completed
    await alog.record(
      "office_ai.file.extraction_completed",
      {
        type: "OfficeAiFile",
        id: fileId,
      },
      {
        severity: "info",
        sourceModel: "OfficeAiFile",
        sourceId: fileId,
        metadata: {
          fileType: file.fileType,
          extractionType: extractType,
          ...extractionMeta,
        },
      },
    );

    return { success: true, text: extractedContent, meta: extractionMeta };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Extraction failed";

    await prisma.officeAiFile.update({
      where: { id: fileId },
      data: { extractionStatus: "failed", extractedAt: new Date() },
    });

    await alog.record(
      "office_ai.file.extraction_failed",
      {
        type: "OfficeAiFile",
        id: fileId,
      },
      {
        severity: "warning",
        sourceModel: "OfficeAiFile",
        sourceId: fileId,
        metadata: { fileType: file.fileType, error: msg },
      },
    );

    return { success: false, error: msg };
  }
}

export async function extractAllTaskFiles(taskId: string): Promise<void> {
  const files = await prisma.officeAiFile.findMany({
    where: { taskId, extractionStatus: null },
    take: 100,
  });

  const unsupported = files.filter((f) => !detectSupportedExtractionType(f.fileType));
  if (unsupported.length > 0) {
    await prisma.officeAiFile.updateMany({
      where: { id: { in: unsupported.map((f) => f.id) } },
      data: { extractionStatus: "skipped", extractedAt: new Date() },
    });
  }

  const supported = files.filter((f) => detectSupportedExtractionType(f.fileType));
  await Promise.all(supported.map((f) => extractOfficeAiFileContent(f.id)));
}

export async function reExtractFileContent(
  fileId: string,
  actor?: { id?: string; name?: string },
): Promise<ExtractionResult> {
  const file = await prisma.officeAiFile.findUnique({ where: { id: fileId } });
  if (!file) return { success: false, error: "File not found" };

  // Clear previous extraction
  await prisma.officeAiFile.update({
    where: { id: fileId },
    data: {
      extractionStatus: null,
      extractedContent: null,
      extractionMeta: null as unknown as Prisma.InputJsonValue,
      extractedAt: null,
    },
  });

  const result = await extractOfficeAiFileContent(fileId);

  if (result.success && actor) {
    await alog.record(
      "office_ai.file.reextracted",
      {
        type: "OfficeAiFile",
        id: fileId,
      },
      {
        severity: "info",
        actorId: actor.id,
        actorName: actor.name,
        sourceModel: "OfficeAiFile",
        sourceId: fileId,
        metadata: { fileType: file.fileType, filename: file.filename },
      },
    );
  }

  return result;
}
