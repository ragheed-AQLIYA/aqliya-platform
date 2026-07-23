import type { IFilesService, FileMetadata } from "../contracts/files";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { prisma } from "../prisma";

export class FilesServiceWrapper implements IFilesService {
  async upload(params: {
    file: Buffer;
    filename: string;
    mimeType: string;
    organizationId: string;
    uploadedBy: string;
    path?: string;
  }): Promise<KernelResult<FileMetadata>> {
    try {
      const id = randomUUID();
      const checksum = createHash("sha256").update(params.file).digest("hex");
      const storageKey = `${params.organizationId}/${params.path ?? "uploads"}/${id}/${params.filename}`;

      // Persist to CoreEvidence for cross-product traceability
      await prisma.coreEvidence.create({
        data: {
          id,
          organizationId: params.organizationId,
          productSlug: "platform",
          productEvidenceId: id,
          resourceType: "File",
          resourceId: id,
          filename: params.filename,
          fileType: params.mimeType,
          storageKey,
          fileHash: checksum,
          lifecycleStatus: "created",
          uploadedById: params.uploadedBy,
        },
      });

      const metadata: FileMetadata = {
        id,
        key: storageKey,
        originalName: params.filename,
        mimeType: params.mimeType,
        size: params.file.length,
        checksum,
        organizationId: params.organizationId,
        uploadedBy: params.uploadedBy,
        createdAt: new Date(),
      };
      return { success: true, data: metadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async download(
    _fileId: string,
    _organizationId: string,
  ): Promise<KernelResult<{ stream: ReadableStream; metadata: FileMetadata }>> {
    return { success: false, error: "Use platform download service for file retrieval", code: "DELEGATE" };
  }

  async scan(fileId: string): Promise<KernelResult<{ clean: boolean; threat?: string }>> {
    const evidence = await prisma.coreEvidence.findUnique({ where: { id: fileId } });
    if (!evidence) {
      return { success: false, error: "File not found" };
    }
    return { success: true, data: { clean: true } };
  }

  async delete(fileId: string, organizationId: string): Promise<KernelResult<void>> {
    try {
      const evidence = await prisma.coreEvidence.findFirst({
        where: { id: fileId, organizationId },
      });
      if (!evidence) {
        return { success: false, error: "File not found" };
      }
      await prisma.coreEvidence.update({
        where: { id: fileId },
        data: { lifecycleStatus: "archived" },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  async getMetadata(fileId: string): Promise<KernelResult<FileMetadata>> {
    try {
      const evidence = await prisma.coreEvidence.findUnique({
        where: { id: fileId },
      });
      if (!evidence) {
        return { success: false, error: "File not found" };
      }
      return {
        success: true,
        data: {
          id: evidence.id,
          key: evidence.storageKey ?? "",
          originalName: evidence.filename,
          mimeType: evidence.fileType,
          size: 0,
          checksum: evidence.fileHash ?? "",
          organizationId: evidence.organizationId,
          uploadedBy: evidence.uploadedById ?? "unknown",
          createdAt: evidence.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Metadata lookup failed",
      };
    }
  }
}
