import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentSuppliersAction,
  createLocalContentSupplierAction,
  updateLocalContentSupplierAction,
  deleteLocalContentSupplierAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { LocalContentDeleteButton } from "@/components/local-content/local-content-delete-button";
import { SupplierForm } from "@/components/local-content/supplier-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const LOCALITY_LABELS: Record<string, string> = {
  local: "محلي",
  non_local: "غير محلي",
  mixed: "مشترك",
  unclassified: "غير مصنف",
};

const LOCALITY_COLORS: Record<string, string> = {
  local: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  non_local: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  mixed:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  unclassified: "bg-muted",
};

export default async function SuppliersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const suppliersRes = await listLocalContentSuppliersAction(projectId);
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
        title="الموردين / Suppliers"
        subtitle={`${suppliers.length} مورد`}
      />
      <DevPhaseBadge />

      <SupplierForm
        projectId={projectId}
        createAction={createLocalContentSupplierAction}
      />

      {!suppliersRes.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل الموردين"
          description={
            suppliersRes.error || "تعذر تحميل قائمة الموردين لهذا المشروع."
          }
        />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="لا يوجد موردين"
          description="أضف المورد الأول للمشروع."
        />
      ) : (
        <div className="space-y-2">
          {suppliers.map((s) => (
            <Card key={s.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-medium">{s.name}</span>
                  {s.crNumber && (
                    <span className="text-xs text-muted-foreground ml-2">
                      سجل: {s.crNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {s.localityClassification && (
                    <Badge
                      variant="outline"
                      className={
                        LOCALITY_COLORS[s.localityClassification] || ""
                      }
                    >
                      {LOCALITY_LABELS[s.localityClassification] ||
                        s.localityClassification}
                    </Badge>
                  )}
                  {s.localContentPercentage != null && (
                    <Badge variant="outline">{s.localContentPercentage}%</Badge>
                  )}
                </div>
              </div>
              {s.ownershipType && (
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
                  <span>
                    {s.ownershipType === "Saudi"
                      ? "سعودي"
                      : s.ownershipType === "foreign"
                        ? "أجنبي"
                        : s.ownershipType === "joint_venture"
                          ? "مشروع مشترك"
                          : s.ownershipType}
                  </span>
                  {s.workforceLocalPct != null && (
                    <span>السعودة: {s.workforceLocalPct}%</span>
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <SupplierForm
                  projectId={projectId}
                  supplierId={s.id}
                  updateAction={updateLocalContentSupplierAction}
                  initialValues={{
                    name: s.name,
                    crNumber: s.crNumber,
                    localityClassification: s.localityClassification,
                    ownershipType: s.ownershipType,
                    localContentPercentage: s.localContentPercentage,
                    workforceLocalPct: s.workforceLocalPct,
                  }}
                  buttonLabel="تعديل بيانات المورد"
                  title={`تحديث بيانات المورد: ${s.name}`}
                  submitLabel="حفظ التعديلات"
                  triggerVariant="outline"
                />
                <LocalContentDeleteButton
                  projectId={projectId}
                  entityId={s.id}
                  entityLabel={`المورد ${s.name}`}
                  action={deleteLocalContentSupplierAction}
                  confirmText={`سيتم حذف المورد ${s.name} وكل سجلات الإنفاق التابعة له من هذا المشروع. لا يمكن التراجع عن هذا الإجراء.`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
