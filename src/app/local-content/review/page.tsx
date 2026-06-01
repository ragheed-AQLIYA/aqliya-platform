import { listContentStudioReviewQueueAction } from "@/actions/local-content-workspace-actions";
import { ContentReviewPanel } from "@/components/local-content/content-review-panel";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import {
  DashboardLayout,
  DevPhaseBadge,
  InlineNotice,
  PageHeader,
} from "@/components/local-content/local-content-shell";

export const dynamic = "force-dynamic";

export default async function ContentReviewPage() {
  const res = await listContentStudioReviewQueueAction();
  const items = res.ok ? res.data : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="قائمة المراجعة"
        subtitle="مراجعة المصادر، الهوية، الامتثال، والجودة اللغوية"
      />
      <ContentStudioNav />
      <DevPhaseBadge />

      {!res.ok ? (
        <InlineNotice variant="error" title="تعذر التحميل" description={res.error} />
      ) : (
        <ContentReviewPanel items={items} />
      )}
    </DashboardLayout>
  );
}
