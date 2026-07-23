"use server";

import { getCurrentUser } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { getOutreachAnalyticsAction } from "@/actions/sales-intel-actions";
import Link from "next/link";

export default async function OutreachAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const analytics = await getOutreachAnalyticsAction();
  const data = analytics.success ? analytics.data : null;

  return (
    <div className="space-y-6" dir="rtl">
      <Link href="/sales/outreach" className="text-sm text-muted-foreground hover:underline">
        ← العودة إلى Outreach
      </Link>
      <h1 className="text-2xl font-bold">تحليلات التواصل</h1>
      <p className="text-muted-foreground">Outreach Analytics — آخر 30 يوم</p>

      {data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="إجمالي المرسل" value={data.totalSent.toLocaleString()} />
          <MetricCard label="معدل الفتح" value={`${data.openRate.toFixed(1)}%`} sub={`${data.totalOpened} من ${data.totalSent}`} />
          <MetricCard label="معدل الرد" value={`${data.replyRate.toFixed(1)}%`} sub={`${data.totalReplied} رد`} />
          <MetricCard label="اجتماعات" value={data.totalMeetings.toLocaleString()} />
        </div>
      ) : (
        <p className="text-muted-foreground">لا توجد بيانات تحليلية بعد. ابدأ بإطلاق حملة تواصل.</p>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
