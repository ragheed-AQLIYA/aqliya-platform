/**
 * SalesOS Store — Competitor Mentions domain
 */

import type { SalesCompetitorMention } from "../types";
import { salesTimestamps } from "../entity-factory";
import {
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
  listGovernedForOpportunity,
} from "./common";

export function listCompetitorMentions(
  organizationId: string,
): SalesCompetitorMention[] {
  return [...getOrgStore(organizationId).competitorMentions.values()];
}

export function getCompetitorMention(
  organizationId: string,
  mentionId: string,
): SalesCompetitorMention | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
  );
}

export function listCompetitorMentionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesCompetitorMention[] {
  return listGovernedForOpportunity(
    listCompetitorMentions(organizationId),
    opportunityId,
  );
}

export function createCompetitorMention(
  input: Omit<
    SalesCompetitorMention,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesCompetitorMention {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).competitorMentions,
    "sales-comp",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateCompetitorMention(
  organizationId: string,
  mentionId: string,
  patch: Partial<SalesCompetitorMention>,
): SalesCompetitorMention | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
    patch,
  );
}

export function deleteCompetitorMention(
  organizationId: string,
  mentionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
  );
}
