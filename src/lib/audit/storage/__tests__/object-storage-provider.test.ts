const sendMock = jest.fn();
const S3ClientMock = jest.fn(() => ({ send: sendMock, on: jest.fn() }));

class PutObjectCommand {
  constructor(public input: Record<string, unknown>) {}
}

class GetObjectCommand {
  constructor(public input: Record<string, unknown>) {}
}

class DeleteObjectCommand {
  constructor(public input: Record<string, unknown>) {}
}

class HeadObjectCommand {
  constructor(public input: Record<string, unknown>) {}
}

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: S3ClientMock,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
}));

describe("ObjectStorageProvider", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.S3_BUCKET = "aqliya-audit-test";
    process.env.S3_REGION = "me-central-1";
    delete process.env.S3_ENDPOINT;
    sendMock.mockReset();
    S3ClientMock.mockClear();
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("rejects azure-blob until it is implemented", async () => {
    const { ObjectStorageProvider } = await import("../object-storage-provider");

    expect(() => new ObjectStorageProvider("azure-blob")).toThrow(
      "Azure Blob storage is not yet implemented",
    );
  });

  it("stores files in S3 with sanitized content disposition", async () => {
    sendMock.mockResolvedValue({});

    const { ObjectStorageProvider } = await import("../object-storage-provider");
    const provider = new ObjectStorageProvider("s3");

    const key = await provider.store("evidence/file-1.pdf", {
      filename: 'trial-balance"\r\n.pdf',
      mimeType: "application/pdf",
      content: Buffer.from("pdf-content"),
    });

    expect(key).toBe("evidence/file-1.pdf");
    expect(S3ClientMock).toHaveBeenCalledWith({ region: "me-central-1" });

    const command = sendMock.mock.calls[0]?.[0] as PutObjectCommand;
    expect(command.input).toMatchObject({
      Bucket: "aqliya-audit-test",
      Key: "evidence/file-1.pdf",
      ContentType: "application/pdf",
      ContentDisposition: 'attachment; filename="trial-balance___.pdf"',
    });
  });

  it("supports custom S3 endpoints for MinIO-compatible deployments", async () => {
    process.env.S3_ENDPOINT = "http://localhost:9000";
    sendMock.mockResolvedValue({});

    const { ObjectStorageProvider } = await import("../object-storage-provider");
    const provider = new ObjectStorageProvider("s3");

    await provider.store("evidence/file-2.csv", {
      filename: "evidence.csv",
      mimeType: "text/csv",
      content: Buffer.from("a,b\n1,2"),
    });

    expect(S3ClientMock).toHaveBeenCalledWith({
      region: "me-central-1",
      endpoint: "http://localhost:9000",
      forcePathStyle: true,
    });
  });

  it("retrieves files, concatenates the response stream, and falls back to MIME by extension", async () => {
    sendMock.mockResolvedValue({
      Body: (async function* () {
        yield Buffer.from("hello ");
        yield Buffer.from("world");
      })(),
      ContentType: undefined,
    });

    const { ObjectStorageProvider } = await import("../object-storage-provider");
    const provider = new ObjectStorageProvider("s3");

    const file = await provider.retrieve("exports/report.csv");

    expect(file).toEqual({
      key: "exports/report.csv",
      filename: "report.csv",
      mimeType: "text/csv",
      sizeBytes: 11,
      content: Buffer.from("hello world"),
    });
  });

  it("returns null when S3 reports that the object does not exist", async () => {
    const notFound = new Error("missing");
    notFound.name = "NoSuchKey";
    sendMock.mockRejectedValue(notFound);

    const { ObjectStorageProvider } = await import("../object-storage-provider");
    const provider = new ObjectStorageProvider("s3");

    await expect(provider.retrieve("missing/file.pdf")).resolves.toBeNull();
  });

  it("returns false on delete failures and false on exists for missing keys", async () => {
    const missing = new Error("not found");
    missing.name = "NotFound";
    sendMock
      .mockRejectedValueOnce(new Error("delete failed"))
      .mockRejectedValueOnce(missing)
      .mockResolvedValueOnce({});

    const { ObjectStorageProvider } = await import("../object-storage-provider");
    const provider = new ObjectStorageProvider("s3");

    await expect(provider.delete("missing/file.pdf")).resolves.toBe(false);
    await expect(provider.exists("missing/file.pdf")).resolves.toBe(false);
    await expect(provider.exists("present/file.pdf")).resolves.toBe(true);
  });
});
