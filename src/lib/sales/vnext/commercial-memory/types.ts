export interface CommercialMemoryPattern {
  id: string;
  patternType:
    | "recurring_objection"
    | "strong_signal"
    | "competitor_presence"
    | "loss_theme"
    | "decision_criteria";
  label: string;
  count: number;
  recommendation: string;
  confidence: number;
}

export interface RankedMemoryItem {
  id: string;
  label: string;
  count: number;
  source: "stored" | "interaction" | "opportunity";
  category?: string;
}

export interface CompetitorMemoryItem {
  id: string;
  name: string;
  count: number;
  context: string;
  source: "stored" | "interaction";
  accountId?: string;
  opportunityId?: string;
  threatLevel?: "low" | "medium" | "high";
}

export interface WinLossPattern {
  id: string;
  outcome: "won" | "lost";
  reason: string;
  count: number;
  contributingFactors: string[];
  source: "stored" | "opportunity" | "interaction";
}

export interface CommercialMemorySnapshot {
  organizationId: string;
  objectionCount: number;
  signalCount: number;
  competitorCount: number;
  winLossCount: number;
  decisionCriteriaCount: number;
  patterns: CommercialMemoryPattern[];
  topObjections: RankedMemoryItem[];
  topSignals: RankedMemoryItem[];
  competitors: CompetitorMemoryItem[];
  winLossPatterns: WinLossPattern[];
  decisionCriteria: RankedMemoryItem[];
}
