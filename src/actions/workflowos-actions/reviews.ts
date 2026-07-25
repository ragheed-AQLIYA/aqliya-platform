"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  createWorkflowReview,
  listWorkflowReviews,
  isExpectedAccessDeniedError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_createReview(
  clientId: string,
  recordId: string,
  data: { status: "Approved" | "Returned"; notes?: string },
) {
  try {
    const review = await createWorkflowReview(clientId, recordId, data);
    return { success: true, data: review };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow review:", error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}

export async function workflow_listReviews(clientId: string, recordId: string) {
  try {
    const reviews = await listWorkflowReviews(clientId, recordId);
    return { success: true, data: reviews };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow reviews:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list reviews" };
  }
}
