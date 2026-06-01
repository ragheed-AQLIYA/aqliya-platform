// ─── SalesOS meeting intelligence types ───

export type MeetingOutcome =
  | "discovery"
  | "qualification"
  | "proposal_review"
  | "negotiation"
  | "no_decision";

export interface MeetingIntelligenceRecord {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId?: string;
  scheduledAt: string;
  outcome?: MeetingOutcome;
  summary: string;
  summaryAr?: string;
  actionItems: readonly string[];
  evidenceRef?: string;
  sensitivityLevel: "standard" | "restricted" | "confidential";
}

export interface MeetingIntelligenceSummary {
  totalMeetings: number;
  pendingFollowUps: number;
  evidenceLinkedPct: number;
  topOutcomes: Record<MeetingOutcome, number>;
}

export function summarizeMeetings(
  records: MeetingIntelligenceRecord[],
): MeetingIntelligenceSummary {
  const topOutcomes = {} as Record<MeetingOutcome, number>;
  const outcomes: MeetingOutcome[] = [
    "discovery",
    "qualification",
    "proposal_review",
    "negotiation",
    "no_decision",
  ];
  for (const o of outcomes) topOutcomes[o] = 0;

  let evidenceLinked = 0;
  let pendingFollowUps = 0;

  for (const r of records) {
    if (r.evidenceRef) evidenceLinked++;
    if (r.actionItems.length > 0 && !r.outcome) pendingFollowUps++;
    if (r.outcome) topOutcomes[r.outcome]++;
  }

  return {
    totalMeetings: records.length,
    pendingFollowUps,
    evidenceLinkedPct:
      records.length === 0 ? 0 : Math.round((evidenceLinked / records.length) * 100),
    topOutcomes,
  };
}
