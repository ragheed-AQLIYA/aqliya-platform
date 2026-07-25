import { getDashboardMetrics } from "@/actions/decisions";
import { KPICard } from "@/components/enterprise/kpi-card";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/enterprise/section-header";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getOutcomeStatusLabel } from "@/lib/decision/outcome-dashboard";
import type { OutcomeCorrelationRow } from "@/lib/decision/outcome-correlation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function OutcomeBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex-1 rounded-full bg-muted h-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-10 text-right font-medium">{pct}%</span>
    </div>
  );
}

export default async function OutcomesPage() {
  const result = await getDashboardMetrics();

  if (!result.success || !("data" in result) || !result.data) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-h2 font-black text-foreground">تحليل نتائج القرارات</h1>
        <p className="text-muted-foreground">تعذر تحميل بيانات النتائج.</p>
      </div>
    );
  }

  const { outcomeMetrics, outcomeCorrelation } = result.data;
  const totalOutcomes = outcomeMetrics.totalOutcomes;
  const byStatus = outcomeMetrics.byStatus as Record<string, number>;
  const successCount = byStatus.SUCCESS ?? 0;
  const failureCount = byStatus.FAILURE ?? 0;
  const partialCount = byStatus.PARTIAL_SUCCESS ?? 0;
  const unknownCount = byStatus.UNKNOWN ?? 0;
  const successRate = totalOutcomes > 0 ? Math.round((successCount / totalOutcomes) * 100) : 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black text-foreground">تحليل نتائج القرارات</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          ارتباط القرارات بالنتائج — إحصائيات وأداء حسب النوع والأولوية
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="إجمالي النتائج"
          value={totalOutcomes}
          icon={TrendingUp}
          module="decision"
        />
        <KPICard
          label="معدل النجاح"
          value={`${successRate}%`}
          changeType={successRate >= 60 ? "positive" : "negative"}
          icon={CheckCircle2}
          module="decision"
        />
        <KPICard
          label="بانتظار المراجعة"
          value={outcomeMetrics.missingReview}
          changeType="neutral"
          icon={Clock}
          module="decision"
        />
        <KPICard
          label="معتمدة بدون نتيجة"
          value={outcomeMetrics.approvedMissingOutcome}
          changeType={outcomeMetrics.approvedMissingOutcome > 0 ? "negative" : "positive"}
          icon={MinusCircle}
          module="decision"
        />
      </div>

      {/* Outcome Distribution */}
      <SectionHeader
        eyebrow="التوزيع"
        title="توزيع نتائج القرارات"
        description="حسب حالة النتيجة"
        module="decision"
      />

      <EnterpriseCard>
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>توزيع النتائج</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-green-200 bg-green-50/30 p-4 text-center dark:border-green-900/50 dark:bg-green-950/20">
              <CheckCircle2 className="mx-auto h-6 w-6 text-green-600 mb-1" />
              <div className="text-2xl font-bold text-green-700">{successCount}</div>
              <div className="text-xs text-green-600">نجاح</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-4 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
              <TrendingUp className="mx-auto h-6 w-6 text-amber-600 mb-1" />
              <div className="text-2xl font-bold text-amber-700">{partialCount}</div>
              <div className="text-xs text-amber-600">نجاح جزئي</div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/30 p-4 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <XCircle className="mx-auto h-6 w-6 text-red-600 mb-1" />
              <div className="text-2xl font-bold text-red-700">{failureCount}</div>
              <div className="text-xs text-red-600">فشل</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <MinusCircle className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
              <div className="text-2xl font-bold text-muted-foreground">{unknownCount}</div>
              <div className="text-xs text-muted-foreground">غير محدد</div>
            </div>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Correlation by Priority */}
      {outcomeCorrelation.byPriority.length > 0 && (
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>ارتباط النتائج بالأولوية</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="space-y-3">
              {outcomeCorrelation.byPriority
                .filter((r: OutcomeCorrelationRow) => r.decisionsWithOutcome > 0)
                .map((row: OutcomeCorrelationRow) => (
                  <div key={row.key} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{row.labelAr}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {row.decisionsWithOutcome} قرار
                      </span>
                    </div>
                    {row.successRatePct != null && (
                      <OutcomeBar pct={row.successRatePct} label="معدل النجاح" />
                    )}
                    {row.avgVariance != null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        متوسط الانحراف: {row.avgVariance}
                      </p>
                    )}
                  </div>
                ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {outcomeCorrelation.disclaimerAr}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {/* Correlation by Decision Type */}
      {outcomeCorrelation.byDecisionType.length > 0 && (
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>ارتباط النتائج بنوع القرار</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="space-y-3">
              {outcomeCorrelation.byDecisionType
                .filter((r: OutcomeCorrelationRow) => r.decisionsWithOutcome > 0)
                .map((row: OutcomeCorrelationRow) => (
                  <div key={row.key} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <span className="text-sm font-medium">{row.labelAr}</span>
                      <span className="mr-2 text-xs text-muted-foreground">
                        ({row.decisionsWithOutcome})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {row.successRatePct != null && (
                        <Badge
                          variant={row.successRatePct >= 60 ? "default" : "destructive"}
                        >
                          {row.successRatePct}% نجاح
                        </Badge>
                      )}
                      {row.avgVariance != null && (
                        <span className="text-xs text-muted-foreground">
                          انحراف {row.avgVariance}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {/* Recent Outcomes */}
      {outcomeMetrics.recentOutcomes.length > 0 && (
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>آخر النتائج</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="space-y-2">
              {outcomeMetrics.recentOutcomes.map((item) => (
                <Link
                  key={item.decisionId}
                  href={`/decisions/${item.decisionId}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate max-w-[240px]">
                      {item.title}
                    </span>
                    <Badge variant="outline">
                      {getOutcomeStatusLabel(item.outcomeStatus)}
                    </Badge>
                    {!item.hasReview && (
                      <Badge variant="secondary" className="text-[10px]">
                        بانتظار مراجعة
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {item.variance != null ? `انحراف ${item.variance}` : "—"}
                  </span>
                </Link>
              ))}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </div>
  );
}
