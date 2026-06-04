import { getLocalContentSpendAnalyticsAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { SpendAnalyticsView } from "@/components/local-content/spend-analytics-view";

export const dynamic = "force-dynamic";

export default async function LocalContentAnalyticsPage() {
  const res = await getLocalContentSpendAnalyticsAction();

  return (
    <DashboardLayout>
      <PageHeader
        title="تحليلات الإنفاق"
        subtitle="LC-06 — ملخص محتوى محلي عبر المشاريع (قواعد حتمية)"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      {!res.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل التحليلات"
          description={res.error}
        />
      ) : (
        <SpendAnalyticsView data={res.data} />
      )}
    </DashboardLayout>
  );
}
