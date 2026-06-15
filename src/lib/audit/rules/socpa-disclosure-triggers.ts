import type { SocpaDisclosureTrigger, SocpaRuleEvaluation } from "./types";

const TOPIC_MAP: Record<
  string,
  { title: string; noteType: string; priority: SocpaDisclosureTrigger["priority"] }
> = {
  "zakat-presentation": {
    title: "Zakat Obligations",
    noteType: "zakat",
    priority: "high",
  },
  "separate-disclosure": {
    title: "Income Tax and Zakat — Separate Disclosure",
    noteType: "zakat",
    priority: "high",
  },
  reconciliation: {
    title: "Zakat and Tax Reconciliation",
    noteType: "zakat",
    priority: "high",
  },
  "ias12-overlay": {
    title: "Deferred Tax and Zakat Bases",
    noteType: "tax",
    priority: "medium",
  },
  "supplementary-disclosure": {
    title: "SOCPA Supplementary Disclosures",
    noteType: "accounting_policies",
    priority: "medium",
  },
  "framework-disclosure": {
    title: "Basis of Preparation — SOCPA",
    noteType: "accounting_policies",
    priority: "high",
  },
  "full-ifrs": {
    title: "IFRS Adoption in Saudi Arabia",
    noteType: "accounting_policies",
    priority: "medium",
  },
};

export function buildSocpaDisclosureTriggersFromEvaluations(
  evaluations: SocpaRuleEvaluation[],
): SocpaDisclosureTrigger[] {
  const triggers: SocpaDisclosureTrigger[] = [];
  const seen = new Set<string>();

  for (const ev of evaluations) {
    if (ev.status !== "fail" && ev.status !== "warning") continue;
    const map = TOPIC_MAP[ev.topic];
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
