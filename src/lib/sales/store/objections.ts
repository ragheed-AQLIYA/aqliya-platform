/**
 * SalesOS Store — Objections domain
 */

import type { SalesObjection } from "../types";
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

export function listObjections(organizationId: string): SalesObjection[] {
  return [...getOrgStore(organizationId).objections.values()];
}

export function getObjection(
  organizationId: string,
  objectionId: string,
): SalesObjection | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
  );
}

export function listObjectionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesObjection[] {
  return listGovernedForOpportunity(
    listObjections(organizationId),
    opportunityId,
  );
}

export function listObjectionsForAccount(
  organizationId: string,
  accountId: string,
): SalesObjection[] {
  return listGovernedForAccount(listObjections(organizationId), accountId);
}

export function createObjection(
  input: Omit<
    SalesObjection,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesObjection {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).objections,
    "sales-objection",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateObjection(
  organizationId: string,
  objectionId: string,
  patch: Partial<SalesObjection>,
): SalesObjection | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
    patch,
  );
}

export function deleteObjection(
  organizationId: string,
  objectionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
  );
}
