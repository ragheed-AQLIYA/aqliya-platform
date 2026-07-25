/**
 * SalesOS Store — Signals domain
 */

import type { SalesSignal } from "../types";
import { salesTimestamps } from "../entity-factory";
import {
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
  listGovernedForOpportunity,
  listGovernedForAccount,
} from "./common";

export function listSignals(organizationId: string): SalesSignal[] {
  return [...getOrgStore(organizationId).signals.values()];
}

export function getSignal(
  organizationId: string,
  signalId: string,
): SalesSignal | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
  );
}

export function listSignalsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesSignal[] {
  return listGovernedForOpportunity(listSignals(organizationId), opportunityId);
}

export function listSignalsForAccount(
  organizationId: string,
  accountId: string,
): SalesSignal[] {
  return listGovernedForAccount(listSignals(organizationId), accountId);
}

export function createSignal(
  input: Omit<
    SalesSignal,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesSignal {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).signals,
    "sales-signal",
    { ...input, status: "active", source: "ai_draft", ...ts },
  );
}

export function updateSignal(
  organizationId: string,
  signalId: string,
  patch: Partial<SalesSignal>,
): SalesSignal | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
    patch,
  );
}

export function deleteSignal(
  organizationId: string,
  signalId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
  );
}
