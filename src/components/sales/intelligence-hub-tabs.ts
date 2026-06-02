export const INTELLIGENCE_HUB_TABS = [
  "market",
  "proof",
  "memory",
  "graph",
] as const;

export type IntelligenceHubTabId = (typeof INTELLIGENCE_HUB_TABS)[number];

export const INTELLIGENCE_HUB_TAB_LABELS: Record<IntelligenceHubTabId, string> =
  {
    market: "السوق",
    proof: "الإثبات",
    memory: "الذاكرة",
    graph: "الرسم",
  };

export function parseIntelligenceHubTab(hash: string): IntelligenceHubTabId {
  const raw = hash.replace(/^#/, "").trim().toLowerCase();
  if (raw === "proof" || raw === "proof-network") return "proof";
  if (raw === "knowledge-graph" || raw === "graph") return "graph";
  if (INTELLIGENCE_HUB_TABS.includes(raw as IntelligenceHubTabId)) {
    return raw as IntelligenceHubTabId;
  }
  return "market";
}

export function intelligenceHubTabHasData(
  tab: IntelligenceHubTabId,
  evidenceMapKeyCount: number,
  graphNodeCount: number,
): boolean {
  if (tab === "memory") return evidenceMapKeyCount > 0;
  if (tab === "graph") return graphNodeCount > 0;
  return true;
}
