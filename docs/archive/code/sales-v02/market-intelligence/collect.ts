// @ts-nocheck
import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";
import {
  isClosedOpportunityStage,
  canonicalizeOpportunityStage,
} from "../../types";
import type { MarketSignal, MarketSignalSource } from "./types";

export interface CollectMarketSignalsInput {
  organizationId: string;
  storedSignals?: SalesSignal[];
  interactions?: SalesInteractionLog[];
  opportunities?: SalesOpportunity[];
  winLossInsights?: SalesWinLossInsight[];
  competitorMentions?: SalesCompetitorMention[];
}

const INTERACTION_KEYWORD_RULES: ReadonlyArray<{
  keys: string[];
  label: string;
  labelAr: string;
}> = [
  {
    keys: ["renewal", "renew"],
    label: "Renewal intent detected",
    labelAr: "نية تجديد مكتشفة",
  },
  {
    keys: ["rfp", "proposal", "procurement"],
    label: "Active buying motion",
    labelAr: "حركة شراء نشطة",
  },
  {
    keys: ["budget freeze", "budget approved", "budget"],
    label: "Budget signal",
    labelAr: "إشارة ميزانية",
  },
  {
    keys: ["governance", "security", "compliance", "data residency"],
    label: "Regulatory review signal",
    labelAr: "إشارة مراجعة تنظيمية",
  },
  {
    keys: ["executive sponsor", "sponsor", "cfo", "vp"],
    label: "Executive engagement",
    labelAr: "مشاركة تنفيذية",
  },
  {
    keys: ["competitor", "competitive", "incumbent"],
    label: "Competitive mention",
    labelAr: "ذكر منافس",
  },
  {
    keys: ["expansion", "upsell", "cross-sell"],
    label: "Expansion opportunity",
    labelAr: "فرصة توسع",
  },
  {
    keys: ["pilot", "poc", "proof of concept"],
    label: "Pilot momentum",
    labelAr: "زخم تجريبي",
  },
];

const STRENGTH_SCORE: Record<SalesSignal["strength"], number> = {
  weak: 35,
  moderate: 55,
  strong: 75,
};

function matchKeywords(text: string, keys: string[]): boolean {
  const lower = text.toLowerCase();
  return keys.some((key) => lower.includes(key));
}

function pushSignal(
  bucket: MarketSignal[],
  organizationId: string,
  partial: Omit<MarketSignal, "organizationId" | "score" | "outputStatus"> & {
    score?: number;
  },
): void {
  bucket.push({
    organizationId,
    score: partial.score ?? 50,
    outputStatus: "recommendation",
    ...partial,
  });
}

/** Collect raw market signals from store entities and interaction text. */
export function collectMarketSignals(
  input: CollectMarketSignalsInput,
): MarketSignal[] {
  const signals: MarketSignal[] = [];
  const { organizationId } = input;

  for (const stored of input.storedSignals ?? []) {
    pushSignal(signals, organizationId, {
      id: `mi-collect-stored-${stored.id}`,
      label: stored.description,
      labelAr: stored.description,
      category: "buying",
      source: "stored",
      accountId: stored.accountId,
      opportunityId: stored.opportunityId,
      evidenceRef: stored.evidenceRef,
      rawText: stored.description,
      score: STRENGTH_SCORE[stored.strength],
    });
  }

  for (const interaction of input.interactions ?? []) {
    for (const rule of INTERACTION_KEYWORD_RULES) {
      if (!matchKeywords(interaction.summary, rule.keys)) continue;
      pushSignal(signals, organizationId, {
        id: `mi-collect-int-${interaction.id}-${rule.label}`,
        label: rule.label,
        labelAr: rule.labelAr,
        category: "buying",
        source: "interaction",
        accountId: interaction.accountId,
        opportunityId: interaction.opportunityId,
        evidenceRef: interaction.evidenceRef,
        rawText: interaction.summary,
        score: 45,
      });
      break;
    }
  }

  for (const opp of input.opportunities ?? []) {
    if (isClosedOpportunityStage(opp.stage)) continue;
    if ((opp.valueEstimate ?? 0) >= 250_000) {
      pushSignal(signals, organizationId, {
        id: `mi-collect-opp-value-${opp.id}`,
        label: `High-value pipeline: ${opp.name}`,
        labelAr: `خط أنابيب عالي القيمة: ${opp.name}`,
        category: "expansion",
        source: "opportunity",
        accountId: opp.accountId,
        opportunityId: opp.id,
        rawText: opp.name,
        score: 60,
      });
    }
    const stage = canonicalizeOpportunityStage(opp.stage);
    if (stage === "proposal" || stage === "negotiation") {
      pushSignal(signals, organizationId, {
        id: `mi-collect-opp-stage-${opp.id}`,
        label: `Late-stage motion: ${opp.stage}`,
        labelAr: `حركة متأخرة: ${opp.stage}`,
        category: "buying",
        source: "opportunity",
        accountId: opp.accountId,
        opportunityId: opp.id,
        rawText: `${opp.name} — ${opp.stage}`,
        score: 65,
      });
    }
  }

  for (const wl of input.winLossInsights ?? []) {
    pushSignal(signals, organizationId, {
      id: `mi-collect-wl-${wl.id}`,
      label: `${wl.outcome} pattern: ${wl.primaryReason}`,
      labelAr: `نمط ${wl.outcome}: ${wl.primaryReason}`,
      category: wl.outcome === "lost" ? "risk" : "expansion",
      source: "win_loss",
      accountId: wl.accountId,
      opportunityId: wl.opportunityId,
      evidenceRef: wl.evidenceRef,
      rawText: wl.primaryReason,
      score: wl.outcome === "won" ? 70 : 55,
    });
  }

  for (const mention of input.competitorMentions ?? []) {
    pushSignal(signals, organizationId, {
      id: `mi-collect-comp-${mention.id}`,
      label: `Competitor: ${mention.competitorName}`,
      labelAr: `منافس: ${mention.competitorName}`,
      category: "risk",
      source: "stored",
      accountId: mention.accountId,
      opportunityId: mention.opportunityId,
      evidenceRef: mention.evidenceRef,
      rawText: mention.context,
      score:
        mention.threatLevel === "high"
          ? 80
          : mention.threatLevel === "medium"
            ? 60
            : 40,
    });
  }

  return signals;
}

export function dedupeCollectedSignals(
  signals: MarketSignal[],
): MarketSignal[] {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.source}:${signal.label}:${signal.accountId ?? ""}:${signal.opportunityId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type { MarketSignalSource };
