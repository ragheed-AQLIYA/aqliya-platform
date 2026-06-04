import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buildSalesCommandCenter } from "@/lib/sales/command-center";
import { initSalesWorkspace } from "@/lib/sales/service";
import { listOpportunities } from "@/lib/sales/store";
import { buildConversionFunnel } from "@/lib/sales/intelligence/conversion-funnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSalesStageLabel } from "@/lib/sales/sales-ux-copy";

export default async function SalesCommandCenterPage() {
  const user = await getCurrentUser();
  const snapshot = await buildSalesCommandCenter(user);
  initSalesWorkspace(user);
  const funnel = buildConversionFunnel(listOpportunities(user.organizationId));

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link href="/sales" className="text-sm text-muted-foreground hover:underline">
          ← SalesOS
        </Link>
        <h1 className="mt-2 text-h2 font-black">مركز القيادة التجاري</h1>
        <p className="text-sm text-muted-foreground">{snapshot.disclaimerAr}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="حسابات" value={snapshot.metrics.accountCount} />
        <Metric label="فرص" value={snapshot.metrics.opportunityCount} />
        <Metric label="قيمة المسار" value={snapshot.metrics.pipelineValue} />
        <Metric label="تحتاج مراجعة" value={snapshot.metrics.needsReview} />
      </div>

      <Card className="rounded-[24px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">قمع التحويل (S7-06)</CardTitle>
          <Link href="/sales/funnel" className="text-xs text-primary hover:underline">
            التفاصيل
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            فوز: {funnel.winCount} · خسارة: {funnel.lostCount}
            {funnel.winRatePct != null ? ` · نسبة فوز ${funnel.winRatePct}%` : ""}
          </p>
          <ul className="space-y-1 text-sm">
            {funnel.stages
              .filter((s) => s.count > 0)
              .slice(0, 5)
              .map((row) => (
                <li key={row.stage}>
                  {formatSalesStageLabel(String(row.stage))}: {row.count}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-base">أفضل الفرص</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.topOpportunities.map((o: { id: string; name: string; valueEstimate?: number | null }) => (
              <li key={o.id}>
                <Link
                  href={`/sales/opportunities/${o.id}`}
                  className="text-primary hover:underline"
                >
                  {o.name}
                </Link>
                {" — "}
                {o.valueEstimate?.toLocaleString("ar-SA") ?? "—"}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
