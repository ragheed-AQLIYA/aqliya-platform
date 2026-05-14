import type { StorageProvider, StorageProviderType } from './types'
import { LocalStorageProvider, getLocalStoreBaseDir } from './local-storage-provider'
import { ObjectStorageProvider } from './object-storage-provider'

let _provider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider
  _provider = createStorageProvider()
  return _provider
}

export function createStorageProvider(): StorageProvider {
  const providerType: StorageProviderType = (process.env.STORAGE_PROVIDER as StorageProviderType) ?? 'local'

  switch (providerType) {
    case 'local':
      return new LocalStorageProvider(getLocalStoreBaseDir())
    case 's3':
    case 'azure-blob':
      return new ObjectStorageProvider(providerType)
    default:
      return new LocalStorageProvider()
  }
}

export function buildStorageKey(engagementId: string, evidenceId: string, filename: string): string {
  return `engagements/${engagementId}/evidence/${evidenceId}/${filename}`
}

export function parseStorageKey(key: string): { engagementId: string; evidenceId: string; filename: string } | null {
  const parts = key.split('/')
  if (parts.length >= 4 && parts[0] === 'engagements') {
    return {
      engagementId: parts[1],
      evidenceId: parts[3],
      filename: parts.slice(4).join('/'),
    }
  }
  return null
}

export { LocalStorageProvider, ObjectStorageProvider }
export type { StorageProvider, StorageFile, StorageProviderType } from './types'
