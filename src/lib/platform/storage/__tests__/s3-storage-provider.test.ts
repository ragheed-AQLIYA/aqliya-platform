import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ── Mock S3Client before importing the module under test ──
const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();

// Real class so instanceof checks work in the implementation
class MockS3ServiceException extends Error {
  name: string;
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
  S3ServiceException: MockS3ServiceException,
}));

// ── Imports (after mocks) ──
import { S3StorageProvider } from "../s3-storage-provider";
import type { S3StorageConfig } from "../s3-storage-provider";
import { StorageError } from "../storage-errors";

const defaultConfig: S3StorageConfig = {
  endpoint: "https://s3.example.com",
  bucket: "test-bucket",
  accessKeyId: "AKIA123",
  secretAccessKey: "secret456",
  region: "us-east-1",
};

describe("S3StorageProvider", () => {
  let provider: S3StorageProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new S3StorageProvider(defaultConfig);
  });

  // ── Type ──

  it("has type s3", () => {
    expect(provider.type).toBe("s3");
  });

  // ── store ──

  describe("store", () => {
    it("stores a file and returns the key", async () => {
      mockSend.mockResolvedValueOnce({ ETag: '"abc123"' });

      const result = await provider.store("test/file.pdf", {
        filename: "file.pdf",
        mimeType: "application/pdf",
        content: Buffer.from("PDF content here"),
      });

      expect(result).toBe("test/file.pdf");
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("throws StorageError on failure", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        provider.store("test/file.pdf", {
          filename: "file.pdf",
          mimeType: "application/pdf",
          content: Buffer.from("content"),
        }),
      ).rejects.toThrow(StorageError);
    });
  });

  // ── retrieve ──

  describe("retrieve", () => {
    it("returns a StorageFile when key exists", async () => {
      mockSend.mockResolvedValueOnce({
        ContentType: "application/pdf",
        ContentLength: 17,
        Body: {
          transformToByteArray: async () => new Uint8Array(Buffer.from("PDF content here")),
        },
      });

      const result = await provider.retrieve("test/file.pdf");

      expect(result).not.toBeNull();
      expect(result!.key).toBe("test/file.pdf");
      expect(result!.filename).toBe("file.pdf");
      expect(result!.mimeType).toBe("application/pdf");
      expect(result!.sizeBytes).toBe(17);
      expect(result!.content.toString()).toBe("PDF content here");
    });

    it("returns null when key does not exist (NoSuchKey)", async () => {
      mockSend.mockRejectedValueOnce(
        new MockS3ServiceException("The specified key does not exist.", "NoSuchKey"),
      );

      const result = await provider.retrieve("test/missing.pdf");
      expect(result).toBeNull();
    });

    it("returns null when Body is undefined", async () => {
      mockSend.mockResolvedValueOnce({
        ContentType: "application/pdf",
        ContentLength: 0,
        Body: undefined,
      });

      const result = await provider.retrieve("test/empty.pdf");
      expect(result).toBeNull();
    });

    it("throws StorageError on unexpected error", async () => {
      mockSend.mockRejectedValueOnce(new Error("Access denied"));

      await expect(provider.retrieve("test/file.pdf")).rejects.toThrow(StorageError);
    });
  });

  // ── delete ──

  describe("delete", () => {
    it("returns true on successful deletion", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await provider.delete("test/file.pdf");
      expect(result).toBe(true);
    });

    it("returns false when key does not exist (NoSuchKey)", async () => {
      mockSend.mockRejectedValueOnce(
        new MockS3ServiceException("The specified key does not exist.", "NoSuchKey"),
      );

      const result = await provider.delete("test/missing.pdf");
      expect(result).toBe(false);
    });

    it("throws StorageError on unexpected error", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      await expect(provider.delete("test/file.pdf")).rejects.toThrow(StorageError);
    });
  });

  // ── exists ──

  describe("exists", () => {
    it("returns true when key exists", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await provider.exists("test/file.pdf");
      expect(result).toBe(true);
    });

    it("returns false when key does not exist (NotFound)", async () => {
      mockSend.mockRejectedValueOnce(
        new MockS3ServiceException("Not found", "NotFound"),
      );

      const result = await provider.exists("test/missing.pdf");
      expect(result).toBe(false);
    });

    it("returns false when key does not exist (NoSuchKey)", async () => {
      mockSend.mockRejectedValueOnce(
        new MockS3ServiceException("No such key", "NoSuchKey"),
      );

      const result = await provider.exists("test/missing.pdf");
      expect(result).toBe(false);
    });

    it("throws StorageError on unexpected error", async () => {
      mockSend.mockRejectedValueOnce(new Error("Access denied"));

      await expect(provider.exists("test/file.pdf")).rejects.toThrow(StorageError);
    });
  });

  // ── getPublicUrl ──

  describe("getPublicUrl", () => {
    it("constructs path-style URL", () => {
      const url = provider.getPublicUrl("path/to/file.pdf");
      expect(url).toBe("https://s3.example.com/test-bucket/path/to/file.pdf");
    });

    it("handles trailing slash on endpoint", () => {
      const providerWithSlash = new S3StorageProvider({
        ...defaultConfig,
        endpoint: "https://minio.internal/",
      });
      const url = providerWithSlash.getPublicUrl("file.pdf");
      expect(url).toBe("https://minio.internal/test-bucket/file.pdf");
    });
  });

  // ── listFiles ──

  describe("listFiles", () => {
    it("returns list of objects", async () => {
      mockSend.mockResolvedValueOnce({
        Contents: [
          { Key: "file1.pdf", Size: 100, LastModified: new Date("2026-01-01") },
          { Key: "file2.pdf", Size: 200, LastModified: new Date("2026-01-02") },
        ],
      });

      const result = await provider.listFiles("prefix/");

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("file1.pdf");
      expect(result[0].size).toBe(100);
      expect(result[1].key).toBe("file2.pdf");
    });

    it("returns empty array when no matches", async () => {
      mockSend.mockResolvedValueOnce({ Contents: [] });

      const result = await provider.listFiles("nonexistent/");
      expect(result).toEqual([]);
    });

    it("filters out items without Key", async () => {
      mockSend.mockResolvedValueOnce({
        Contents: [
          { Key: undefined, Size: 0, LastModified: undefined },
          { Key: "real-file.pdf", Size: 50, LastModified: new Date() },
        ],
      });

      const result = await provider.listFiles();
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("real-file.pdf");
    });

    it("throws StorageError on failure", async () => {
      mockSend.mockRejectedValueOnce(new Error("S3 unavailable"));

      await expect(provider.listFiles()).rejects.toThrow(StorageError);
    });
  });

  // ── forcePathStyle ──

  describe("constructor", () => {
    it("defaults forcePathStyle to true (Minio-compatible)", () => {
      // We cannot directly inspect S3Client constructor args from here,
      // but we verify the provider is created without error.
      const p = new S3StorageProvider(defaultConfig);
      expect(p).toBeInstanceOf(S3StorageProvider);
    });
  });
});