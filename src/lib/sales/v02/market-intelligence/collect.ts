import type {
  SalesAccount,
  SalesCompetitorMention,
  SalesICPInsight,
  SalesInteractionLog,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";
import { isClosedOpportunityStage } from "../../types";
import type { MarketSignal, MarketSignalSource } from "./types";

const NOW = () => new Date().toISOString();

const INTERACTION_RULES: Array<{
  keys: string[];
  category: MarketSignal["category"];
  label: string;
  labelAr: string;
}> = [
  {
    keys: ["rfp", "procurement", "tender"],
    category: "macro",
    label: "Procurement / RFP activity",
    labelAr: "نشاط مشتريات / RFP",
  },
  {
    keys: ["budget freeze", "budget_freeze", "frozen budget"],
    category: "macro",
    label: "Budget freeze signal",
    labelAr: "إشارة تجميد ميزانية",
  },
  {
    keys: ["renewal", "renew"],
    category: "buying",
    label: "Renewal momentum",
    labelAr: "زخم تجديد",
  },
  {
    keys: ["regulation", "compliance", "governance review"],
    category: "regulatory",
    label: "Regulatory / governance review",
    labelAr: "مراجعة تنظيمية / حوكمة",
  },
  {
    keys: ["pilot", "proof of concept"],
    category: "buying",
    label: "Pilot / POC motion",
    labelAr: "حركة pilot / POC",
  },
  {
    keys: ["executive sponsor", "cfo", "ceo"],
    category: "buying",
    label: "Executive engagement",
    labelAr: "مشاركة تنفيذية",
  },
];

function isWon(stage: SalesOpportunity["stage"]): boolean {
  return stage === "ClosedWon" || stage === "Closed Won";
}

function baseSignal(
  partial: Omit<MarketSignal, "collectedAt">,
  source: MarketSignalSource,
): MarketSignal {
  return { ...partial, source, collectedAt: NOW() };
}

export function collectMarketSignals(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  signals: SalesSignal[];
  competitorMentions: SalesCompetitorMention[];
  icpInsights: SalesICPInsight[];
  winLossInsights: SalesWinLossInsight[];
}): MarketSignal[] {
  const collected: MarketSignal[] = [];
  const accountById = new Map(input.accounts.map((a) => [a.id, a]));

  for (const signal of input.signals) {
    const category =
      signal.signalType === "timing"
        ? "timing"
        : signal.signalType === "buying" || signal.signalType === "budget"
          ? "buying"
          : "macro";
    collected.push(
      baseSignal(
        {
          id: `mi-collect-sig-${signal.id}`,
          category,
          label: signal.signalType,
          labelAr:
            category === "timing"
              ? "توقيت"
              : category === "buying"
                ? "إشارة شراء"
                : "إشارة سوق",
          description: signal.description,
          descriptionAr: signal.description,
          sourceRef: signal.id,
          accountId: signal.accountId,
          opportunityId: signal.opportunityId,
          industry: signal.accountId
            ? accountById.get(signal.accountId)?.industry
            : undefined,
        },
        "stored_signal",
      ),
    );
  }

  for (const mention of input.competitorMentions) {
    collected.push(
      baseSignal(
        {
          id: `mi-collect-comp-${mention.id}`,
          category: "competitor",
          label: mention.competitorName,
          labelAr: mention.competitorName,
          description: mention.context,
          descriptionAr: mention.context,
          sourceRef: mention.id,
          accountId: mention.accountId,
          opportunityId: mention.opportunityId,
        },
        "stored_competitor",
      ),
    );
  }

  for (const insight of input.icpInsights) {
    if (insight.dimension !== "industry" && insight.dimension !== "region") {
      continue;
    }
    collected.push(
      baseSignal(
        {
          id: `mi-collect-icp-${insight.id}`,
          category: insight.dimension === "region" ? "regulatory" : "industry",
          label: insight.hypothesis.slice(0, 80),
          labelAr: insight.hypothesis.slice(0, 80),
          description: insight.evidenceSummary,
          descriptionAr: insight.evidenceSummary,
          sourceRef: insight.id,
          accountId: insight.accountId,
        },
        "icp_insight",
      ),
    );
  }

  for (const wl of input.winLossInsights) {
    collected.push(
      baseSignal(
        {
          id: `mi-collect-wl-${wl.id}`,
          category: wl.competitorInvolved ? "competitor" : "macro",
          label: wl.primaryReason,
          labelAr: wl.primaryReason,
          description: (wl.contributingFactors ?? []).join(", ") || wl.outcome,
          descriptionAr: (wl.contributingFactors ?? []).join(", ") || wl.outcome,
          sourceRef: wl.id,
          accountId: wl.accountId,
          opportunityId: wl.opportunityId,
        },
        "win_loss",
      ),
    );
  }

  for (const interaction of input.interactions) {
    const lower = interaction.summary.toLowerCase();
    for (const rule of INTERACTION_RULES) {
      if (rule.keys.some((k) => lower.includes(k))) {
        collected.push(
          baseSignal(
            {
              id: `mi-collect-int-${interaction.id}-${rule.label}`,
              category: rule.category,
              label: rule.label,
              labelAr: rule.labelAr,
              description: interaction.summary.slice(0, 120),
              descriptionAr: interaction.summary.slice(0, 120),
              sourceRef: interaction.id,
              accountId: interaction.accountId,
              opportunityId: interaction.opportunityId,
              industry: accountById.get(interaction.accountId)?.industry,
            },
            "interaction",
          ),
        );
      }
    }
  }

  const industryBuckets = new Map<
    string,
    { accounts: SalesAccount[]; pipeline: number; wins: number }
  >();
  for (const account of input.accounts) {
    const industry = account.industry ?? "Unknown";
    const bucket = industryBuckets.get(industry) ?? {
      accounts: [],
      pipeline: 0,
      wins: 0,
    };
    bucket.accounts.push(account);
    industryBuckets.set(industry, bucket);
  }
  for (const opp of input.opportunities) {
    const industry = accountById.get(opp.accountId)?.industry ?? "Unknown";
    const bucket = industryBuckets.get(industry);
    if (!bucket) continue;
    if (!isClosedOpportunityStage(opp.stage)) {
      bucket.pipeline += opp.valueEstimate ?? 0;
    }
    if (isWon(opp.stage)) {
      bucket.wins += 1;
    }
  }
  for (const [industry, bucket] of industryBuckets) {
    if (bucket.accounts.length === 0) continue;
    collected.push(
      baseSignal(
        {
          id: `mi-collect-ind-${industry.replace(/\s+/g, "-").toLowerCase()}`,
          category: "industry",
          label: industry,
          labelAr: industry,
          description: `${bucket.accounts.length} accounts · pipeline ${bucket.pipeline}`,
          descriptionAr: `${bucket.accounts.length} حساب · مسار ${bucket.pipeline}`,
          industry,
        },
        "account_industry",
      ),
    );
  }

  for (const opp of input.opportunities) {
    if (isClosedOpportunityStage(opp.stage)) continue;
    if ((opp.valueEstimate ?? 0) < 100_000) continue;
    const industry = accountById.get(opp.accountId)?.industry;
    collected.push(
      baseSignal(
        {
          id: `mi-collect-opp-${opp.id}`,
          category: "macro",
          label: `Active pipeline: ${opp.name}`,
          labelAr: `مسار نشط: ${opp.name}`,
          description: `${opp.stage} · ${opp.valueEstimate ?? 0}`,
          descriptionAr: `${opp.stage} · ${opp.valueEstimate ?? 0}`,
          sourceRef: opp.id,
          accountId: opp.accountId,
          opportunityId: opp.id,
          industry,
        },
        "opportunity",
      ),
    );
  }

  return collected;
}
