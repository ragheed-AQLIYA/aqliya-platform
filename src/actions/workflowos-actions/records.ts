"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  createWorkflowRecord,
  listWorkflowRecords,
  getWorkflowRecord,
  updateWorkflowRecord,
  isExpectedAccessDeniedError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_createRecord(
  clientId: string,
  data: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
  },
) {
  try {
    const record = await createWorkflowRecord(clientId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create record",
    };
  }
}

export async function workflow_listRecords(clientId: string) {
  try {
    const records = await listWorkflowRecords(clientId);
    return { success: true, data: records };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow records:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list records" };
  }
}

export async function workflow_getRecord(clientId: string, recordId: string) {
  try {
    const record = await getWorkflowRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error getting Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get record",
    };
  }
}

export async function workflow_updateRecord(
  clientId: string,
  recordId: string,
  data: { title?: string; description?: string; priority?: string },
) {
  try {
    const record = await updateWorkflowRecord(clientId, recordId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error updating Workflow record:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update record",
    };
  }
}
