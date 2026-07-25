import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import {
  getLcScoreReportAction,
  getSpendReportAction,
  getSupplierReportAction,
} from "@/actions/localcontent-report-actions";
import { ReportsClient } from "./components/reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [scoreRes, spendRes, supplierRes] = await Promise.all([
    getLcScoreReportAction(),
    getSpendReportAction(),
    getSupplierReportAction(),
  ]);

  const scoreError = scoreRes.ok ? null : scoreRes.error;
  const spendError = spendRes.ok ? null : spendRes.error;
  const supplierError = supplierRes.ok ? null : supplierRes.error;

  return (
    <DashboardLayout>
      <PageHeader
        title="تقارير الأداء"
        subtitle="تحليلات المحتوى المحلي — درجات الامتثال، الإنفاق، وتصنيف الموردين"
      />
      <DevPhaseBadge />
      {scoreError && (
        <InlineNotice variant="error" title="تعذر تحميل تقرير الدرجات" description={scoreError} />
      )}
      {spendError && (
        <InlineNotice variant="error" title="تعذر تحميل تقرير الإنفاق" description={spendError} />
      )}
      {supplierError && (
        <InlineNotice variant="error" title="تعذر تحميل تقرير الموردين" description={supplierError} />
      )}
      <ReportsClient
        scoreData={scoreRes.ok ? scoreRes.data : []}
        spendData={spendRes.ok ? spendRes.data : []}
        supplierData={supplierRes.ok ? supplierRes.data : []}
      />
    </DashboardLayout>
  );
}
