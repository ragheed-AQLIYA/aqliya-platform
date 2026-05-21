import type { StorageProvider, StorageProviderType } from "./types";
import {
  LocalStorageProvider,
  getLocalStoreBaseDir,
} from "./local-storage-provider";

let _provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider;
  _provider = createStorageProvider();
  return _provider;
}

export function createStorageProvider(): StorageProvider {
  const providerType: StorageProviderType =
    (process.env.STORAGE_PROVIDER as StorageProviderType) ?? "local";

  if (providerType === "local") {
    return new LocalStorageProvider(getLocalStoreBaseDir());
  }

  return new LocalStorageProvider();
}

export { LocalStorageProvider };
export type {
  StorageProvider,
  StorageFile,
  StorageProviderType,
} from "./types";
