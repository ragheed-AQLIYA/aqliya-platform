import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { ICPLearningInsightRow } from "@/lib/sales/vnext/icp-learning";
import { ICP_RECOMMENDATION_LABEL } from "@/lib/sales/vnext/icp-learning";

interface ICPLearningViewProps {
  snapshot: ICPLearningSnapshot;
}

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
      ثقة {Math.round(value * 100)}%
    </span>
  );
}

function InsightLabelBadge() {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {ICP_RECOMMENDATION_LABEL}
    </span>
  );
}

function InsightSection({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: ICPLearningInsightRow[];
  emptyMessage: string;
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>{title}</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-border/60 p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.labelAr}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <InsightLabelBadge />
                    <ConfidenceBadge value={row.confidence} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{row.recommendationAr}</p>
                {row.evidence.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      الأدلة
                    </p>
                    <ul className="list-inside list-disc text-xs text-muted-foreground">
                      {row.evidence.map((e) => (
                        <li key={`${row.id}-${e.textAr}`}>{e.textAr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function ICPLearningView({ snapshot }: ICPLearningViewProps) {
  const hypothesis = snapshot.currentHypothesis;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">تعلّم ICP</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          فرضيات وتوصيات مبنية على الأدلة — ليست ICP معتمداً نهائياً
        </p>
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          {snapshot.disclaimerAr}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <InsightLabelBadge />
          <ConfidenceBadge value={snapshot.overallConfidence} />
          <span className="text-xs text-muted-foreground">
            درجة ثقة إجمالية (مساعدة)
          </span>
        </div>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span>فرضية ICP الحالية</span>
            <ConfidenceBadge value={hypothesis.confidence} />
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <InsightLabelBadge />
          </div>
          <p className="text-sm">{hypothesis.labelAr}</p>
          <p className="text-xs text-amber-800 dark:text-amber-200">
            {hypothesis.recommendationAr}
          </p>
          {hypothesis.evidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                الأدلة
              </p>
              <ul className="list-inside list-disc text-sm">
                {hypothesis.evidence.map((e) => (
                  <li key={`hyp-${e.textAr}`}>{e.textAr}</li>
                ))}
              </ul>
            </div>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>توزيع الملاءمة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2">
            {snapshot.icpFit.map((f) => (
              <li key={f.labelAr} className="flex items-center gap-2 text-sm">
                <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
                <span className="w-28">{f.labelAr}</span>
                <span className="text-muted-foreground">{f.pct}%</span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightSection
          title="أفضل القطاعات"
          rows={snapshot.bestIndustries}
          emptyMessage="لا أدلة كافية للقطاعات بعد"
        />
        <InsightSection
          title="أنواع الحسابات"
          rows={snapshot.accountTypes}
          emptyMessage="لا أنماط حسابات مستنتجة بعد"
        />
        <InsightSection
          title="المسميات الوظيفية"
          rows={snapshot.titles}
          emptyMessage="لا مسميات مستهدفة مستنتجة بعد"
        />
        <InsightSection
          title="نقاط الألم"
          rows={snapshot.painPoints}
          emptyMessage="لا نقاط ألم مستخرجة بعد"
        />
      </div>

      <InsightSection
        title="أنماط الفوز / الخسارة"
        rows={snapshot.winLossPatterns}
        emptyMessage="لا أنماط فوز/خسارة بعد"
      />

      {snapshot.storedInsights.length > 0 && (
        <InsightSection
          title="رؤى ICP مخزّنة (من الذاكرة)"
          rows={snapshot.storedInsights}
          emptyMessage=""
        />
      )}
    </div>
  );
}
