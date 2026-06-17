import {
  isScanRejected,
  isScanningSafe,
  scanEvidenceFile,
} from "@/lib/audit/file-scanner";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("scanEvidenceFile — development mode", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
    delete process.env.SCANNER_PROVIDER;
  });

  it("returns skipped_dev in dev mode with no scanner", async () => {
    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
    });
    expect(result.status).toBe("skipped_dev");
    expect(result.provider).toBe("dev-mock");
    expect(result.details).toContain("DEV ONLY");
  });
});

describe("scanEvidenceFile — production mode", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "production";
  });

  it("blocks uploads when no scanner configured (fail-closed)", async () => {
    delete process.env.SCANNER_PROVIDER;
    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
    });
    expect(result.status).toBe("error");
    expect(result.provider).toBe("none");
    expect(result.details).toContain("Upload blocked");
  });

  it("blocks uploads for unsupported scanner providers", async () => {
    process.env.SCANNER_PROVIDER = "s3";
    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
    });
    expect(result.status).toBe("error");
    expect(result.provider).toBe("s3");
    expect(result.details).toContain("not supported");
  });

  it("returns error when clamav is configured but unreachable", async () => {
    process.env.SCANNER_PROVIDER = "clamav";
    process.env.CLAMAV_HOST = "127.0.0.1";
    process.env.CLAMAV_PORT = "1";

    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
      content: Buffer.from("clean-file"),
    });

    expect(result.status).toBe("error");
    expect(result.provider).toBe("clamav");
  });
});

describe("isScanRejected", () => {
  it("rejects infected and error statuses", () => {
    expect(isScanRejected({ status: "infected", provider: "x", scannedAt: "" })).toBe(true);
    expect(isScanRejected({ status: "error", provider: "x", scannedAt: "" })).toBe(true);
    expect(isScanRejected({ status: "clean", provider: "x", scannedAt: "" })).toBe(false);
    expect(isScanRejected({ status: "skipped_dev", provider: "x", scannedAt: "" })).toBe(false);
  });
});

describe("isScanningSafe", () => {
  it("returns true in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.SCANNER_PROVIDER;
    expect(isScanningSafe()).toBe(true);
  });

  it("returns false in production without scanner", () => {
    process.env.NODE_ENV = "production";
    delete process.env.SCANNER_PROVIDER;
    expect(isScanningSafe()).toBe(false);
  });

  it("returns true in production with scanner configured", () => {
    process.env.NODE_ENV = "production";
    process.env.SCANNER_PROVIDER = "clamav";
    expect(isScanningSafe()).toBe(true);
  });
});
