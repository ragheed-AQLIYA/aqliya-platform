import "server-only";
import type { StorageProvider, StorageFile, StorageProviderType } from "./types";

type S3Client = import("@aws-sdk/client-s3").S3Client;
type PutObjectCommandInput = import("@aws-sdk/client-s3").PutObjectCommandInput;
type GetObjectCommandInput = import("@aws-sdk/client-s3").GetObjectCommandInput;
type DeleteObjectCommandInput =
  import("@aws-sdk/client-s3").DeleteObjectCommandInput;
type HeadObjectCommandInput =
  import("@aws-sdk/client-s3").HeadObjectCommandInput;

const mimeMap: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  csv: "text/csv",
};

function mimeFromExt(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return mimeMap[ext] ?? "application/octet-stream";
}

function getBucket(): string {
  return process.env.S3_BUCKET ?? "aqliya-audit";
}

function getRegion(): string {
  return process.env.S3_REGION ?? "eu-west-1";
}

let _s3Client: S3Client | null = null;

async function getS3Client(): Promise<S3Client> {
  if (_s3Client) return _s3Client;
  const { S3Client: S3 } = await import("@aws-sdk/client-s3");
  const endpoint = process.env.S3_ENDPOINT; // Optional: MinIO / custom S3-compatible
  const config: Record<string, unknown> = { region: getRegion() };
  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = true;
  }
  _s3Client = new S3(config);
  return _s3Client;
}

export class ObjectStorageProvider implements StorageProvider {
  readonly type: StorageProviderType;

  constructor(providerType: "s3" | "azure-blob") {
    if (providerType === "azure-blob") {
      throw new Error(
        "Azure Blob storage is not yet implemented. Use STORAGE_PROVIDER=s3 or local.",
      );
    }
    this.type = providerType;
  }

  async store(
    key: string,
    file: { filename: string; mimeType: string; content: Buffer },
  ): Promise<string> {
    const client = await getS3Client();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const input: PutObjectCommandInput = {
      Bucket: getBucket(),
      Key: key,
      Body: file.content,
      ContentType: file.mimeType,
      ContentDisposition: `attachment; filename="${file.filename.replace(/["\r\n]/g, "_")}"`,
    };
    await client.send(new PutObjectCommand(input));
    return key;
  }

  async retrieve(key: string): Promise<StorageFile | null> {
    try {
      const client = await getS3Client();
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const input: GetObjectCommandInput = { Bucket: getBucket(), Key: key };
      const response = await client.send(new GetObjectCommand(input));

      const filename = key.split("/").pop() ?? key;
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(Buffer.from(chunk));
      }
      const content = Buffer.concat(chunks);

      return {
        key,
        filename,
        mimeType: response.ContentType ?? mimeFromExt(filename),
        sizeBytes: content.length,
        content,
      };
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === "NoSuchKey" || err.name === "NotFound")
      ) {
        return null;
      }
      throw err;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const client = await getS3Client();
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const input: DeleteObjectCommandInput = { Bucket: getBucket(), Key: key };
      await client.send(new DeleteObjectCommand(input));
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await getS3Client();
      const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
      const input: HeadObjectCommandInput = { Bucket: getBucket(), Key: key };
      await client.send(new HeadObjectCommand(input));
      return true;
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === "NotFound" || err.name === "NoSuchKey")
      ) {
        return false;
      }
      throw err;
    }
  }
}
