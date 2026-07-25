import type {
  SalesAccount,
  SalesInteractionLog,
  SalesOpportunity,
} from "@/lib/sales/types";

export const STALL_MS = 14 * 86400000;
export const WEEK_MS = 7 * 86400000;
export const CLOSED_STAGES = new Set([
  "ClosedWon",
  "ClosedLost",
  "Archived",
  "Rejected",
]);

export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  meeting: "اجتماع",
  call: "مكالمة",
  email: "بريد",
  note: "ملاحظة",
  demo: "عرض",
};

export function resolveStalledOpportunities(
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
): SalesOpportunity[] {
  const now = Date.now();
  return opportunities.filter((o) => {
    if (CLOSED_STAGES.has(o.stage)) return false;
    const opInts = interactions.filter((i) => i.opportunityId === o.id);
    if (opInts.length === 0)
      return o.stage === "Draft" || o.stage === "Qualification";
    const last = new Date(opInts[0].loggedAt).getTime();
    return now - last > STALL_MS;
  });
}

export function resolveMeetingsThisWeek(
  interactions: SalesInteractionLog[],
): SalesInteractionLog[] {
  const now = Date.now();
  return interactions.filter(
    (i) =>
      (i.type === "meeting" || i.type === "call") &&
      now - new Date(i.loggedAt).getTime() < WEEK_MS,
  );
}

export interface UseCommandCenterParams {
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  accounts: SalesAccount[];
}

export function useCommandCenter({
  opportunities,
  interactions,
  accounts,
}: UseCommandCenterParams) {
  const stalledList = resolveStalledOpportunities(opportunities, interactions).slice(0, 6);
  const weeklyMeetings = resolveMeetingsThisWeek(interactions).slice(0, 6);
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return { stalledList, weeklyMeetings, accountById };
}
