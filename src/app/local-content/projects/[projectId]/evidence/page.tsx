import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentEvidenceAction,
  createLocalContentEvidenceAction,
  deleteLocalContentEvidenceAction,
  listLocalContentSuppliersAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import {
  EvidenceForm,
  EvidenceStatusBadge,
  EvidenceTypeBadge,
} from "@/components/local-content/evidence-form";
import { LocalContentDeleteButton } from "@/components/local-content/local-content-delete-button";
import { EvidenceFileUploadForm } from "@/components/local-content/evidence-file-upload-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

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
  const loadError = !suppliersRes.ok
    ? suppliersRes.error || "تعذر تحميل الموردين لهذا المشروع."
    : !evidenceRes.ok
      ? evidenceRes.error || "تعذر تحميل الأدلة لهذا المشروع."
      : null;

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

      <InlineNotice
        variant="info"
        title="رفع الملف لا يعني اعتماده"
        description="كل ملف مرفوع هنا يبدأ كدليل تشغيلي ويظل بحاجة إلى مراجعة بشرية قبل اعتباره موثقًا أو صالحًا للاعتماد ضمن الحزمة النهائية."
      />

      {loadError ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل الأدلة"
          description={loadError}
        />
      ) : null}

      <EvidenceForm
        projectId={projectId}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        createAction={createLocalContentEvidenceAction}
      />
      <EvidenceFileUploadForm
        projectId={projectId}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />

      {!loadError && evidence.length === 0 ? (
        <EmptyState title="لا توجد أدلة" description="أضف أول دليل للمشروع." />
      ) : !loadError ? (
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
              <div className="mt-3 flex items-center justify-between gap-3">
                {e.storageKey ? (
                  <a
                    href={`/api/local-content/projects/${projectId}/evidence/${e.id}/download`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تنزيل الملف المرفوع
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    هذا السجل يوثق دليلًا بدون ملف مخزن للتنزيل.
                  </span>
                )}
                <LocalContentDeleteButton
                  projectId={projectId}
                  entityId={e.id}
                  entityLabel={`الدليل ${e.filename}`}
                  action={deleteLocalContentEvidenceAction}
                  confirmText={`سيتم حذف الدليل ${e.filename} من هذا المشروع. إذا كان مرتبطًا بملف مرفوع فسيحاول النظام إزالة الملف المخزن أيضًا.`}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </DashboardLayout>
  );
}
