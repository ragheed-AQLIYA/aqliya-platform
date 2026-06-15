// ─── Storage Provider Factory — SecretResolver-backed Credential Resolution ───
// All storage provider credentials SHOULD be resolved through this factory,
// never read directly from process.env by storage provider code.
//
// Pattern: try SecretResolver → catch → fall back to env-based createStorageProvider()

import "server-only";
import { secretResolver, SecretPurpose } from "@/lib/integration/secret-resolver";
import { createStorageProvider } from "./index";
import { LocalStorageProvider, getLocalStoreBaseDir } from "./local-storage-provider";
import { S3StorageProvider } from "./s3-storage-provider";
import type { StorageProvider } from "./types";

/**
 * Create a storage provider with SecretResolver-backed credential resolution.
 *
 * 1. If a TenantIntegration of type STORAGE with vault entry exists for the org,
 *    resolves the S3/Minio credentials from vault and creates the provider.
 * 2. Falls back to env-based createStorageProvider() (local or env-configured S3).
 *
 * Currently only S3/Minio vault resolution is supported; local storage always
 * falls through to env-based creation (no credentials needed for local disk).
 */
export async function createStorageProviderFromResolver(
  organizationId: string,
): Promise<StorageProvider> {
  // Try resolver for S3 config (non-local providers)
  const secretResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "STORAGE",
      "s3",
      SecretPurpose.STORAGE_READ,
    )
    .catch(() => null);

  if (secretResult) {
    const endpoint = secretResult.credentials.endpoint ?? secretResult.credentials.s3Endpoint;
    const bucket = secretResult.credentials.bucket ?? secretResult.credentials.s3Bucket;
    const accessKey = secretResult.credentials.accessKeyId ?? secretResult.credentials.accessKey;
    const secretKey = secretResult.credentials.secretAccessKey ?? secretResult.credentials.secretKey;
    const region = secretResult.credentials.region ?? secretResult.credentials.s3Region;
    const forcePathStyle = resolveBoolean(
      secretResult.credentials.forcePathStyle ?? secretResult.credentials.s3ForcePathStyle,
    );

    if (endpoint && accessKey && secretKey) {
      return createVaultS3StorageProvider({
        endpoint,
        bucket: bucket ?? "default",
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: region ?? "us-east-1",
        forcePathStyle,
      });
    }
  }

  // Also try minio provider type
  const minioResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "STORAGE",
      "minio",
      SecretPurpose.STORAGE_READ,
    )
    .catch(() => null);

  if (minioResult) {
    const endpoint = minioResult.credentials.endpoint ?? minioResult.credentials.minioEndpoint;
    const accessKey = minioResult.credentials.accessKey ?? minioResult.credentials.accessKeyId;
    const secretKey = minioResult.credentials.secretKey ?? minioResult.credentials.secretAccessKey;
    const bucket = minioResult.credentials.bucket ?? minioResult.credentials.minioBucket;
    const forcePathStyle = resolveBoolean(
      minioResult.credentials.forcePathStyle ?? minioResult.credentials.minioForcePathStyle,
    );

    if (endpoint && accessKey && secretKey) {
      return createVaultS3StorageProvider({
        endpoint,
        bucket: bucket ?? "default",
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: "us-east-1",
        forcePathStyle,
      });
    }
  }

  // Fall back to env-based provider (local or env-configured S3)
  return createStorageProvider();
}

interface VaultS3Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle?: boolean;
}

/**
 * Create an S3-compatible storage provider from vault-resolved credentials.
 * Builds an S3StorageProvider for S3/Minio endpoints.
 */
function createVaultS3StorageProvider(config: VaultS3Config): StorageProvider {
  return new S3StorageProvider(config);
}

/**
 * Resolve a boolean value from a string or boolean.
 * Handles "true"/"false" strings from vault resolvers and direct booleans.
 */
function resolveBoolean(value: string | boolean | undefined): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return undefined;
}