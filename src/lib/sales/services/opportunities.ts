import type { SalesOpportunity, SalesOpportunityStage } from "../types";
import {
  createOpportunity,
  getOpportunity,
  listOpportunities,
  listOpportunitiesForAccount,
  updateOpportunity,
} from "../store";

export function salesListOpportunities(
  organizationId: string,
): SalesOpportunity[] {
  return listOpportunities(organizationId);
}

export function salesListOpportunitiesForAccount(
  organizationId: string,
  accountId: string,
): SalesOpportunity[] {
  return listOpportunitiesForAccount(organizationId, accountId);
}

export function salesGetOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesOpportunity | undefined {
  return getOpportunity(organizationId, opportunityId);
}

export function salesCreateOpportunity(
  input: Omit<SalesOpportunity, "id">,
): SalesOpportunity {
  return createOpportunity(input);
}

export function salesUpdateOpportunityStage(
  organizationId: string,
  opportunityId: string,
  stage: SalesOpportunityStage,
  patch?: Partial<SalesOpportunity>,
): SalesOpportunity | undefined {
  return updateOpportunity(organizationId, opportunityId, {
    ...patch,
    stage,
  });
}
