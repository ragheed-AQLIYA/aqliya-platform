import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { ConversionFunnelSnapshot } from "@/lib/sales/intelligence/conversion-funnel";
import { formatSalesStageLabel } from "@/lib/sales/sales-ux-copy";

export function ConversionFunnelView({ funnel }: { funnel: ConversionFunnelSnapshot }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">قمع التحويل</h1>
        <p className="mt-1 text-sm text-muted-foreground">{funnel.disclaimerAr}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="إجمالي الفرص" value={String(funnel.totalOpportunities)} />
        <Metric label="مفتوحة" value={String(funnel.openCount)} />
        <Metric
          label="نسبة الفوز"
          value={
            funnel.winRatePct != null ? `${funnel.winRatePct}%` : "—"
          }
        />
        <Metric
          label="فوز / خسارة"
          value={`${funnel.winCount} / ${funnel.lostCount}`}
        />
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>توزيع المراحل</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {funnel.stages
              .filter((s) => s.count > 0)
              .map((row) => (
                <li
                  key={row.stage}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
                >
                  <span>{formatSalesStageLabel(String(row.stage))}</span>
                  <span className="text-muted-foreground">
                    {row.count} · {row.shareOfPipeline}% ·{" "}
                    {row.value.toLocaleString("ar-SA")} ر.س
                  </span>
                </li>
              ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>انتقالات مرحلية (مؤشر)</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {funnel.transitions
              .filter((t) => t.conversionRate != null && t.dropOff > 0)
              .slice(0, 6)
              .map((t) => (
                <li key={`${t.from}-${t.to}`}>
                  {formatSalesStageLabel(t.from)} → {formatSalesStageLabel(t.to)}:{" "}
                  {t.conversionRate}% (انخفاض {t.dropOff})
                </li>
              ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
