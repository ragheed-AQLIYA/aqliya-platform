import {
  ALLOWED_EXTENSIONS,
  MAX_COMPRESSION_RATIO,
  artifactIdentity,
  detectMimeFromMagic,
  detectOoxmlHazards,
  extensionOf,
  isIntegrityClean,
  readZipCentralDirectory,
  sha256,
  validateArtifactIntegrity,
} from "../integrity";
import { cleanXlsx, csvArtifact, csvRow, makeZip } from "./fixtures";

describe("LCGPA regulatory :: SHA-256 (§10)", () => {
  it("produces a stable 64-character digest", () => {
    const hash = sha256(Buffer.from("official artifact", "utf8"));
    expect(hash).toHaveLength(64);
    expect(hash).toBe(sha256(Buffer.from("official artifact", "utf8")));
  });

  it("produces a different digest for different bytes", () => {
    expect(sha256(Buffer.from("a"))).not.toBe(sha256(Buffer.from("b")));
  });

  it("BLOCKS ingestion when the artifact is empty", () => {
    expect(() => sha256(Buffer.alloc(0))).toThrow(/HASH_INPUT_EMPTY/);
  });

  it("BLOCKS ingestion when the body is not a Buffer", () => {
    expect(() => sha256("not a buffer" as unknown as Buffer)).toThrow(
      /HASH_INPUT_INVALID/,
    );
  });

  it("derives content-addressed artifact identity from source + hash (§32)", () => {
    const hash = sha256(Buffer.from("x"));
    expect(artifactIdentity("src-1", hash)).toBe(`src-1:${hash}`);
  });
});

describe("LCGPA regulatory :: magic bytes", () => {
  it("detects a ZIP/OOXML container", () => {
    expect(detectMimeFromMagic(cleanXlsx())).toBe("application/zip");
  });

  it("detects PDF", () => {
    expect(detectMimeFromMagic(Buffer.from("%PDF-1.7\n..."))).toBe("application/pdf");
  });

  it("detects legacy OLE2 (.xls) so it can be rejected", () => {
    const ole = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0x00, 0x00]);
    expect(detectMimeFromMagic(ole)).toBe("application/vnd.ms-excel");
  });

  it("detects HTML — an error page served instead of a document", () => {
    expect(detectMimeFromMagic(Buffer.from("<!DOCTYPE html><html></html>"))).toBe(
      "text/html",
    );
  });

  it("returns null for unrecognised content", () => {
    expect(detectMimeFromMagic(Buffer.from([0x01, 0x02, 0x03, 0x04]))).toBeNull();
  });

  it("extracts file extensions", () => {
    expect(extensionOf("mandatory-list-2026-08.xlsx")).toBe("xlsx");
    expect(extensionOf("noextension")).toBeNull();
  });
});

describe("LCGPA regulatory :: ZIP structural safety (§41)", () => {
  it("reads the central directory of a valid container", () => {
    const entries = readZipCentralDirectory(cleanXlsx());
    expect(entries).not.toBeNull();
    expect(entries).toHaveLength(3);
    expect(entries?.map((e) => e.name)).toContain("xl/workbook.xml");
  });

  it("returns null for a non-ZIP buffer", () => {
    expect(readZipCentralDirectory(Buffer.from("plain text"))).toBeNull();
  });

  it("detects macro parts", () => {
    const hazards = detectOoxmlHazards([
      { name: "xl/vbaProject.bin", compressedSize: 10, uncompressedSize: 10, sizeUnknown: false },
    ]);
    expect(hazards.macros).toHaveLength(1);
  });

  it("detects external links and calc chains", () => {
    const hazards = detectOoxmlHazards([
      { name: "xl/externalLinks/externalLink1.xml", compressedSize: 5, uncompressedSize: 5, sizeUnknown: false },
      { name: "xl/calcChain.xml", compressedSize: 5, uncompressedSize: 5, sizeUnknown: false },
    ]);
    expect(hazards.externalLinks).toHaveLength(1);
    expect(hazards.hasCalcChain).toBe(true);
  });
});

describe("LCGPA regulatory :: artifact validation (§41)", () => {
  it("accepts a clean CSV artifact", () => {
    const report = validateArtifactIntegrity({
      buffer: csvArtifact([csvRow("P-001")]),
      filename: "mandatory-list.csv",
      declaredMimeType: "text/csv",
    });
    expect(report.errors).toEqual([]);
    expect(isIntegrityClean(report)).toBe(true);
    expect(report.sha256).toHaveLength(64);
  });

  it("accepts a clean xlsx container", () => {
    const report = validateArtifactIntegrity({
      buffer: cleanXlsx(),
      filename: "mandatory-list.xlsx",
      declaredMimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(report.errors).toEqual([]);
    expect(report.detectedMimeType).toBe("application/zip");
  });

  it("REJECTS a disallowed extension", () => {
    const report = validateArtifactIntegrity({
      buffer: Buffer.from("MZ binary"),
      filename: "payload.exe",
      declaredMimeType: "application/octet-stream",
    });
    expect(report.errors.join(" ")).toMatch(/EXTENSION_NOT_ALLOWED/);
  });

  it("REJECTS an .xlsx that is not a ZIP container", () => {
    const report = validateArtifactIntegrity({
      buffer: Buffer.from("<html>404 not found</html>"),
      filename: "mandatory-list.xlsx",
      declaredMimeType: "text/html",
    });
    expect(report.errors.join(" ")).toMatch(/MIME_MISMATCH/);
  });

  it("REJECTS legacy OLE2 workbooks", () => {
    const ole = Buffer.concat([
      Buffer.from([0xd0, 0xcf, 0x11, 0xe0]),
      Buffer.alloc(64),
    ]);
    const report = validateArtifactIntegrity({
      buffer: ole,
      filename: "list.xlsx",
      declaredMimeType: "application/vnd.ms-excel",
    });
    expect(report.errors.join(" ")).toMatch(/LEGACY_OLE2_REJECTED/);
  });

  it("REJECTS a macro-enabled workbook", () => {
    const zip = makeZip([
      { name: "[Content_Types].xml", content: "<Types/>" },
      { name: "xl/vbaProject.bin", content: "macro payload" },
    ]);
    const report = validateArtifactIntegrity({
      buffer: zip,
      filename: "list.xlsx",
      declaredMimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(report.errors.join(" ")).toMatch(/MACRO_DETECTED/);
    expect(isIntegrityClean(report)).toBe(false);
  });

  it("REJECTS a ZIP bomb by compression ratio", () => {
    const zip = makeZip([
      {
        name: "xl/worksheets/sheet1.xml",
        content: "a".repeat(100),
        fakeCompressedSize: 100,
        fakeUncompressedSize: 100 * (MAX_COMPRESSION_RATIO + 50),
      },
    ]);
    const report = validateArtifactIntegrity({
      buffer: zip,
      filename: "list.xlsx",
      declaredMimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(report.errors.join(" ")).toMatch(/ZIP_BOMB_SUSPECTED/);
  });

  it("REJECTS an artifact above the size ceiling", () => {
    const report = validateArtifactIntegrity({
      buffer: Buffer.from("x".repeat(2048)),
      filename: "list.csv",
      declaredMimeType: "text/csv",
      maxSizeBytes: 1024,
    });
    expect(report.errors.join(" ")).toMatch(/ARTIFACT_TOO_LARGE/);
  });

  it("WARNS but does not block on external links", () => {
    const zip = makeZip([
      { name: "[Content_Types].xml", content: "<Types/>" },
      { name: "xl/externalLinks/externalLink1.xml", content: "<x/>" },
    ]);
    const report = validateArtifactIntegrity({
      buffer: zip,
      filename: "list.xlsx",
      declaredMimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(report.errors).toEqual([]);
    expect(report.warnings.join(" ")).toMatch(/EXTERNAL_LINKS_PRESENT/);
  });

  it("WARNS that formulas are not regulatory truth", () => {
    const zip = makeZip([
      { name: "[Content_Types].xml", content: "<Types/>" },
      { name: "xl/calcChain.xml", content: "<c/>" },
    ]);
    const report = validateArtifactIntegrity({
      buffer: zip,
      filename: "list.xlsx",
      declaredMimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    expect(report.warnings.join(" ")).toMatch(/FORMULAS_PRESENT/);
  });

  it("BLOCKS when the hash cannot be generated", () => {
    const report = validateArtifactIntegrity({
      buffer: Buffer.alloc(0),
      filename: "list.csv",
      declaredMimeType: "text/csv",
    });
    expect(report.sha256).toBe("");
    expect(report.errors.join(" ")).toMatch(/SHA256_UNAVAILABLE/);
    expect(isIntegrityClean(report)).toBe(false);
  });

  it("exposes an allow-list of accepted extensions", () => {
    expect(ALLOWED_EXTENSIONS).toContain("xlsx");
    expect(ALLOWED_EXTENSIONS).not.toContain("exe");
  });
});
