// ─── AQLIYA XLSX Archive Security Validator ───
// Shared defense-in-depth against ZIP bombs and decompression attacks
// for every XLSX.read() call site in the codebase.
//
// Defense layers:
//   Layer 1 — Compressed size limit (MAX_XLSX_BUFFER_SIZE = 10 MB)
//   Layer 2 — ZIP Central Directory pre-validation (this module)
//       Parses CD without decompressing any entries.
//       Checks: entry count, compression ratio, duplicate entries,
//       total uncompressed size, CD bounds.
//   Layer 3 — Post-parse cell count check (caller responsibility)
//
// Safe: reads only the fixed-size Central Directory structure at the
// end of the ZIP. No decompression occurs. No shared mutable state.

/** Maximum allowed compressed XLSX buffer size (10 MB). */
export const MAX_XLSX_BUFFER_SIZE = 10 * 1024 * 1024;

/** Maximum entries allowed in the ZIP archive. */
const MAX_ZIP_ENTRIES = 200;

/** Maximum total uncompressed size across all entries (50 MB). */
const MAX_ZIP_UNCOMPRESSED_SIZE = 50 * 1024 * 1024;

/** Maximum compression ratio (uncompressed / compressed) per entry. */
const MAX_ENTRY_COMPRESSION_RATIO = 100;

export type XlsxValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Pre-validate a ZIP/XLSX buffer by parsing the Central Directory.
 * Does NOT decompress any entries — reads only metadata from the
 * fixed-size central directory structure at the end of the ZIP.
 *
 * Call this BEFORE every `XLSX.read()` to prevent ZIP bomb attacks.
 *
 * @param buffer  Raw file bytes (from user upload or storage)
 * @returns `{ valid: true }` if safe, or `{ valid: false, reason }` if bomb detected
 */
export function validateXlsxArchive(buffer: Buffer): XlsxValidationResult {
  // ── Size guard ──
  if (buffer.length > MAX_XLSX_BUFFER_SIZE) {
    return {
      valid: false,
      reason: `XLSX buffer ${(buffer.length / 1024 / 1024).toFixed(1)} MB exceeds max ${(MAX_XLSX_BUFFER_SIZE / 1024 / 1024)} MB`,
    };
  }

  // ── Minimum size ──
  if (buffer.length < 22) {
    return { valid: false, reason: "XLSX buffer too small to be valid ZIP" };
  }

  // ── Find End of Central Directory (EOCD) record ──
  // Scans backwards from end. EOCD signature: 0x50 0x4B 0x05 0x06
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
    return {
      valid: false,
      reason: "XLSX buffer missing ZIP End of Central Directory",
    };
  }

  // ── Read CD metadata from EOCD ──
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
    return {
      valid: false,
      reason: "XLSX ZIP central directory extends beyond buffer",
    };
  }

  // ── Parse Central Directory entries ──
  let totalUncompressedSize = 0;
  const seenNames = new Set<string>();

  let pos = cdOffset;
  for (let i = 0; i < entryCount && pos + 46 <= cdOffset + cdSize; i++) {
    const sig = buffer.readUInt32LE(pos);
    if (sig !== 0x02014b50) {
      return {
        valid: false,
        reason: `XLSX ZIP invalid central directory entry at offset ${pos}`,
      };
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
