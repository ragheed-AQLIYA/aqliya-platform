import Link from "next/link";

import { getSalesFounderReportAction } from "@/actions/sales-actions";
import { KPICard } from "@/components/enterprise/kpi-card";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import {
  SalesInlineNotice,
  SalesNavLinks,
  SalesPageHeader,
} from "@/components/sales/sales-shell";
import { icpBandRowsAr } from "@/lib/sales/reporting";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  Link2,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SalesReportsPage() {
  const res = await getSalesFounderReportAction();
  const report = res.ok ? res.data : null;

  return (
    <div className="space-y-6" dir="rtl">
      <SalesNavLinks active="reports" />

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        SalesOS v0.3 PR-11 — لوحة تقارير المؤسس (قراءة فقط). تجميع من الخدمات الحالية بدون
        تصدير ولا إرسال تلقائي.
      </div>

      {!res.ok ? (
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل التقرير"
          description={res.error}
        />
      ) : null}

      <SalesPageHeader
        title="تقارير SalesOS"
        subtitle="ملخص المؤسس — صحة المسار، ملاءمة ICP، المتابعة، والأدلة"
      />

      {report ? (
        <>
          <p className="text-xs text-muted-foreground">
            آخر تجميع: {report.generatedAt.toLocaleString("ar-SA")}
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="صفقات مفتوحة"
              value={report.pipelineHealth.open}
              icon={Target}
              module="sales"
            />
            <KPICard
              label="فوز / خسارة"
              value={`${report.pipelineHealth.won} / ${report.pipelineHealth.lost}`}
              icon={BarChart3}
              module="sales"
            />
            <KPICard
              label="إجراءات مستحقة (7 أيام)"
              value={report.dueNextActionsCount}
              icon={Activity}
              module="sales"
            />
            <KPICard
              label="مراجعات تواصل معلّقة"
              value={report.pendingOutreachReviewsCount}
              icon={ClipboardCheck}
              module="sales"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>صحة المسار</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">مفتوحة</dt>
                    <dd className="text-2xl font-bold">{report.pipelineHealth.open}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">إجمالي</dt>
                    <dd className="text-2xl font-bold">{report.pipelineHealth.total}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">فوز</dt>
                    <dd className="text-xl font-semibold text-green-700 dark:text-green-300">
                      {report.pipelineHealth.won}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">خسارة</dt>
                    <dd className="text-xl font-semibold text-red-700 dark:text-red-300">
                      {report.pipelineHealth.lost}
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/sales/pipeline"
                  className="mt-4 inline-block text-xs text-primary hover:underline"
                >
                  عرض المسار →
                </Link>
              </EnterpriseCardContent>
            </EnterpriseCard>

            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>نطاقات ICP (metadata.icpScore)</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <p className="mb-3 text-xs text-muted-foreground">
                  {report.icpBands.configured} من {report.icpBands.totalAccounts} حساباً
                  بدرجة ICP مُعدّة
                </p>
                <div className="space-y-2">
                  {icpBandRowsAr(report.icpBands).map((row) => (
                    <div
                      key={row.band}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.count}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/sales/accounts"
                  className="mt-4 inline-block text-xs text-primary hover:underline"
                >
                  عرض الحسابات →
                </Link>
              </EnterpriseCardContent>
            </EnterpriseCard>

            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>المتابعة والتواصل</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">إجراءات مستحقة (7 أيام)</dt>
                    <dd className="font-semibold">{report.dueNextActionsCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">متأخرة</dt>
                    <dd className="font-semibold text-status-error">
                      {report.overdueNextActionsCount}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">مسودات تواصل بانتظار المراجعة</dt>
                    <dd className="font-semibold">{report.pendingOutreachReviewsCount}</dd>
                  </div>
                </dl>
                {!report.outreachModuleAvailable ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    وحدة التواصل غير مثبتة — العدّ من metadata فقط أو صفر.
                  </p>
                ) : null}
                <Link
                  href="/sales"
                  className="mt-4 inline-block text-xs text-primary hover:underline"
                >
                  لوحة المتابعة →
                </Link>
              </EnterpriseCardContent>
            </EnterpriseCard>

            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  روابط الأدلة (المؤسسة)
                </EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-3xl font-bold">{report.evidenceLinkCount}</p>
                    <p className="text-xs text-muted-foreground">
                      SalesEvidenceLink — نطاق organizationId
                    </p>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
