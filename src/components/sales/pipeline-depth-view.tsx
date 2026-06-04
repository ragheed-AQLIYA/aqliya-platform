import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { PipelineDepthSnapshot } from "@/lib/sales/intelligence/pipeline-depth";

export function PipelineDepthView({ snapshot }: { snapshot: PipelineDepthSnapshot }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">عمق المسار</h1>
        <p className="mt-1 text-sm text-muted-foreground">{snapshot.disclaimerAr}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="قيمة المسار" value={snapshot.summary.totalValue.toLocaleString("ar-SA")} />
        <Metric label="مرجّح" value={snapshot.summary.weightedValue.toLocaleString("ar-SA")} />
        <Metric label="متوقفة 14+ يوم" value={String(snapshot.stalledCount)} />
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>قيمة حسب المرحلة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.stages.map((row) => (
              <li
                key={row.stage}
                className="flex flex-wrap justify-between gap-2 rounded border px-3 py-2"
              >
                <span>{row.labelAr}</span>
                <span className="text-muted-foreground">
                  {row.count} · {row.sharePct}% · {row.totalValue.toLocaleString("ar-SA")} ر.س
                </span>
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
