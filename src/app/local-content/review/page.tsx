import { unstable_noStore as noStore } from "next/cache";
import { listContentStudioReviewQueueAction } from "@/actions/local-content-workspace-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { ContentReviewQueue } from "@/components/local-content/content-review-queue";

export const dynamic = "force-dynamic";

export default async function ContentReviewPage() {
  noStore();
  const res = await listContentStudioReviewQueueAction();
  const queue = res.ok ? res.data : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="قائمة المراجعة"
        subtitle="مراجعة المحتوى — مصادر، امتثال، جودة لغوية"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      <p className="text-xs text-muted-foreground mb-4">
        AI assists. Humans decide. لا نشر تلقائي — الموافقة البشرية مطلوبة.
      </p>

      <ContentReviewQueue
        initialQueue={queue}
        initialError={res.ok ? undefined : res.error}
      />
    </DashboardLayout>
  );
}
