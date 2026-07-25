"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  createWorkflowDocumentMetadata,
  listWorkflowDocuments,
  uploadWorkflowDocument,
  deleteStoredWorkflowDocument,
  isExpectedAccessDeniedError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_createDocumentMetadata(
  clientId: string,
  recordId: string,
  data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;
  },
) {
  try {
    const doc = await createWorkflowDocumentMetadata(clientId, recordId, data);
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow document metadata:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create document metadata",
    };
  }
}

export async function workflow_listDocuments(
  clientId: string,
  recordId: string,
) {
  try {
    const docs = await listWorkflowDocuments(clientId, recordId);
    return { success: true, data: docs };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow documents:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list documents" };
  }
}

export async function workflow_uploadDocument(
  clientId: string,
  recordId: string,
  data: { fileName: string; fileType: string; contentBase64: string },
) {
  try {
    const content = Buffer.from(data.contentBase64, "base64");
    const doc = await uploadWorkflowDocument({
      clientId,
      recordId,
      fileName: data.fileName,
      fileType: data.fileType,
      content,
    });
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error uploading Workflow document:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

export async function workflow_deleteDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  try {
    await deleteStoredWorkflowDocument(clientId, recordId, documentId);
    return { success: true, data: null };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error deleting Workflow document:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}
