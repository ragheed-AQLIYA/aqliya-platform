import type { KernelResult } from "../types";

export interface FileMetadata {
  id: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  organizationId: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface IFilesService {
  upload(params: {
    file: Buffer;
    filename: string;
    mimeType: string;
    organizationId: string;
    uploadedBy: string;
    path?: string;
  }): Promise<KernelResult<FileMetadata>>;
  download(fileId: string, organizationId: string): Promise<KernelResult<{ stream: ReadableStream; metadata: FileMetadata }>>;
  scan(fileId: string): Promise<KernelResult<{ clean: boolean; threat?: string }>>;
  delete(fileId: string, organizationId: string): Promise<KernelResult<void>>;
  getMetadata(fileId: string): Promise<KernelResult<FileMetadata>>;
}
