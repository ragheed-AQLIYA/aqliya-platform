import { getLocalContentClassificationRulesAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { ClassificationRulesView } from "@/components/local-content/classification-rules-view";

export const dynamic = "force-dynamic";

export default async function ClassificationRulesPage() {
  const res = await getLocalContentClassificationRulesAction();

  return (
    <DashboardLayout>
      <DevPhaseBadge />
      <ContentStudioNav />
      {!res.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل القواعد"
          description={res.error}
        />
      ) : (
        <ClassificationRulesView
          rules={res.data.rules}
          source={res.data.source}
        />
      )}
    </DashboardLayout>
  );
}
