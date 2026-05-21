export type StorageProviderType = "local" | "s3" | "azure-blob";

export interface StorageFile {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  content: Buffer;
}

export interface StorageProvider {
  readonly type: StorageProviderType;
  store(
    key: string,
    file: { filename: string; mimeType: string; content: Buffer },
  ): Promise<string>;
  retrieve(key: string): Promise<StorageFile | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}
