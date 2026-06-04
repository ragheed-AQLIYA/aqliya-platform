import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";

function ScoreBadge({ value }: { value: number }) {
  return (
    <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
      {value}/100
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
      ثقة {Math.round(value * 100)}%
    </span>
  );
}

function RecommendationBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {label}
    </span>
  );
}

function EvidenceList({
  entityId,
  evidenceMap,
}: {
  entityId: string;
  evidenceMap: WaveBMarketIntelligenceView["evidenceMap"];
}) {
  const items = evidenceMap[entityId] ?? [];
  if (items.length === 0) {
    return <p className="text-[10px] text-muted-foreground">لا أدلة مسجلة</p>;
  }
  return (
    <ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
      {items.slice(0, 3).map((item) => (
        <li key={`${entityId}-${item}`} className="truncate">
          · {item}
        </li>
      ))}
    </ul>
  );
}

export function MarketIntelligenceView({ data }: { data: WaveBMarketIntelligenceView }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">ذكاء السوق</h2>
          <p className="text-xs text-muted-foreground">{data.disclaimerAr}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RecommendationBadge label={data.recommendationLabel} />
          <ConfidenceBadge value={data.aggregateConfidence} />
          <ScoreBadge value={data.overallScore} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>أبرز إشارات السوق</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {data.topMarketSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا إشارات</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topMarketSignals.map((signal) => (
                  <li
                    key={signal.id}
                    className="rounded border px-2 py-1 space-y-0.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>{signal.labelAr}</span>
                      <span className="text-xs text-muted-foreground">
                        {signal.category} · {signal.score}
                      </span>
                    </div>
                    <EvidenceList entityId={signal.id} evidenceMap={data.evidenceMap} />
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>زخم القطاعات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {data.topIndustrySignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا بيانات قطاعية</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topIndustrySignals.map((industry) => (
                  <li
                    key={industry.id}
                    className="rounded border px-2 py-1 space-y-0.5"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{industry.labelAr}</span>
                      <ScoreBadge value={industry.score} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {industry.accountCount} حساب · {industry.activeOpportunityCount}{" "}
                      فرص · {industry.winCount}W/{industry.lossCount}L
                    </p>
                    <EvidenceList entityId={industry.id} evidenceMap={data.evidenceMap} />
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>إشارات المنافسين</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {data.topCompetitorSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا منافسين</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topCompetitorSignals.map((competitor) => (
                  <li
                    key={competitor.id}
                    className="rounded border px-2 py-1 space-y-0.5"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{competitor.competitorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {competitor.mentionCount} · {competitor.threatLevel}
                      </span>
                    </div>
                    <EvidenceList entityId={competitor.id} evidenceMap={data.evidenceMap} />
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>رؤى السوق</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {data.insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا رؤى بعد</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {data.insights.map((insight) => (
                  <li
                    key={insight.id}
                    className="rounded-lg border border-border/60 p-3 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{insight.titleAr}</p>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge value={insight.confidence} />
                        <ScoreBadge value={insight.score} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.summaryAr}</p>
                    <EvidenceList entityId={insight.id} evidenceMap={data.evidenceMap} />
                    <p className="text-[10px] text-muted-foreground">{insight.insightType}</p>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </div>
  );
}
