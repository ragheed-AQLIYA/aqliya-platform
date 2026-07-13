import { getExpectedType, validateFileContent } from "@/lib/security/file-validation";

// Save original env
const originalNodeEnv = process.env.NODE_ENV;
const originalJestWorker = process.env.JEST_WORKER_ID;

describe("getExpectedType", () => {
  it("maps pdf extension to pdf type", () => {
    expect(getExpectedType("pdf")).toBe("pdf");
  });

  it("maps .pdf with dot to pdf type", () => {
    expect(getExpectedType(".pdf")).toBe("pdf");
  });

  it("maps jpg to jpeg type", () => {
    expect(getExpectedType("jpg")).toBe("jpeg");
  });

  it("maps jpeg to jpeg type", () => {
    expect(getExpectedType("jpeg")).toBe("jpeg");
  });

  it("maps xlsx to xlsx type", () => {
    expect(getExpectedType("xlsx")).toBe("xlsx");
  });

  it("maps xls to xlsx type", () => {
    expect(getExpectedType("xls")).toBe("xlsx");
  });

  it("maps docx to docx type", () => {
    expect(getExpectedType("docx")).toBe("docx");
  });

  it("maps csv to csv type", () => {
    expect(getExpectedType("csv")).toBe("csv");
  });

  it("maps txt to txt type", () => {
    expect(getExpectedType("txt")).toBe("txt");
  });

  it("returns null for unknown extensions", () => {
    expect(getExpectedType("exe")).toBeNull();
    expect(getExpectedType("sh")).toBeNull();
    expect(getExpectedType("bat")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(getExpectedType("PDF")).toBe("pdf");
    expect(getExpectedType("XLSX")).toBe("xlsx");
    expect(getExpectedType("Csv")).toBe("csv");
  });
});

describe("validateFileContent", () => {
  // Temporarily unset test env vars to test actual validation logic
  beforeAll(() => {
    delete process.env.NODE_ENV;
    delete process.env.JEST_WORKER_ID;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalJestWorker) process.env.JEST_WORKER_ID = originalJestWorker;
  });

  it("validates correct PDF magic bytes", () => {
    // %PDF = 0x25 0x50 0x44 0x46
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x20, 0x31, 0x2e, 0x34]);
    const result = validateFileContent(buffer, "pdf");
    expect(result.valid).toBe(true);
  });

  it("validates correct XLSX magic bytes (ZIP-based)", () => {
    // PK\x03\x04 = 0x50 0x4b 0x03 0x04
    const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    const result = validateFileContent(buffer, "xlsx");
    expect(result.valid).toBe(true);
  });

  it("validates correct PNG magic bytes", () => {
    // \x89PNG\r\n\x1a\n
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = validateFileContent(buffer, "png");
    expect(result.valid).toBe(true);
  });

  it("validates correct JPEG magic bytes", () => {
    // \xFF\xD8\xFF
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const result = validateFileContent(buffer, "jpeg");
    expect(result.valid).toBe(true);
  });

  it("rejects EXE disguised as PDF (wrong magic bytes)", () => {
    // MZ header (PE executable)
    const buffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const result = validateFileContent(buffer, "pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("does not match expected type");
  });

  it("rejects binary file claimed as CSV", () => {
    // Binary content with null bytes
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x00, 0x05]);
    const result = validateFileContent(buffer, "csv");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("binary data");
  });

  it("validates text-only CSV content", () => {
    const buffer = Buffer.from("Name,Amount,Category\nSupplier A,1000,Services\n");
    const result = validateFileContent(buffer, "csv");
    expect(result.valid).toBe(true);
  });

  it("validates text-only TXT content", () => {
    const buffer = Buffer.from("This is a plain text file\nWith multiple lines\n");
    const result = validateFileContent(buffer, "txt");
    expect(result.valid).toBe(true);
  });

  it("rejects unknown file extension", () => {
    const buffer = Buffer.from([0x00, 0x01]);
    const result = validateFileContent(buffer, "exe");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown file type");
  });

  it("rejects ZIP-based file claimed as PDF", () => {
    const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const result = validateFileContent(buffer, "pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("does not match");
  });

  it("handles buffer shorter than magic bytes gracefully", () => {
    // Only 2 bytes, PDF needs 4
    const buffer = Buffer.from([0x25, 0x50]);
    const result = validateFileContent(buffer, "pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("does not match");
  });

  it("passes in test mode with NODE_ENV=test", () => {
    process.env.NODE_ENV = "test";
    const buffer = Buffer.from([0x00, 0x01, 0x02]);
    const result = validateFileContent(buffer, "pdf");
    expect(result.valid).toBe(true);
    // Restore
    delete process.env.NODE_ENV;
  });
});
