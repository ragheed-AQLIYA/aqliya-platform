import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLocalContentTenderMatchAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { TenderMatchView } from "@/components/local-content/tender-match-view";

export const dynamic = "force-dynamic";

export default async function LocalContentTenderMatchPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const res = await getLocalContentTenderMatchAction(projectId);

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
        {!res.ok ? (
          <InlineNotice
            variant="error"
            title="تعذر تحميل مطابقة المناقصة"
            description={res.error}
          />
        ) : (
          <TenderMatchView report={res.data} />
        )}
      </div>
    </DashboardLayout>
  );
}
