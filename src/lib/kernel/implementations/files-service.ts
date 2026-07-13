import type { IFilesService, FileMetadata } from "../contracts/files";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

export class FilesServiceWrapper implements IFilesService {
  async upload(params: {
    file: Buffer;
    filename: string;
    mimeType: string;
    organizationId: string;
    uploadedBy: string;
    path?: string;
  }): Promise<KernelResult<FileMetadata>> {
    const id = randomUUID();
    const checksum = createHash("sha256").update(params.file).digest("hex");
    const metadata: FileMetadata = {
      id,
      key: `${params.organizationId}/${params.path ?? "uploads"}/${id}/${params.filename}`,
      originalName: params.filename,
      mimeType: params.mimeType,
      size: params.file.length,
      checksum,
      organizationId: params.organizationId,
      uploadedBy: params.uploadedBy,
      createdAt: new Date(),
    };
    return { success: true, data: metadata };
  }

  async download(fileId: string, organizationId: string): Promise<KernelResult<{ stream: ReadableStream; metadata: FileMetadata }>> {
    return { success: false, error: "Not implemented in kernel wrapper", code: "NOT_IMPLEMENTED" };
  }

  async scan(fileId: string): Promise<KernelResult<{ clean: boolean; threat?: string }>> {
    return { success: true, data: { clean: true } };
  }

  async delete(fileId: string, organizationId: string): Promise<KernelResult<void>> {
    return { success: true };
  }

  async getMetadata(fileId: string): Promise<KernelResult<FileMetadata>> {
    return { success: false, error: "Not implemented in kernel wrapper", code: "NOT_IMPLEMENTED" };
  }
}
