"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  submitWorkflowRecordForReview,
  approveWorkflowRecord,
  returnWorkflowRecord,
  archiveWorkflowRecord,
  isExpectedAccessDeniedError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_submitRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await submitWorkflowRecordForReview(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error submitting Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit record",
    };
  }
}

export async function workflow_approveRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await approveWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error approving Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve record",
    };
  }
}

export async function workflow_returnRecord(
  clientId: string,
  recordId: string,
  notes?: string,
) {
  try {
    const record = await returnWorkflowRecord(clientId, recordId, notes);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error returning Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to return record",
    };
  }
}

export async function workflow_archiveRecord(
  clientId: string,
  recordId: string,
) {
  try {
    const record = await archiveWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error archiving Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to archive record",
    };
  }
}
