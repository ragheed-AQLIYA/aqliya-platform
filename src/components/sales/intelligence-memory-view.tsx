import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type {
  SalesObjectionSignal,
  SalesCompetitorMentionView,
  SalesOpportunity,
} from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import type { SalesAuditEntry } from "@/lib/sales/store";
import type { OpportunityIntelligenceSummary } from "@/lib/sales/vnext/opportunity-intelligence";

interface IntelligenceMemoryViewProps {
  objections: SalesObjectionSignal[];
  competitors: SalesCompetitorMentionView[];
  signals: IntelligenceSignal[];
  auditRecent: SalesAuditEntry[];
  interactionCount: number;
  opportunityInsights: {
    opportunity: SalesOpportunity;
    intelligence: OpportunityIntelligenceSummary;
  }[];
}

export function IntelligenceMemoryView({
  objections,
  competitors,
  signals,
  auditRecent,
  interactionCount,
  opportunityInsights,
}: IntelligenceMemoryViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الذاكرة التجارية</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اعتراضات، منافسون، إشارات، وسجل تدقيق — {interactionCount} تفاعل
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>الاعتراضات المستخرجة</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {objections.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا اعتراضات</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {objections.map((o) => (
                  <li key={o.id} className="flex justify-between rounded border px-2 py-1">
                    <span>{o.labelAr}</span>
                    <span className="text-muted-foreground">{o.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>المنافسون</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
              {competitors.map((c) => (
                <li key={c.id} className="rounded border px-2 py-1">
                  <span className="font-medium">{c.name}</span>
                  <p className="text-xs text-muted-foreground">{c.contextAr}</p>
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>إشارات عبر الحسابات</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {signals.map((s) => (
              <li key={s.id} className="rounded border px-2 py-1">
                {s.label} — {s.value}% · {s.level}
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>ذكاء الفرص</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {opportunityInsights.map(({ opportunity, intelligence }) => (
              <li key={opportunity.id} className="rounded border px-2 py-1">
                <Link
                  href={`/sales/opportunities/${opportunity.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {opportunity.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {intelligence.intelligenceLabelAr} — {intelligence.winProbability}%
                  {intelligence.reviewRequired && " · مراجعة مطلوبة"}
                </p>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>سجل التدقيق الأخير</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {auditRecent.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا سجلات</p>
          ) : (
            <ul className="space-y-1 text-xs font-mono">
              {auditRecent.map((a) => (
                <li key={a.id}>
                  {a.timestamp.slice(0, 16)} · {a.action} · {a.targetId.slice(0, 12)}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
