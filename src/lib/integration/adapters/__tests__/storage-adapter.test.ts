// ─── StorageProviderAdapter — Unit Tests ───

import { IntegrationType } from "../../types";
import { StorageProviderAdapter, wrapStorageProvider } from "../storage-adapter";
import type { StorageProvider as LocalStorageProvider } from "@/lib/platform/storage/types";

function makeMockLocalStorage(overrides: Partial<jest.Mocked<LocalStorageProvider>> = {}): jest.Mocked<LocalStorageProvider> {
  return {
    type: "local" as const,
    store: jest.fn().mockResolvedValue("stored-key"),
    retrieve: jest.fn().mockResolvedValue({
      key: "test-key",
      filename: "test.txt",
      mimeType: "text/plain",
      sizeBytes: 100,
      content: Buffer.from("test"),
    }),
    delete: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(true),
    ...overrides,
  } as jest.Mocked<LocalStorageProvider>;
}

describe("StorageProviderAdapter", () => {
  let mockLocal: jest.Mocked<LocalStorageProvider>;

  beforeEach(() => {
    mockLocal = makeMockLocalStorage();
  });

  describe("wrapStorageProvider", () => {
    it("returns adapter with correct providerType", () => {
      const adapter = wrapStorageProvider(mockLocal, "local");
      expect(adapter.providerType).toBe(IntegrationType.STORAGE);
      expect(adapter.providerId).toBe("local");
    });
  });

  describe("store", () => {
    it("delegates to inner provider", async () => {
      const adapter = new StorageProviderAdapter(mockLocal, "s3");
      const result = await adapter.store("my-key", {
        filename: "doc.pdf",
        mimeType: "application/pdf",
        content: Buffer.from("pdf-data"),
      });

      expect(mockLocal.store).toHaveBeenCalledWith("my-key", {
        filename: "doc.pdf",
        mimeType: "application/pdf",
        content: Buffer.from("pdf-data"),
      });
      expect(result).toBe("stored-key");
    });
  });

  describe("retrieve", () => {
    it("delegates and maps result", async () => {
      mockLocal.retrieve.mockResolvedValue({
        key: "my-key",
        filename: "doc.pdf",
        mimeType: "application/pdf",
        sizeBytes: 200,
        content: Buffer.from("data"),
      });
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.retrieve("my-key");

      expect(mockLocal.retrieve).toHaveBeenCalledWith("my-key");
      expect(result).toBeDefined();
      expect(result!.key).toBe("my-key");
      expect(result!.filename).toBe("doc.pdf");
      expect(result!.sizeBytes).toBe(200);
    });

    it("returns null when key not found", async () => {
      mockLocal.retrieve.mockResolvedValue(null);
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.retrieve("missing");
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("delegates to inner provider", async () => {
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.delete("my-key");
      expect(mockLocal.delete).toHaveBeenCalledWith("my-key");
      expect(result).toBe(true);
    });

    it("returns false when delete fails", async () => {
      mockLocal.delete.mockResolvedValue(false);
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.delete("my-key");
      expect(result).toBe(false);
    });
  });

  describe("exists", () => {
    it("delegates to inner provider", async () => {
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.exists("my-key");
      expect(mockLocal.exists).toHaveBeenCalledWith("my-key");
      expect(result).toBe(true);
    });

    it("returns false when not found", async () => {
      mockLocal.exists.mockResolvedValue(false);
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.exists("my-key");
      expect(result).toBe(false);
    });
  });

  describe("health", () => {
    it("returns healthy when store+delete succeeds", async () => {
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.health();

      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.lastCheck).toBeInstanceOf(Date);
    });

    it("returns unhealthy when store fails", async () => {
      mockLocal.store.mockRejectedValue(new Error("Disk full"));
      const adapter = new StorageProviderAdapter(mockLocal);
      const result = await adapter.health();

      expect(result.healthy).toBe(false);
      expect(result.error).toContain("Disk full");
    });
  });
});
