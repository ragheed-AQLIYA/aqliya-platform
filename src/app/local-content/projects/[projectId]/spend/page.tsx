import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentSpendRecordsAction,
  listLocalContentSuppliersAction,
  createLocalContentSpendRecordAction,
  deleteLocalContentSpendRecordAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { LocalContentDeleteButton } from "@/components/local-content/local-content-delete-button";
import { SpendForm } from "@/components/local-content/spend-form";
import { CsvImportForm } from "@/components/local-content/csv-import-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  technology: "تقنية",
  goods: "سلع",
  services: "خدمات",
  construction: "إنشاءات",
  logistics: "لوجستي",
};

export default async function SpendPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const [spendRes, suppliersRes] = await Promise.all([
    listLocalContentSpendRecordsAction(projectId),
    listLocalContentSuppliersAction(projectId),
  ]);
  const spendRecords = spendRes.ok ? spendRes.data : [];
  const suppliers = suppliersRes.ok ? suppliersRes.data : [];
  const totalSpend = spendRecords.reduce((sum, s) => sum + s.amount, 0);
  const loadError = !suppliersRes.ok
    ? suppliersRes.error || "تعذر تحميل الموردين لهذا المشروع."
    : !spendRes.ok
      ? spendRes.error || "تعذر تحميل سجلات الإنفاق لهذا المشروع."
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
        title="سجلات الإنفاق / Spend Records"
        subtitle={`${spendRecords.length} سجل — إجمالي ${totalSpend.toLocaleString("ar-SA")} SAR`}
      />
      <DevPhaseBadge />

      {loadError ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل قسم الإنفاق"
          description={loadError}
        />
      ) : null}

      {!loadError && suppliers.length === 0 ? (
        <InlineNotice
          variant="warning"
          title="الإدخال اليدوي يتطلب موردًا واحدًا على الأقل"
          description="أضف موردًا أولاً قبل إنشاء سجل إنفاق يدوي، أو استخدم استيراد CSV إذا كانت لديك بيانات جاهزة وسيقوم النظام بإنشاء الموردين المفقودين أثناء الاستيراد."
        />
      ) : null}

      <div className="flex items-center gap-2 mb-4">
        {suppliers.length > 0 ? (
          <SpendForm
            projectId={projectId}
            suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            createAction={createLocalContentSpendRecordAction}
          />
        ) : null}
        <CsvImportForm projectId={projectId} />
      </div>

      {!loadError && spendRecords.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات إنفاق"
          description="أضف أول سجل إنفاق للمشروع."
        />
      ) : !loadError ? (
        <div className="space-y-1">
          {spendRecords.map((s) => {
            const supplier = s.supplier;
            return (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate">
                      {supplier?.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {s.contractReference && `${s.contractReference} | `}
                      {s.period}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">
                      {s.amount.toLocaleString("ar-SA")} {s.currency}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </Badge>
                  </div>
                </div>
                {s.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                )}
                <div className="mt-3 flex justify-end">
                  <LocalContentDeleteButton
                    projectId={projectId}
                    entityId={s.id}
                    entityLabel={`سجل الإنفاق ${supplier?.name || s.id}`}
                    action={deleteLocalContentSpendRecordAction}
                    confirmText={`سيتم حذف سجل الإنفاق الخاص بـ ${supplier?.name || "هذا المورد"} للفترة ${s.period}. سيبقى أي تصنيف أو دليل مرتبط كسجل غير مربوط داخل المشروع.`}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </DashboardLayout>
  );
}
