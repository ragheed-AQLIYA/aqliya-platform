export type StorageProviderType = 'local' | 's3' | 'azure-blob'

export interface StorageFile {
  key: string
  filename: string
  mimeType: string
  sizeBytes: number
  content: Buffer
}

export interface StorageProvider {
  readonly type: StorageProviderType
  /** Store a file. Returns the storage key. */
  store(key: string, file: { filename: string; mimeType: string; content: Buffer }): Promise<string>
  /** Retrieve a file by key. Returns null if not found. */
  retrieve(key: string): Promise<StorageFile | null>
  /** Delete a file by key. Returns true if deleted. */
  delete(key: string): Promise<boolean>
  /** Check if a file exists. */
  exists(key: string): Promise<boolean>
}
