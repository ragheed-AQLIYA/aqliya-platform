/**
 * SalesOS Store — Next Actions domain
 */

import type { SalesNextAction } from "../types";
import { salesTimestamps } from "../entity-factory";
import {
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
  listGovernedForOpportunity,
} from "./common";

export function listNextActions(organizationId: string): SalesNextAction[] {
  return [...getOrgStore(organizationId).nextActions.values()];
}

export function getNextAction(
  organizationId: string,
  actionId: string,
): SalesNextAction | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
  );
}

export function listNextActionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesNextAction[] {
  return listGovernedForOpportunity(
    listNextActions(organizationId),
    opportunityId,
  );
}

export function createNextAction(
  input: Omit<
    SalesNextAction,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesNextAction {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).nextActions,
    "sales-next",
    { ...input, status: "draft", source: "ai_draft", ...ts },
  );
}

export function updateNextAction(
  organizationId: string,
  actionId: string,
  patch: Partial<SalesNextAction>,
): SalesNextAction | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
    patch,
  );
}

export function deleteNextAction(
  organizationId: string,
  actionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
  );
}
