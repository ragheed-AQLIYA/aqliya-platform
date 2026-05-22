import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentEvidenceAction,
  createLocalContentEvidenceAction,
  updateLocalContentEvidenceStatusAction,
  listLocalContentSuppliersAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import {
  EvidenceForm,
  EvidenceStatusBadge,
  EvidenceTypeBadge,
} from "@/components/local-content/evidence-form";
import { EvidenceFileUploadForm } from "@/components/local-content/evidence-file-upload-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, FileBarChart } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "مرفوع",
  linked: "مرتبط",
  reviewed: "مراجع",
  verified: "موثق",
  rejected: "مرفوض",
  missing: "مفقود",
};

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const [evidenceRes, suppliersRes] = await Promise.all([
    listLocalContentEvidenceAction(projectId),
    listLocalContentSuppliersAction(projectId),
  ]);
  const evidence = evidenceRes.ok ? evidenceRes.data : [];
  const suppliers = suppliersRes.ok ? suppliersRes.data : [];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="الأدلة / Evidence"
        subtitle={`${evidence.length} دليل`}
      />
      <DevPhaseBadge />

      <EvidenceForm
        projectId={projectId}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        createAction={createLocalContentEvidenceAction}
      />
      <EvidenceFileUploadForm
        projectId={projectId}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />

      {evidence.length === 0 ? (
        <EmptyState title="لا توجد أدلة" description="أضف أول دليل للمشروع." />
      ) : (
        <div className="space-y-2">
          {evidence.map((e) => (
            <Card key={e.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {e.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <EvidenceTypeBadge type={e.evidenceType} />
                  <EvidenceStatusBadge status={e.status} />
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>نوع الملف: {e.fileType}</span>
                {e.supplier && <span>المورد: {e.supplier.name}</span>}
                {e.reviewedAt && (
                  <span>
                    تمت المراجعة:{" "}
                    {new Date(e.reviewedAt).toLocaleDateString("ar-SA")}
                  </span>
                )}
                {e.storageKey && (
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-green-50 text-green-700"
                  >
                    ملف مرفوع
                  </Badge>
                )}
                {e.sizeBytes && (
                  <span className="text-[10px]">
                    {(e.sizeBytes / 1024).toFixed(0)}KB
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
