export const OBJECTION_RULES: Array<{ key: string; keywords: string[] }> = [
  { key: "budget", keywords: ["budget", "roi", "cost", "pricing", "freeze", "frozen"] },
  { key: "timing", keywords: ["timing", "delayed", "procurement", "cycle", "q3", "postpone"] },
  {
    key: "security",
    keywords: ["security", "residency", "compliance", "governance", "questionnaire"],
  },
  { key: "approval", keywords: ["approver", "cfo", "sign-off", "signoff", "approval"] },
  { key: "competitor", keywords: ["competitive", "incumbent", "rfp", "legacy grc"] },
];

export const SIGNAL_RULES: Array<{ key: string; keywords: string[]; strength: "moderate" | "strong" }> =
  [
    { key: "renewal_intent", keywords: ["renewal", "renew"], strength: "strong" },
    { key: "executive_sponsor", keywords: ["executive sponsor", "sponsor intro"], strength: "strong" },
    { key: "pilot_progress", keywords: ["pilot kickoff", "pilot checkpoint", "success criteria"], strength: "strong" },
    { key: "contract_momentum", keywords: ["contract redlines", "commercial review"], strength: "moderate" },
    { key: "evidence_engagement", keywords: ["evidence pack", "qualification template"], strength: "moderate" },
  ];

export const COMPETITOR_NAMES = [
  "SAP",
  "Oracle",
  "Salesforce",
  "Microsoft",
  "Legacy GRC Suite",
  "Spreadsheet workflow",
];

export const DECISION_CRITERIA_RULES: Array<{ key: string; keywords: string[] }> = [
  { key: "governance", keywords: ["governance requirements", "governance"] },
  { key: "security_review", keywords: ["security questionnaire", "security review"] },
  { key: "success_criteria", keywords: ["success criteria", "pilot success"] },
  { key: "qualification", keywords: ["qualification template", "qualification"] },
  { key: "approver_chain", keywords: ["approver identified", "cfo", "stakeholders identified"] },
];

export function normalizeText(text: string): string {
  return text.toLowerCase();
}

export function matchKeywords(text: string, keywords: string[]): boolean {
  const lower = normalizeText(text);
  return keywords.some((k) => lower.includes(k));
}

export function bumpCount(map: Map<string, number>, key: string, delta = 1): void {
  map.set(key, (map.get(key) ?? 0) + delta);
}
