import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { OpportunityIntelligenceSummary } from "@/lib/sales/vnext/opportunity-intelligence";
import type { MeetingIntelligenceSummary } from "@/lib/sales/vnext/meeting-intelligence";
import type { OpportunityScoreResult } from "@/lib/sales/intelligence/opportunity-scoring";
import type {
  RankedMemoryItem,
  WinLossPattern,
} from "@/lib/sales/vnext/commercial-memory";
import type { SalesObjection } from "@/lib/sales/types";
import { Badge } from "@/components/ui/badge";

export function OpportunityIntelligencePanel({
  intelligence,
  meetingSummary,
  scoring,
  risks = [],
  decisionCriteria = [],
  objections = [],
  winLossPatterns = [],
}: {
  intelligence: OpportunityIntelligenceSummary;
  meetingSummary: MeetingIntelligenceSummary;
  scoring?: OpportunityScoreResult;
  risks?: string[];
  decisionCriteria?: RankedMemoryItem[];
  objections?: SalesObjection[];
  winLossPatterns?: WinLossPattern[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2" dir="rtl">
      <p className="md:col-span-2 text-xs text-muted-foreground">
        ذكاء فرصة مسودة — DRAFT — ليس قراراً تجارياً نهائياً.
      </p>
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>ذكاء الفرصة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="space-y-2 text-sm">
          <p>
            احتمال الفوز: <strong>{intelligence.winProbability}%</strong>
          </p>
          <p>{intelligence.intelligenceLabelAr}</p>
          {intelligence.reviewRequired && (
            <p className="text-amber-700 dark:text-amber-400">
              مراجعة بشرية مطلوبة قبل ادعاءات حساسة
            </p>
          )}
          {intelligence.qualificationGap.length > 0 && (
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {intelligence.qualificationGap.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          {scoring ? (
            <div className="mt-2 space-y-1 border-t pt-2">
              <p>
                درجة الفرصة: <strong>{scoring.score}</strong> (ثقة{" "}
                {Math.round(scoring.confidence * 100)}%)
              </p>
              {scoring.blockers.map((b) => (
                <Badge key={b} variant="outline" className="me-1 text-[10px]">
                  {b}
                </Badge>
              ))}
            </div>
          ) : null}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>مخاطر ومعايير قرار</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="space-y-3 text-sm">
          {risks.length === 0 ? (
            <p className="text-muted-foreground">لا مؤشرات مخاطر إضافية</p>
          ) : (
            <ul className="space-y-1">
              {risks.map((r) => (
                <li key={r}>
                  <Badge variant="destructive" className="me-1 text-[10px]">
                    {r}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {decisionCriteria.length > 0 && (
            <div className="border-t pt-2">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                معايير قرار (ذاكرة تجارية)
              </p>
              <ul className="list-inside list-disc text-xs">
                {decisionCriteria.slice(0, 5).map((c) => (
                  <li key={c.label}>
                    {c.label} ({c.count})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>اعتراضات الفرصة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="text-sm">
          {objections.length === 0 ? (
            <p className="text-muted-foreground">لا اعتراضات مرتبطة</p>
          ) : (
            <ul className="space-y-1">
              {objections.map((o) => (
                <li key={o.id} className="rounded border px-2 py-1">
                  {o.labelAr ?? o.category} —{" "}
                  {o.resolved ? "محلول" : "مفتوح"}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>اجتماعات وتفاعلات</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="text-sm">
          <p>إجمالي: {meetingSummary.totalMeetings}</p>
          <p>متابعات معلقة: {meetingSummary.pendingFollowUps}</p>
          <p>أدلة مرتبطة: {meetingSummary.evidenceLinkedPct}%</p>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {winLossPatterns.length > 0 && (
        <EnterpriseCard module="sales" className="md:col-span-2">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>أنماط فوز / خسارة (مؤسسة)</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="flex flex-wrap gap-2 text-xs">
              {winLossPatterns.slice(0, 6).map((w) => (
                <li key={`${w.reason}-${w.outcome}`}>
                  <Badge variant="outline">
                    {w.outcome === "won" ? "فوز" : "خسارة"}: {w.reason} (
                    {w.count})
                  </Badge>
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </div>
  );
}
