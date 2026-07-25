"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  getUserWorkflowRole,
  listWorkflowAuditEvents,
  recordWorkflowAuditEvent,
  isExpectedAccessDeniedError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_getUserRole(clientId: string) {
  try {
    const role = await getUserWorkflowRole(clientId);
    return { success: true, data: role };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error getting Workflow user role:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to get user role" };
  }
}

export async function workflow_listAuditEvents(
  clientId: string,
  options?: { recordId?: string; limit?: number; offset?: number },
) {
  try {
    const result = await listWorkflowAuditEvents({
      clientId,
      ...(options ?? {}),
    });
    return { success: true, data: result };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow audit events:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list audit events" };
  }
}

export async function logWorkflowAuditEvent(params: {
  recordId: string;
  organizationId: string;
  actorId: string;
  actorName?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
}) {
  try {
    await recordWorkflowAuditEvent({
      organizationId: params.organizationId,
      recordId: params.recordId,
      actorId: params.actorId,
      actorName: params.actorName,
      action: params.action,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      comment: params.comment,
    });
    return { success: true };
  } catch (error) {
    logger.error("Error logging audit event:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to log audit event" };
  }
}
