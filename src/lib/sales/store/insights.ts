/**
 * SalesOS Store — ICP Insights & Win/Loss Insights domain
 */

import type { SalesICPInsight, SalesWinLossInsight } from "../types";
import { salesTimestamps } from "../entity-factory";
import {
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
} from "./common";

// ─── ICP Insights ───

export function listICPInsights(organizationId: string): SalesICPInsight[] {
  return [...getOrgStore(organizationId).icpInsights.values()];
}

export function getICPInsight(
  organizationId: string,
  insightId: string,
): SalesICPInsight | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
  );
}

export function createICPInsight(
  input: Omit<
    SalesICPInsight,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesICPInsight {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).icpInsights,
    "sales-icp",
    { ...input, status: "active", source: "ai_draft", ...ts },
  );
}

export function updateICPInsight(
  organizationId: string,
  insightId: string,
  patch: Partial<SalesICPInsight>,
): SalesICPInsight | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
    patch,
  );
}

export function deleteICPInsight(
  organizationId: string,
  insightId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
  );
}

// ─── Win/Loss Insights ───

export function listWinLossInsights(
  organizationId: string,
): SalesWinLossInsight[] {
  return [...getOrgStore(organizationId).winLossInsights.values()];
}

export function getWinLossInsight(
  organizationId: string,
  insightId: string,
): SalesWinLossInsight | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
  );
}

export function listWinLossInsightsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesWinLossInsight[] {
  return listWinLossInsights(organizationId).filter(
    (w) => w.opportunityId === opportunityId,
  );
}

export function createWinLossInsight(
  input: Omit<
    SalesWinLossInsight,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesWinLossInsight {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).winLossInsights,
    "sales-wl",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateWinLossInsight(
  organizationId: string,
  insightId: string,
  patch: Partial<SalesWinLossInsight>,
): SalesWinLossInsight | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
    patch,
  );
}

export function deleteWinLossInsight(
  organizationId: string,
  insightId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
  );
}
