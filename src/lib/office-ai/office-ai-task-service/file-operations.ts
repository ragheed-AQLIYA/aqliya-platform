import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  alog,
  validateRequired,
  type AddOfficeAiFileInput,
  type OfficeAiFileResult,
} from "./common";

export async function addOfficeAiFile(
  taskId: string,
  input: AddOfficeAiFileInput,
): Promise<OfficeAiFileResult> {
  validateRequired(input.filename, "filename");
  validateRequired(input.fileType, "fileType");

  const file = await prisma.officeAiFile.create({
    data: {
      taskId,
      filename: input.filename,
      fileType: input.fileType,
      mimeType: input.mimeType ?? null,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      sizeBytes: input.sizeBytes ?? null,
      uploadedById: input.uploadedById ?? null,
      metadata: (input.metadata ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  await alog.record(
    "office_ai.file.attached",
    {
      type: "OfficeAiFile",
      id: file.id,
    },
    {
      actorId: input.uploadedById,
      severity: "info",
      sourceModel: "OfficeAiFile",
      sourceId: file.id,
      metadata: {
        governedSharedApplication: true,
        taskId,
        filename: input.filename,
        fileType: input.fileType,
      },
    },
  );

  return { success: true, data: file };
}
