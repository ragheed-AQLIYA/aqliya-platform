import type { DisclosureTrigger, IfrsRuleEvaluation } from "./types";

const TOPIC_DISCLOSURE_MAP: Record<
  string,
  { title: string; noteType: string; priority: DisclosureTrigger["priority"] }
> = {
  "note-disclosure": {
    title: "General IFRS Disclosures",
    noteType: "accounting_policies",
    priority: "high",
  },
  "five-step-model": {
    title: "Revenue from Contracts with Customers",
    noteType: "revenue",
    priority: "high",
  },
  "contract-identification": {
    title: "Revenue Recognition Policies",
    noteType: "revenue",
    priority: "medium",
  },
  definition: {
    title: "Property, Plant and Equipment",
    noteType: "ppe",
    priority: "medium",
  },
  "initial-measurement": {
    title: "PPE Measurement and Recognition",
    noteType: "ppe",
    priority: "medium",
  },
  depreciation: {
    title: "Depreciation Methods and Useful Lives",
    noteType: "ppe",
    priority: "medium",
  },
  "initial-recognition": {
    title: "Leases — Right-of-Use Assets and Liabilities",
    noteType: "leases",
    priority: "high",
  },
  "lease-liability-measurement": {
    title: "Lease Liability Measurement",
    noteType: "leases",
    priority: "high",
  },
  "rou-asset-measurement": {
    title: "Right-of-Use Asset Measurement",
    noteType: "leases",
    priority: "high",
  },
  classification: {
    title: "Statement of Cash Flows — Classification",
    noteType: "cash_flow",
    priority: "medium",
  },
  "operating-method": {
    title: "Cash Flows from Operating Activities",
    noteType: "cash_flow",
    priority: "medium",
  },
  "complete-set": {
    title: "Basis of Preparation",
    noteType: "accounting_policies",
    priority: "high",
  },
};

export function buildDisclosureTriggersFromEvaluations(
  evaluations: IfrsRuleEvaluation[],
): DisclosureTrigger[] {
  const triggers: DisclosureTrigger[] = [];
  const seen = new Set<string>();

  for (const ev of evaluations) {
    if (ev.status !== "fail" && ev.status !== "warning") continue;
    const map = TOPIC_DISCLOSURE_MAP[ev.topic];
    if (!map) continue;
    const key = `${map.noteType}|${ev.standardCode}`;
    if (seen.has(key)) continue;
    seen.add(key);

    triggers.push({
      suggestedTitle: map.title,
      suggestedNoteType: map.noteType,
      ruleId: ev.ruleId,
      standardCode: ev.standardCode,
      reasonAr: ev.messageAr,
      reasonEn: ev.messageEn,
      priority: map.priority,
    });
  }

  return triggers;
}
