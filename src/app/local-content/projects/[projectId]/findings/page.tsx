import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentFindingsAction,
  createLocalContentFindingAction,
  updateLocalContentFindingAction,
  deleteLocalContentFindingAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { LocalContentDeleteButton } from "@/components/local-content/local-content-delete-button";
import { FindingForm } from "@/components/local-content/finding-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const TYPE_LABELS: Record<string, string> = {
  evidence_gap: "فجوة أدلة",
  low_content: "محتوى منخفض",
  unclassified_supplier: "مورد غير مصنف",
  data_quality: "جودة بيانات",
  compliance_risk: "خطر امتثال",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  submitted: "مقدم",
  reviewed: "مراجع",
  resolved: "محلول",
  dismissed: "مستبعد",
};

export default async function FindingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const findingsRes = await listLocalContentFindingsAction(projectId);
  const findings = findingsRes.ok ? findingsRes.data : [];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="النتائج والفجوات / Findings"
        subtitle={`${findings.length} نتيجة`}
      />
      <DevPhaseBadge />

      <FindingForm
        projectId={projectId}
        createAction={createLocalContentFindingAction}
      />

      {!findingsRes.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل النتائج"
          description={
            findingsRes.error || "تعذر تحميل النتائج والفجوات لهذا المشروع."
          }
        />
      ) : findings.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج"
          description="لم يتم تسجيل أي نتيجة أو فجوة حتى الآن."
        />
      ) : (
        <div className="space-y-2">
          {findings.map((f) => (
            <Card key={f.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-start gap-2">
                  <AlertTriangle
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{
                      color:
                        f.severity === "critical"
                          ? "#ef4444"
                          : f.severity === "high"
                            ? "#f97316"
                            : "#eab308",
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{f.title}</span>
                      <Badge
                        variant="outline"
                        className={SEVERITY_COLORS[f.severity] || ""}
                      >
                        {SEVERITY_LABELS[f.severity] || f.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[f.type] || f.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-muted">
                        {STATUS_LABELS[f.status] || f.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
              {f.createdByName && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  بواسطة: {f.createdByName} |{" "}
                  {new Date(f.createdAt).toLocaleDateString("ar-SA")}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <FindingForm
                  projectId={projectId}
                  findingId={f.id}
                  updateAction={updateLocalContentFindingAction}
                  initialValues={{
                    title: f.title,
                    description: f.description,
                    type: f.type,
                    severity: f.severity,
                    status: f.status,
                  }}
                  buttonLabel="تعديل النتيجة"
                  title={`تحديث النتيجة: ${f.title}`}
                  submitLabel="حفظ التعديلات"
                  triggerVariant="outline"
                />
                <LocalContentDeleteButton
                  projectId={projectId}
                  entityId={f.id}
                  entityLabel={`النتيجة ${f.title}`}
                  action={deleteLocalContentFindingAction}
                  confirmText={`سيتم حذف النتيجة ${f.title} من هذا المشروع. ستبقى أي أدلة مرتبطة محفوظة ولكن بدون ربط بهذه النتيجة.`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
