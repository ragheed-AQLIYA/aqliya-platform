export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditActor } from "@/lib/audit/actor-context";
import { buildAuditCommandCenter } from "@/lib/audit/command-center";

export default async function AuditCommandCenterPage() {
  const actor = await getAuditActor();
  const snapshot = await buildAuditCommandCenter(actor.organizationId);

  const m = snapshot.metrics;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link href="/audit" className="text-sm text-muted-foreground hover:underline">
          ← AuditOS
        </Link>
        <h1 className="mt-2 text-h2 font-black">مركز قيادة التدقيق</h1>
        <p className="text-sm text-muted-foreground">{snapshot.disclaimerAr}</p>
        <p className="text-xs text-muted-foreground">منتج: {snapshot.productId}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="الارتباطات" value={m.engagementCount} />
        <MetricCard label="نتائج مفتوحة" value={m.openFindingCount} />
        <MetricCard label="أدلة" value={m.evidenceCount} />
        <MetricCard label="مراجعات معلقة" value={m.pendingReviewCount} />
        <MetricCard label="اعتمادات معلقة" value={m.pendingApprovalCount} />
        <MetricCard label="مخرجات" value={m.outputCount} />
        <MetricCard label="ارتباطات عالية المخاطر" value={m.highRiskEngagementCount} />
        <MetricCard label="أوراق عمل" value={snapshot.workpaperTotal} />
      </div>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-base">الارتباطات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {snapshot.engagements.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <Link href={e.href} className="font-medium text-primary hover:underline">
                    {e.clientName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {e.status} — جاهزية {e.readinessScore}% — مخاطر {e.riskLevel}
                  </p>
                </div>
                <span className="text-xs">{e.openFindings} نتائج</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
