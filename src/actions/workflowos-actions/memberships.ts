"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  createWorkflowMembership,
  listWorkflowMemberships,
  updateWorkflowMembershipRole,
  updateWorkflowMembershipStatus,
  findUserByEmail,
  isExpectedAccessDeniedError,
  mapAuthError,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function workflow_createMembership(data: {
  clientId: string;
  userId: string;
  role: string;
}) {
  try {
    const membership = await createWorkflowMembership(data);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error creating Workflow membership:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_listMemberships(clientId: string) {
  try {
    const memberships = await listWorkflowMemberships(clientId);
    return { success: true, data: memberships };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error listing Workflow memberships:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to list memberships" };
  }
}

export async function workflow_addMembershipByEmail(data: {
  clientId: string;
  email: string;
  role: string;
}) {
  try {
    const user = await findUserByEmail(data.email);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود حالياً" };
    }
    const membership = await createWorkflowMembership({
      clientId: data.clientId,
      userId: user.id,
      role: data.role,
    });
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error adding Workflow membership:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_updateMembershipRole(
  membershipId: string,
  role: string,
) {
  try {
    const membership = await updateWorkflowMembershipRole(membershipId, role);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error updating Workflow membership role:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function workflow_updateMembershipStatus(
  membershipId: string,
  status: string,
) {
  try {
    const membership = await updateWorkflowMembershipStatus(
      membershipId,
      status,
    );
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      logger.error("Error updating Workflow membership status:", error instanceof Error ? error : undefined);
    return { success: false, error: mapAuthError(error) };
  }
}
