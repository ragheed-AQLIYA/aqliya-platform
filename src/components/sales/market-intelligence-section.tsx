import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { MarketIntelligenceSnapshot } from "@/lib/sales/v02/market-intelligence";

function severityStatus(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "blocked";
  if (severity === "medium") return "pending";
  return "draft";
}

function scoreToSeverity(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function MarketIntelligenceSection({
  snapshot,
}: {
  snapshot: MarketIntelligenceSnapshot;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">ذكاء السوق (v0.2)</h2>
        <p className="text-xs text-muted-foreground">
          إشارات صناعة، منافسة، وماكرو — {snapshot.industrySignals.length} إشارة مجمّعة
        </p>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
          {snapshot.disclaimerAr}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">درجة السوق الإجمالية</p>
            <p className="text-2xl font-bold">{snapshot.overallScore}/100</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">أقوى قطاع</p>
            <p className="text-sm font-semibold">
              {snapshot.industrySignals[0]?.labelAr ?? "—"}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">أبرز منافس</p>
            <p className="text-sm font-semibold">
              {snapshot.competitorSignals[0]?.competitorName ?? "—"}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>إشارات القطاعات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {snapshot.industrySignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا إشارات قطاع</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.industrySignals.slice(0, 5).map((s) => (
                  <li key={s.id} className="rounded border px-2 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{s.labelAr}</span>
                      <StatusBadge status={severityStatus(scoreToSeverity(s.score))} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.accountCount} حساب · مسار {s.pipelineValue.toLocaleString("ar-SA")} ·{" "}
                      {s.score}/100
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>مشهد المنافسة</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {snapshot.competitorSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا إشارات منافسة</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.competitorSignals.slice(0, 5).map((s) => (
                  <li key={s.id} className="rounded border px-2 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{s.competitorName}</span>
                      <StatusBadge status={severityStatus(s.threatLevel)} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.mentionCount} إشارة · تهديد {s.threatLevel} · {s.score}/100
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>رؤى السوق (مسودة)</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {snapshot.insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا رؤى بعد</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {snapshot.insights.slice(0, 6).map((insight) => (
                <li key={insight.id} className="rounded border px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{insight.titleAr}</span>
                    <StatusBadge status={severityStatus(scoreToSeverity(insight.score))} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {insight.score}/100 · ثقة {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{insight.summaryAr}</p>
                  <p className="text-xs mt-1">{insight.summaryAr}</p>
                  <p className="text-[10px] text-amber-800 dark:text-amber-200 mt-1">
                    {insight.insightType} · {insight.outputStatus}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
