import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getLocalContentProjectAction,
  getLocalContentVerificationChecklistAction,
  getLocalContentTbSignalsAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { VerificationChecklistView } from "@/components/local-content/verification-checklist-view";

export const dynamic = "force-dynamic";

export default async function LocalContentVerificationPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const [checklistRes, tbRes] = await Promise.all([
    getLocalContentVerificationChecklistAction(projectId),
    getLocalContentTbSignalsAction(projectId),
  ]);

  return (
    <DashboardLayout>
      <div dir="rtl">
        <Link
          href={`/local-content/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> العودة للمشروع
        </Link>
        <DevPhaseBadge />
        {!checklistRes.ok ? (
          <InlineNotice
            variant="error"
            title="تعذر تحميل قائمة التحقق"
            description={checklistRes.error}
          />
        ) : (
          <VerificationChecklistView
            projectId={projectId}
            report={checklistRes.data}
            tbSignals={tbRes.ok ? tbRes.data : null}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
