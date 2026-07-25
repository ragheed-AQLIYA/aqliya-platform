/**
 * SalesOS Store — Opportunity, Interaction & Activity domain
 */

import type {
  SalesOpportunity,
  SalesInteractionLog,
  SalesActivity,
} from "../types";
import { activityToInteraction } from "../types";
import { governedDefaults, salesEntityId } from "../entity-factory";
import { getOrgStore, schedulePersist, persistPrismaWrite } from "./common";

// ─── Opportunities ───

export function listOpportunities(organizationId: string): SalesOpportunity[] {
  return [...getOrgStore(organizationId).opportunities.values()];
}

export function listOpportunitiesForAccount(
  organizationId: string,
  accountId: string,
): SalesOpportunity[] {
  return listOpportunities(organizationId).filter(
    (o) => o.accountId === accountId,
  );
}

export function getOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesOpportunity | undefined {
  const opp = getOrgStore(organizationId).opportunities.get(opportunityId);
  return opp?.organizationId === organizationId ? opp : undefined;
}

export function createOpportunity(
  input: Omit<SalesOpportunity, "id">,
): SalesOpportunity {
  const store = getOrgStore(input.organizationId);
  const opportunity: SalesOpportunity = {
    ...input,
    id: `sales-opp-${crypto.randomUUID().slice(0, 8)}`,
    stage: input.stage ?? "Draft",
  };
  store.opportunities.set(opportunity.id, opportunity);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createOpportunity", async () => {
    const { opportunityRepository } = await import("../repositories");
    await opportunityRepository.create(opportunity);
  });
  return opportunity;
}

export function updateOpportunity(
  organizationId: string,
  opportunityId: string,
  patch: Partial<SalesOpportunity>,
): SalesOpportunity | undefined {
  const store = getOrgStore(organizationId);
  const existing = store.opportunities.get(opportunityId);
  if (!existing || existing.organizationId !== organizationId) return undefined;
  const updated = { ...existing, ...patch };
  store.opportunities.set(opportunityId, updated);
  schedulePersist(organizationId);
  persistPrismaWrite(organizationId, "updateOpportunity", async () => {
    const { opportunityRepository } = await import("../repositories");
    await opportunityRepository.update(organizationId, opportunityId, patch);
  });
  return updated;
}

// ─── Interactions ───

export function createInteraction(
  input: Omit<SalesInteractionLog, "id" | "loggedAt">,
): SalesInteractionLog {
  const store = getOrgStore(input.organizationId);
  const interaction: SalesInteractionLog = {
    ...input,
    id: `sales-int-${crypto.randomUUID().slice(0, 8)}`,
    loggedAt: new Date().toISOString(),
  };
  store.interactions.set(interaction.id, interaction);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createInteraction", async () => {
    const { interactionRepository } = await import("../repositories");
    await interactionRepository.create(interaction);
  });
  return interaction;
}

export function listInteractionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()].filter(
    (i) => i.opportunityId === opportunityId,
  );
}

export function listInteractionsForAccount(
  organizationId: string,
  accountId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()]
    .filter((i) => i.accountId === accountId)
    .sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    );
}

export function listAllInteractions(
  organizationId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  );
}

// ─── Activities ───

export function listActivities(organizationId: string): SalesActivity[] {
  return [...getOrgStore(organizationId).activities.values()];
}

export function listActivitiesForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesActivity[] {
  return listActivities(organizationId).filter(
    (a) => a.opportunityId === opportunityId,
  );
}

export function createActivity(
  input: Omit<SalesActivity, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): SalesActivity {
  const store = getOrgStore(input.organizationId);
  const ts = governedDefaults({
    source: input.source,
    status: input.status,
  });
  const activity: SalesActivity = {
    ...input,
    id: salesEntityId("sales-act"),
    createdAt: input.createdAt ?? ts.createdAt,
    updatedAt: input.updatedAt ?? ts.updatedAt,
    source: input.source ?? ts.source,
    status: input.status ?? ts.status,
    confidence: input.confidence,
  };
  store.activities.set(activity.id, activity);
  const interaction = activityToInteraction(activity);
  store.interactions.set(interaction.id, interaction);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createInteraction", async () => {
    const { interactionRepository } = await import("../repositories");
    await interactionRepository.create(interaction);
  });
  return activity;
}
