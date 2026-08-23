// ─── LCGPA Regulatory Intelligence :: Artifact Integrity & Security (§10, §41) ───
//
// Every external artifact is UNTRUSTED INPUT.
//
// Order of operations is fixed and non-negotiable (§9):
//     download → preserve raw bytes → SHA-256 → validate → parse a COPY
// Never: download → modify → hash.
//
// If SHA-256 cannot be generated, ingestion is BLOCKED (§10).

import { createHash } from "crypto";
import type { IntegrityCheck, IntegrityReport } from "./types";

// ─── Limits ───

/** Maximum accepted raw artifact size. */
export const MAX_ARTIFACT_BYTES = 50 * 1024 * 1024;
/** Maximum number of entries inside a ZIP-based artifact (OOXML). */
export const MAX_ZIP_ENTRIES = 5000;
/** Maximum total uncompressed size across all ZIP entries. */
export const MAX_TOTAL_UNCOMPRESSED_BYTES = 500 * 1024 * 1024;
/** Maximum uncompressed:compressed ratio for any single entry (ZIP bomb guard). */
export const MAX_COMPRESSION_RATIO = 200;

/** Extensions the engine is willing to ingest. */
export const ALLOWED_EXTENSIONS = ["xlsx", "csv", "pdf", "json", "html", "htm", "xml"] as const;

/** Canonical MIME types by extension. */
export const EXTENSION_MIME: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  pdf: "application/pdf",
  json: "application/json",
  html: "text/html",
  htm: "text/html",
  xml: "application/xml",
};

// ─── SHA-256 ───

/**
 * SHA-256 of the RAW artifact bytes.
 * @throws when the buffer is empty — an unhashable artifact must not be ingested.
 */
export function sha256(buffer: Buffer): string {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("HASH_INPUT_INVALID: artifact body must be a Buffer");
  }
  if (buffer.length === 0) {
    throw new Error("HASH_INPUT_EMPTY: cannot fingerprint an empty artifact");
  }
  return createHash("sha256").update(buffer).digest("hex");
}

/** Deterministic artifact identity: source + content fingerprint (§32). */
export function artifactIdentity(sourceId: string, hash: string): string {
  return `${sourceId}:${hash}`;
}

// ─── Magic-byte detection ───

/** Detect a content type from leading bytes. Returns null when unrecognised. */
export function detectMimeFromMagic(buffer: Buffer): string | null {
  if (buffer.length >= 4) {
    // ZIP container (xlsx, docx, pptx …)
    if (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)
    ) {
      return "application/zip";
    }
    // %PDF
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return "application/pdf";
    }
    // Legacy OLE2 compound file (.xls) — explicitly not accepted.
    if (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    ) {
      return "application/vnd.ms-excel";
    }
  }
  const head = buffer.subarray(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<?xml")) return "application/xml";
  if (/^<!doctype html/i.test(head) || /^<html/i.test(head)) return "text/html";
  if (head.startsWith("{") || head.startsWith("[")) return "application/json";
  return null;
}

export function extensionOf(filename: string): string | null {
  const idx = filename.lastIndexOf(".");
  if (idx < 0 || idx === filename.length - 1) return null;
  return filename.slice(idx + 1).toLowerCase();
}

// ─── Minimal ZIP central-directory reader ───

export interface ZipEntrySummary {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  /** True when ZIP64 placeholders were present and real sizes are unknown. */
  sizeUnknown: boolean;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;

/**
 * Read the ZIP central directory without decompressing anything.
 * Returns null when the buffer is not a readable ZIP container.
 */
export function readZipCentralDirectory(buffer: Buffer): ZipEntrySummary[] | null {
  // EOCD is at most 22 + 65535 bytes from the end.
  const maxBack = Math.min(buffer.length, 22 + 0xffff);
  let eocd = -1;
  for (let i = buffer.length - 22; i >= buffer.length - maxBack && i >= 0; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;

  const entryCount = buffer.readUInt16LE(eocd + 10);
  const cdOffset = buffer.readUInt32LE(eocd + 16);
  if (cdOffset >= buffer.length) return null;

  const entries: ZipEntrySummary[] = [];
  let p = cdOffset;
  for (let i = 0; i < entryCount; i++) {
    if (p + 46 > buffer.length) break;
    if (buffer.readUInt32LE(p) !== CENTRAL_SIGNATURE) break;
    const compressedSize = buffer.readUInt32LE(p + 20);
    const uncompressedSize = buffer.readUInt32LE(p + 24);
    const nameLen = buffer.readUInt16LE(p + 28);
    const extraLen = buffer.readUInt16LE(p + 30);
    const commentLen = buffer.readUInt16LE(p + 32);
    const name = buffer.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      sizeUnknown: compressedSize === 0xffffffff || uncompressedSize === 0xffffffff,
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

// ─── OOXML hazard detection ───

export interface OoxmlHazards {
  macros: string[];
  externalLinks: string[];
  hasCalcChain: boolean;
}

/** Detect macros, external links and formula dependencies inside an OOXML package. */
export function detectOoxmlHazards(entries: ZipEntrySummary[]): OoxmlHazards {
  const macros: string[] = [];
  const externalLinks: string[] = [];
  let hasCalcChain = false;

  for (const e of entries) {
    const lower = e.name.toLowerCase();
    if (
      lower.includes("vbaproject.bin") ||
      lower.includes("/macrosheets/") ||
      lower.endsWith(".bin.vba") ||
      lower.includes("vbaprojectsignature")
    ) {
      macros.push(e.name);
    }
    if (lower.startsWith("xl/externallinks/")) {
      externalLinks.push(e.name);
    }
    if (lower === "xl/calcchain.xml") {
      hasCalcChain = true;
    }
  }
  return { macros, externalLinks, hasCalcChain };
}

// ─── Integrity validation ───

export interface IntegrityInput {
  /** Raw, unmodified bytes exactly as served. */
  buffer: Buffer;
  filename: string;
  /** MIME type declared by the server. */
  declaredMimeType: string;
  /** Override the default size ceiling. */
  maxSizeBytes?: number;
}

function check(name: string, passed: boolean, detail: string): IntegrityCheck {
  return { name, passed, detail };
}

/**
 * Validate an untrusted artifact.
 *
 * A report with a non-empty `errors` array means the artifact MUST be
 * quarantined and MUST NOT be parsed or activated (§27, §41).
 */
export function validateArtifactIntegrity(input: IntegrityInput): IntegrityReport {
  const { buffer, filename, declaredMimeType } = input;
  const maxSize = input.maxSizeBytes ?? MAX_ARTIFACT_BYTES;
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: IntegrityCheck[] = [];

  // 1. Hash first — an artifact that cannot be fingerprinted cannot be ingested.
  let hash: string;
  try {
    hash = sha256(buffer);
    checks.push(check("SHA256_COMPUTED", true, hash));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.push(check("SHA256_COMPUTED", false, message));
    return {
      sha256: "",
      sizeBytes: buffer?.length ?? 0,
      declaredMimeType,
      detectedMimeType: null,
      extension: extensionOf(filename),
      errors: [`SHA256_UNAVAILABLE: ${message}`],
      warnings,
      checks,
    };
  }

  // 2. Size ceiling.
  const withinSize = buffer.length <= maxSize;
  checks.push(
    check("SIZE_WITHIN_LIMIT", withinSize, `${buffer.length} bytes (limit ${maxSize})`),
  );
  if (!withinSize) {
    errors.push(
      `ARTIFACT_TOO_LARGE: ${buffer.length} bytes exceeds limit of ${maxSize} bytes`,
    );
  }

  // 3. Extension allow-list.
  const ext = extensionOf(filename);
  const extAllowed = ext !== null && (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
  checks.push(check("EXTENSION_ALLOWED", extAllowed, ext ?? "(none)"));
  if (!extAllowed) {
    errors.push(
      `EXTENSION_NOT_ALLOWED: "${ext ?? "(none)"}" is not an accepted artifact extension`,
    );
  }

  // 4. Magic bytes vs declared type.
  const detected = detectMimeFromMagic(buffer);
  checks.push(check("MAGIC_BYTES_DETECTED", detected !== null, detected ?? "unrecognised"));
  if (detected === "application/vnd.ms-excel") {
    errors.push(
      "LEGACY_OLE2_REJECTED: legacy .xls (OLE2) workbooks are not accepted; require OOXML .xlsx",
    );
  }

  if (ext === "xlsx") {
    const isZip = detected === "application/zip";
    checks.push(check("XLSX_IS_ZIP_CONTAINER", isZip, detected ?? "unrecognised"));
    if (!isZip) {
      errors.push(
        "MIME_MISMATCH: file named .xlsx is not an OOXML (ZIP) container",
      );
    }
  }

  if (ext === "pdf" && detected !== "application/pdf") {
    errors.push("MIME_MISMATCH: file named .pdf does not begin with %PDF");
  }

  const expectedMime = ext ? EXTENSION_MIME[ext] : undefined;
  if (expectedMime && declaredMimeType && !declaredMimeType.startsWith(expectedMime)) {
    warnings.push(
      `DECLARED_MIME_UNEXPECTED: server declared "${declaredMimeType}", expected "${expectedMime}"`,
    );
  }

  // 5. ZIP structural safety (only for OOXML containers).
  if (detected === "application/zip") {
    const entries = readZipCentralDirectory(buffer);
    if (entries === null) {
      errors.push("MALFORMED_ZIP: ZIP central directory could not be read");
      checks.push(check("ZIP_DIRECTORY_READABLE", false, "unreadable"));
    } else {
      checks.push(check("ZIP_DIRECTORY_READABLE", true, `${entries.length} entries`));

      const entryCountOk = entries.length <= MAX_ZIP_ENTRIES;
      checks.push(check("ZIP_ENTRY_COUNT", entryCountOk, `${entries.length}`));
      if (!entryCountOk) {
        errors.push(
          `ZIP_ENTRY_COUNT_EXCEEDED: ${entries.length} entries exceeds ${MAX_ZIP_ENTRIES}`,
        );
      }

      let totalUncompressed = 0;
      let worstRatio = 0;
      let unknownSizes = false;
      for (const e of entries) {
        if (e.sizeUnknown) {
          unknownSizes = true;
          continue;
        }
        totalUncompressed += e.uncompressedSize;
        if (e.compressedSize > 0) {
          worstRatio = Math.max(worstRatio, e.uncompressedSize / e.compressedSize);
        }
      }

      const totalOk = totalUncompressed <= MAX_TOTAL_UNCOMPRESSED_BYTES;
      checks.push(
        check("ZIP_TOTAL_UNCOMPRESSED", totalOk, `${totalUncompressed} bytes`),
      );
      if (!totalOk) {
        errors.push(
          `DECOMPRESSION_LIMIT_EXCEEDED: total uncompressed ${totalUncompressed} bytes exceeds ${MAX_TOTAL_UNCOMPRESSED_BYTES}`,
        );
      }

      const ratioOk = worstRatio <= MAX_COMPRESSION_RATIO;
      checks.push(
        check("ZIP_COMPRESSION_RATIO", ratioOk, `${worstRatio.toFixed(1)}:1`),
      );
      if (!ratioOk) {
        errors.push(
          `ZIP_BOMB_SUSPECTED: compression ratio ${worstRatio.toFixed(1)}:1 exceeds ${MAX_COMPRESSION_RATIO}:1`,
        );
      }

      if (unknownSizes) {
        warnings.push(
          "ZIP64_SIZES_UNKNOWN: ZIP64 placeholders present; entry sizes could not be verified from the central directory",
        );
      }

      // 6. Macro / external-link / formula hazards.
      const hazards = detectOoxmlHazards(entries);
      const macroFree = hazards.macros.length === 0;
      checks.push(
        check("NO_MACROS", macroFree, macroFree ? "none" : hazards.macros.join(", ")),
      );
      if (!macroFree) {
        errors.push(
          `MACRO_DETECTED: macro-enabled content is rejected (${hazards.macros.join(", ")})`,
        );
      }

      const noExternal = hazards.externalLinks.length === 0;
      checks.push(
        check(
          "NO_EXTERNAL_LINKS",
          noExternal,
          noExternal ? "none" : hazards.externalLinks.join(", "),
        ),
      );
      if (!noExternal) {
        warnings.push(
          `EXTERNAL_LINKS_PRESENT: workbook references external sources (${hazards.externalLinks.join(", ")}); external values must not be treated as regulatory truth`,
        );
      }

      if (hazards.hasCalcChain) {
        warnings.push(
          "FORMULAS_PRESENT: workbook contains a calculation chain; only cached cell values may be read — formulas are not regulatory truth without explicit validation",
        );
      }
    }
  }

  return {
    sha256: hash,
    sizeBytes: buffer.length,
    declaredMimeType,
    detectedMimeType: detected,
    extension: ext,
    errors,
    warnings,
    checks,
  };
}

/** Convenience predicate. */
export function isIntegrityClean(report: IntegrityReport): boolean {
  return report.errors.length === 0 && report.sha256.length === 64;
}
