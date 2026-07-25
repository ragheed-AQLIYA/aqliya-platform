/**
 * SalesOS Store — Meetings & Outreach domain
 */

import type { SalesMeeting, SalesOutreach } from "../types";
import { salesTimestamps } from "../entity-factory";
import { getOrgStore, putGovernedEntity } from "./common";

// ─── Meetings ───

export function listMeetings(organizationId: string): SalesMeeting[] {
  return [...getOrgStore(organizationId).meetings.values()];
}

export function createMeeting(
  input: Omit<
    SalesMeeting,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesMeeting {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).meetings,
    "sales-meeting",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

// ─── Outreach ───

export function listOutreach(organizationId: string): SalesOutreach[] {
  return [...getOrgStore(organizationId).outreach.values()];
}
