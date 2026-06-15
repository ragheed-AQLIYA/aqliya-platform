import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ── Mock S3Client before importing ──
// The factory now instantiates S3StorageProvider which needs S3Client mock
const mockS3Send = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send,
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
  S3ServiceException: class extends Error {
    name: string;
    constructor(message: string, name: string) {
      super(message);
      this.name = name;
    }
  },
}));

// ── Mock SecretResolver ──
const mockGetIntegrationSecretByType = jest.fn<() => Promise<{
  credentials: Record<string, string>;
  source: string;
  version: number;
  resolvedAt: Date;
  cacheHit: boolean;
}>>();

jest.mock("@/lib/integration/secret-resolver", () => ({
  secretResolver: {
    getIntegrationSecretByType: mockGetIntegrationSecretByType,
  },
  SecretPurpose: {
    STORAGE_READ: "STORAGE_READ",
  },
}));

import { createStorageProviderFromResolver } from "../storage-factory";

function makeSecretResult(overrides: Record<string, unknown> = {}) {
  return {
    credentials: { value: "default" },
    source: "vault" as const,
    version: 1,
    resolvedAt: new Date(),
    cacheHit: false,
    ...overrides,
  };
}

describe("Storage Provider Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure env fallback is available
    process.env.STORAGE_PROVIDER = "local";
  });

  describe("createStorageProviderFromResolver", () => {
    it("returns an S3 provider when vault S3 config is resolved", async () => {
      mockGetIntegrationSecretByType
        .mockResolvedValueOnce(
          makeSecretResult({
            credentials: {
              endpoint: "https://s3.example.com",
              bucket: "my-bucket",
              accessKeyId: "AKIA123",
              secretAccessKey: "secret123",
              region: "me-central-1",
            },
          }),
        )
        // minio fallback mock (won't be reached)
        .mockRejectedValueOnce(new Error("not found"));

      const provider = await createStorageProviderFromResolver("org-1");
      expect(provider).toBeDefined();
      expect(provider.type).toBe("s3");
    });

    it("falls back to env-based provider when resolver throws", async () => {
      mockGetIntegrationSecretByType.mockRejectedValue(new Error("Not found"));
      const provider = await createStorageProviderFromResolver("org-2");
      expect(provider).toBeDefined();
      expect(provider.type).toBe("local");
    });

    it("falls back when vault S3 config lacks required fields", async () => {
      mockGetIntegrationSecretByType
        .mockResolvedValueOnce(
          makeSecretResult({
            credentials: { endpoint: "https://s3.example.com" }, // missing accessKey
          }),
        )
        .mockRejectedValueOnce(new Error("not found"));

      const provider = await createStorageProviderFromResolver("org-3");
      expect(provider).toBeDefined();
      expect(provider.type).toBe("local");
    });

    it("resolves minio provider returning S3 provider", async () => {
      // S3 try fails
      mockGetIntegrationSecretByType
        .mockRejectedValueOnce(new Error("s3 not found"))
        // minio try succeeds
        .mockResolvedValueOnce(
          makeSecretResult({
            credentials: {
              minioEndpoint: "https://minio.example.com",
              accessKey: "minioadmin",
              secretKey: "miniopass",
              bucket: "data",
            },
          }),
        );

      const provider = await createStorageProviderFromResolver("org-4");
      expect(provider).toBeDefined();
      expect(provider.type).toBe("s3");
    });

    it("passes forcePathStyle when resolved", async () => {
      mockGetIntegrationSecretByType
        .mockResolvedValueOnce(
          makeSecretResult({
            credentials: {
              endpoint: "https://minio.internal:9000",
              bucket: "bucket1",
              accessKeyId: "admin",
              secretAccessKey: "pass",
              region: "us-east-1",
              forcePathStyle: "true",
            },
          }),
        )
        .mockRejectedValueOnce(new Error("not found"));

      const provider = await createStorageProviderFromResolver("org-5");
      expect(provider).toBeDefined();
      expect(provider.type).toBe("s3");
    });
  });
});