import { getLocalContentSpendAnalyticsAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  EmptyState as LCEmptyState,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { SpendAnalyticsView } from "@/components/local-content/spend-analytics-view";
import { TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LocalContentAnalyticsPage() {
  const res = await getLocalContentSpendAnalyticsAction();
  const isEmpty =
    res.ok &&
    res.data.totalSpend === 0 &&
    res.data.localSpend === 0 &&
    Object.keys(res.data.byCategory).length === 0;

  return (
    <DashboardLayout>
      <PageHeader
        title="تحليلات الإنفاق"
        subtitle="LC-06/LC-07 — إنفاق واتجاه نسبة المحتوى المحلي (قواعد حتمية)"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      {!res.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل التحليلات"
          description={res.error}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={<TrendingDown className="h-12 w-12" />}
          title="لا توجد بيانات إنفاق بعد"
          description="لم يتم تسجيل أي إنفاق للمحتوى المحلي. ابدأ بإضافة مشاريع وسجلات إنفاق لعرض التحليلات."
          action={
            <LCEmptyState
              title=""
              description=""
              actionHref="/local-content/projects"
              actionLabel="إنشاء مشروع امتثال"
            />
          }
        />
      ) : (
        <SpendAnalyticsView data={res.data} />
      )}
    </DashboardLayout>
  );
}
