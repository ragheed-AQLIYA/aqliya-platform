/**
 * Shared product guard logic.
 *
 * This module provides reusable guard functions for common product
 * access patterns (engagement, project, deal, workspace).
 *
 * Previously each product implemented these independently.
 * Now they converge here and product-specific guard files
 * become thin wrappers.
 */

import type { CurrentUser } from "@/lib/auth";
import type { AccessAction } from "./types";
import { enforce } from "./action-guard";

// ─── AuditOS Guards ───

/**
 * Guard access to an AuditOS engagement.
 */
export async function guardEngagementAccess(
  user: CurrentUser,
  engagementId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "engagement", id: engagementId }, action);
}

// ─── LocalContentOS Guards ───

/**
 * Guard access to a LocalContentOS project.
 */
export async function guardProjectAccess(
  user: CurrentUser,
  projectId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "project", id: projectId }, action);
}

/**
 * Guard access to a LocalContentOS workspace.
 */
export async function guardLcWorkspaceAccess(
  user: CurrentUser,
  workspaceId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "workspace", id: workspaceId }, action);
}

// ─── SalesOS Guards ───

/**
 * Guard access to a SalesOS deal.
 */
export async function guardDealAccess(
  user: CurrentUser,
  dealId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "deal", id: dealId }, action);
}

/**
 * Guard access to a SalesOS account.
 */
export async function guardAccountAccess(
  user: CurrentUser,
  accountId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "account", id: accountId }, action);
}

// ─── WorkflowOS Guards ───

/**
 * Guard access to a WorkflowOS record.
 */
export async function guardRecordAccess(
  user: CurrentUser,
  recordId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "record", id: recordId }, action);
}

// ─── Platform Guards ───

/**
 * Guard access to an organization.
 */
export async function guardOrganizationAccess(
  user: CurrentUser,
  organizationId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(
    user,
    { type: "organization", id: organizationId, tenantId: organizationId },
    action,
  );
}

/**
 * Guard access to a workspace.
 */
export async function guardWorkspaceAccess(
  user: CurrentUser,
  workspaceId: string,
  action: AccessAction = "read",
): Promise<void> {
  await enforce(user, { type: "workspace", id: workspaceId }, action);
}
