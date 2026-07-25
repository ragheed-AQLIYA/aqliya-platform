import type { ProviderFactory, ProviderConfig } from "../types";

export const s3StorageFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { S3StorageProvider } = await import(
      "@/lib/platform/storage/s3-storage-provider"
    );
    const { wrapStorageProvider } = await import("../adapters/storage-adapter");
    const provider = new S3StorageProvider({
      endpoint: config.credentials?.endpoint ?? "",
      region: config.credentials?.region ?? "us-east-1",
      accessKeyId: config.credentials?.accessKeyId ?? config.credentials?.accessKey ?? "",
      secretAccessKey: config.credentials?.secretAccessKey ?? config.credentials?.secretKey ?? "",
      bucket: config.credentials?.bucket ?? "aqliya-storage",
      forcePathStyle: config.credentials?.forcePathStyle === "true",
    });
    return wrapStorageProvider(provider, "s3");
  },
};

export const localStorageFactory: ProviderFactory = {
  async create(_config: ProviderConfig) {
    const { LocalStorageProvider } = await import(
      "@/lib/platform/storage/local-storage-provider"
    );
    const { wrapStorageProvider } = await import("../adapters/storage-adapter");
    return wrapStorageProvider(new LocalStorageProvider(), "local");
  },
};
