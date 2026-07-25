"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  getCurrentUser,
  enforce,
  prisma,
  revalidatePath,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function uploadWorkflowEvidence(params: {
  recordId: string;
  filename: string;
  fileType: string;
  storageKey?: string;
  fileHash?: string;
  sizeBytes?: number;
  description?: string;
  stepIndex?: number;
}) {
  try {
    const user = await getCurrentUser();
    const record = await prisma.workflowRecord.findUnique({
      where: { id: params.recordId },
      select: { organizationId: true },
    });
    if (!record) return { success: false, error: "Record not found" };
    await enforce(user, { type: "organization", id: record.organizationId, tenantId: record.organizationId }, "update");

    const evidence = await prisma.workflowEvidence.create({
      data: {
        organizationId: record.organizationId,
        recordId: params.recordId,
        filename: params.filename,
        fileType: params.fileType,
        storageKey: params.storageKey,
        fileHash: params.fileHash,
        sizeBytes: params.sizeBytes,
        description: params.description,
        stepIndex: params.stepIndex,
        uploadedById: user.id,
      },
    });
    revalidatePath(`/workflowos/records/${params.recordId}`);
    return { success: true, data: evidence };
  } catch (error) {
    logger.error("Error uploading workflow evidence:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to upload evidence" };
  }
}

export async function listWorkflowEvidence(recordId: string, offset?: number) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: user.organizationId, tenantId: user.organizationId }, "update");
    const PAGE_SIZE = 50;
    const [evidence, totalCount] = await Promise.all([
      prisma.workflowEvidence.findMany({
        where: { organizationId: user.organizationId, recordId },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: offset || 0,
      }),
      prisma.workflowEvidence.count({ where: { organizationId: user.organizationId, recordId } }),
    ]);
    return { success: true, data: evidence, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount };
  } catch (error) {
    logger.error("Error listing workflow evidence:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list evidence" };
  }
}
