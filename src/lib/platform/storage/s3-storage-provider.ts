// ─── S3/Minio Storage Provider ───
// Implements StorageProvider using @aws-sdk/client-s3.
// Supports Minio via forcePathStyle in S3 client config.

import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import type { StorageProvider, StorageFile, StorageProviderType } from "./types";
import { StorageError } from "./storage-errors";

export interface S3StorageConfig {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle?: boolean;
}

export class S3StorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "s3";
  private client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucket;
    this.endpoint = config.endpoint;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle ?? true,
    });
  }

  async store(
    key: string,
    file: { filename: string; mimeType: string; content: Buffer },
  ): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.content,
          ContentType: file.mimeType,
          Metadata: {
            "x-amz-meta-original-filename": file.filename,
          },
        }),
      );
      return key;
    } catch (error) {
      throw new StorageError(
        `Failed to store file at key: ${key}`,
        error,
      );
    }
  }

  async retrieve(key: string): Promise<StorageFile | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        return null;
      }

      const byteArray = await response.Body.transformToByteArray();
      const content = Buffer.from(byteArray);

      return {
        key,
        filename: key.split("/").pop() ?? key,
        mimeType: response.ContentType ?? "application/octet-stream",
        sizeBytes: response.ContentLength ?? content.length,
        content,
      };
    } catch (error) {
      if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
        return null;
      }
      throw new StorageError(
        `Failed to retrieve file at key: ${key}`,
        error,
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
        return false;
      }
      throw new StorageError(
        `Failed to delete file at key: ${key}`,
        error,
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      if (
        error instanceof S3ServiceException &&
        (error.name === "NotFound" || error.name === "NoSuchKey")
      ) {
        return false;
      }
      throw new StorageError(
        `Failed to check existence of key: ${key}`,
        error,
      );
    }
  }

  /**
   * Get a public URL for the given key.
   * Constructs URL from endpoint + bucket + key (Minio-compatible path-style).
   */
  getPublicUrl(key: string): string {
    const cleanEndpoint = this.endpoint.replace(/\/+$/, "");
    return `${cleanEndpoint}/${this.bucket}/${key}`;
  }

  /**
   * List files with optional prefix.
   */
  async listFiles(
    prefix?: string,
  ): Promise<{ key: string; size: number; lastModified: Date }[]> {
    try {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
        }),
      );

      return (response.Contents ?? [])
        .filter((obj): obj is typeof obj & { Key: string } => !!obj.Key)
        .map((obj) => ({
          key: obj.Key,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified ?? new Date(0),
        }));
    } catch (error) {
      throw new StorageError(
        `Failed to list files with prefix: ${prefix ?? "(none)"}`,
        error,
      );
    }
  }
}