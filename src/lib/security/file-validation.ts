// ─── AQLIYA File Magic Bytes Validator ───
// Replaces extension-only validation with content-based type detection.
// Every upload handler must call validateFileContent() before storing a file.

export type ValidatedFileType = "pdf" | "png" | "jpeg" | "xlsx" | "docx" | "csv" | "txt";

/** Magic bytes signatures for common file types */
const MAGIC_SIGNATURES: Record<ValidatedFileType, { offset: number; bytes: number[] }[]> = {
  pdf: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  png: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }], // \x89PNG\r\n\x1a\n
  jpeg: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }], // \xFF\xD8\xFF
  xlsx: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }], // PK\x03\x04 (ZIP-based Office)
  docx: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }], // PK\x03\x04 (ZIP-based Office)
  csv: [], // No magic bytes — checked via binary content detection
  txt: [], // No magic bytes — checked via binary content detection
};

/** Map file extension to the expected magic bytes type */
const EXTENSION_TO_MAGIC_TYPE: Record<string, ValidatedFileType> = {
  pdf: "pdf",
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  xlsx: "xlsx",
  xls: "xlsx", // xls is also ZIP-based OOXML in modern files, but legacy .xls uses OLE2
  docx: "docx",
  doc: "docx", // same caveat as xls
  csv: "csv",
  txt: "txt",
};

/**
 * Check if a buffer matches the expected magic bytes signature.
 */
function matchesMagic(buffer: Buffer, expected: ValidatedFileType): boolean {
  const sigs = MAGIC_SIGNATURES[expected];
  if (sigs.length === 0) return true; // csv/txt — handled by binary check separately

  for (const sig of sigs) {
    if (buffer.length < sig.offset + sig.bytes.length) continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[sig.offset + i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

/**
 * Check if a buffer contains binary (non-text) content.
 * Returns true for text files, false for binary.
 */
function isTextContent(buffer: Buffer): boolean {
  // Sample up to 512 bytes
  const sampleLen = Math.min(buffer.length, 512);
  let nonPrintable = 0;
  for (let i = 0; i < sampleLen; i++) {
    const byte = buffer[i];
    // Allow: tab(9), newline(10), carriage return(13), space(32) through tilde(126)
    // Also allow UTF-8 continuation bytes (0x80-0xBF) and Arabic range bytes
    if (byte === 0x00) return false; // null byte = definitely binary
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) {
      nonPrintable++;
    }
  }
  // If more than 10% are control chars (excluding common whitespace), treat as binary
  return nonPrintable <= sampleLen * 0.1;
}

/**
 * Resolve the expected magic bytes type from a file extension.
 * Returns null if the extension is unknown (should be rejected by extension check first).
 */
export function getExpectedType(extension: string): ValidatedFileType | null {
  const ext = extension.toLowerCase().replace(/^\./, "");
  return EXTENSION_TO_MAGIC_TYPE[ext] ?? null;
}

/**
 * Result of file content validation.
 */
export interface ContentValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a file buffer's magic bytes match its claimed extension.
 *
 * This is the primary defense against extension-renaming attacks
 * (e.g., malware.exe renamed to report.pdf).
 *
 * @param buffer  The raw file content as a Buffer
 * @param extension  The claimed file extension (e.g., "pdf", "xlsx")
 * @returns  Validation result with error message if invalid
 */
export function validateFileContent(buffer: Buffer, extension: string): ContentValidationResult {
  const expectedType = getExpectedType(extension);

  if (!expectedType) {
    // Unknown extension — extension check should have caught this already
    return { valid: false, error: `Unknown file type: ${extension}` };
  }

  // For text-based formats (csv, txt), check for binary content
  if (expectedType === "csv" || expectedType === "txt") {
    if (!isTextContent(buffer)) {
      return {
        valid: false,
        error: `File content does not appear to be a valid ${extension.toUpperCase()} file (contains binary data)`,
      };
    }
    return { valid: true };
  }

  // For all other formats, check magic bytes
  if (!matchesMagic(buffer, expectedType)) {
    return {
      valid: false,
      error: `File content does not match expected type ${extension.toUpperCase()}. The file may be corrupted or have a misleading extension.`,
    };
  }

  return { valid: true };
}
