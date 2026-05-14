import type { StorageProvider, StorageFile, StorageProviderType } from './types'

export class ObjectStorageProvider implements StorageProvider {
  readonly type: StorageProviderType

  constructor(providerType: 's3' | 'azure-blob') {
    this.type = providerType
  }

  async store(_key: string, _file: { filename: string; mimeType: string; content: Buffer }): Promise<string> {
    throw new Error(`${this.type} storage provider not yet integrated. Set STORAGE_PROVIDER=local for local development.`)
  }

  async retrieve(_key: string): Promise<StorageFile | null> {
    throw new Error(`${this.type} storage provider not yet integrated. Set STORAGE_PROVIDER=local for local development.`)
  }

  async delete(_key: string): Promise<boolean> {
    throw new Error(`${this.type} storage provider not yet integrated. Set STORAGE_PROVIDER=local for local development.`)
  }

  async exists(_key: string): Promise<boolean> {
    throw new Error(`${this.type} storage provider not yet integrated. Set STORAGE_PROVIDER=local for local development.`)
  }
}
