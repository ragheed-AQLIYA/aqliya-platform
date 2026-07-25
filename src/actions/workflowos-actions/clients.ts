"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  createWorkflowClient,
  listWorkflowClientsForUser,
  getWorkflowClient,
  updateWorkflowClientStatus,
  isExpectedAccessDeniedError,
  mapAuthError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_createClient(data: {
  name: string;
  slug: string;
}) {
  try {
    const client = await createWorkflowClient(data);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow client:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listClients() {
  try {
    const clients = await listWorkflowClientsForUser();
    return { success: true, data: clients };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow clients:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list clients" };
  }
}

export async function workflow_getClient(clientId: string) {
  try {
    const client = await getWorkflowClient(clientId);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error getting Workflow client:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to get client" };
  }
}

export async function workflow_updateClientStatus(
  clientId: string,
  status: string,
) {
  try {
    const client = await updateWorkflowClientStatus(clientId, status);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error updating Workflow client status:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}
