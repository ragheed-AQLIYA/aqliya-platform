// ─── StorageProvider (local) → StorageProvider (integration) Adapter ───
// Wraps the local storage provider (S3/Local) into the integration
// layer's StorageProvider interface for health checks and unified access.

import { IntegrationType } from "../types";
import type {
  StorageProvider as IntegrationStorageProvider,
  StorageFileInput,
  StorageFileOutput,
  ProviderHealth,
} from "../types";
import type { StorageProvider as LocalStorageProvider } from "@/lib/platform/storage/types";

/**
 * Adapter that wraps a local StorageProvider into the integration
 * layer's StorageProvider interface.
 */
export class StorageProviderAdapter implements IntegrationStorageProvider {
  readonly providerId: string;
  readonly providerType = IntegrationType.STORAGE as const;

  private inner: LocalStorageProvider;

  constructor(inner: LocalStorageProvider, providerId = "storage-adapter") {
    this.inner = inner;
    this.providerId = providerId;
  }

  async store(key: string, file: StorageFileInput): Promise<string> {
    return this.inner.store(key, {
      filename: file.filename,
      mimeType: file.mimeType,
      content: file.content,
    });
  }

  async retrieve(key: string): Promise<StorageFileOutput | null> {
    const result = await this.inner.retrieve(key);
    if (!result) return null;
    return {
      key: result.key,
      filename: result.filename,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      content: result.content,
    };
  }

  async delete(key: string): Promise<boolean> {
    return this.inner.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.inner.exists(key);
  }

  async health(): Promise<ProviderHealth> {
    const startMs = Date.now();
    try {
      // Quick self-test: store then delete a small marker
      const markerKey = `__health_${Date.now()}`;
      await this.inner.store(markerKey, {
        filename: "health.txt",
        mimeType: "text/plain",
        content: Buffer.from("ok"),
      });
      await this.inner.delete(markerKey);
      return {
        healthy: true,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: err instanceof Error ? err.message : "Storage health check failed",
      };
    }
  }
}

/**
 * Wrap a local StorageProvider into an integration layer StorageProvider adapter.
 */
export function wrapStorageProvider(
  provider: LocalStorageProvider,
  providerId?: string,
): IntegrationStorageProvider {
  return new StorageProviderAdapter(provider, providerId);
}
