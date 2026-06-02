import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { NextBestActionPanel } from "./next-best-action-panel";
import type { SalesNextBestActionItem } from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

interface CommandCenterProps {
  metrics: {
    activeAccounts: number;
    activeOpps: number;
    pipelineValue: number;
    stalledOpps: number;
    meetingsThisWeek: number;
    topObjections: Array<{ id: string; labelAr: string; count: number }>;
    topSignals: IntelligenceSignal[];
    icpFit: Array<{ labelAr: string; count: number; pct: number }>;
    recentActivity: Array<{
      id: string;
      type: string;
      summary: string;
      loggedAt: string;
      accountId: string;
    }>;
  };
  nextActions: SalesNextBestActionItem[];
  disclaimerAr: string;
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function CommandCenterDashboard({
  metrics,
  nextActions,
  disclaimerAr,
}: CommandCenterProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">مركز القيادة التجاري</h1>
        <p className="mt-1 text-sm text-muted-foreground">{disclaimerAr}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="حسابات نشطة" value={metrics.activeAccounts} />
        <MetricCard label="فرص نشطة" value={metrics.activeOpps} />
        <MetricCard
          label="قيمة المسار"
          value={metrics.pipelineValue.toLocaleString("ar-SA")}
        />
        <MetricCard label="فرص متوقفة" value={metrics.stalledOpps} />
        <MetricCard label="اجتماعات هذا الأسبوع" value={metrics.meetingsThisWeek} />
        <MetricCard
          label="توزيع ICP"
          value={`${metrics.icpFit[0]?.pct ?? 0}% عالية`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NextBestActionPanel actions={nextActions.slice(0, 6)} />

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">أبرز الاعتراضات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {metrics.topObjections.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا اعتراضات مسجّلة</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {metrics.topObjections.map((o) => (
                  <li key={o.id} className="flex justify-between rounded border px-2 py-1">
                    <span>{o.labelAr}</span>
                    <span className="text-muted-foreground">{o.count}×</span>
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
            <EnterpriseCardTitle className="text-base">أبرز الإشارات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
              {metrics.topSignals.map((s) => (
                <li key={s.id} className="rounded border px-2 py-1">
                  {s.label} — {s.value}% (ثقة {Math.round(s.confidence * 100)}%)
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">توزيع ملاءمة ICP</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
              {metrics.icpFit.map((b) => (
                <li key={b.labelAr} className="flex justify-between">
                  <span>{b.labelAr}</span>
                  <span>
                    {b.count} ({b.pct}%)
                  </span>
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="text-base">النشاط الأخير</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {metrics.recentActivity.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/sales/accounts/${a.accountId}`}
                  className="text-primary hover:underline"
                >
                  {a.type}
                </Link>
                {" — "}
                {a.summary.slice(0, 80)}
                <span className="text-xs text-muted-foreground">
                  {" "}
                  · {a.loggedAt.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
