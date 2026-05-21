import { scanEvidenceFile, isScanningSafe } from "@/lib/audit/file-scanner";

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

  it("returns prod_pass_through when no scanner configured", async () => {
    delete process.env.SCANNER_PROVIDER;
    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
    });
    expect(result.status).toBe("prod_pass_through");
    expect(result.provider).toBe("none");
    expect(result.details).toContain("No scanner configured");
  });

  it("returns prod_pass_through when scanner is configured but not integrated", async () => {
    process.env.SCANNER_PROVIDER = "clamav";
    const result = await scanEvidenceFile({
      filename: "test.pdf",
      fileType: "pdf",
    });
    expect(result.status).toBe("prod_pass_through");
    expect(result.provider).toBe("clamav");
    expect(result.details).toContain("configured but not yet integrated");
  });
});

describe("isScanningSafe", () => {
  it("returns true in development", () => {
    process.env.NODE_ENV = "development";
    expect(isScanningSafe()).toBe(true);
  });

  it("returns true in production (always safe — pass-through mode)", () => {
    process.env.NODE_ENV = "production";
    delete process.env.SCANNER_PROVIDER;
    expect(isScanningSafe()).toBe(true);
  });
});
