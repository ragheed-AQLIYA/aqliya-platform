import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentSpendRecordsAction,
  listLocalContentSuppliersAction,
  listLocalContentClassificationsAction,
  getLocalContentScoreAction,
  classifyLocalContentSpendRecordAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import { ClassificationForm } from "@/components/local-content/classification-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  technology: "تقنية",
  goods: "سلع",
  services: "خدمات",
  construction: "إنشاءات",
  logistics: "لوجستي",
};

const BASIS_LABELS: Record<string, string> = {
  certificate: "شهادة",
  self_declaration: "إقرار ذاتي",
  contract_term: "بند تعاقدي",
  analyst_estimate: "تقدير محلل",
};

export default async function ClassificationPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const [spendRes, suppliersRes, scoreRes, classificationsRes] =
    await Promise.all([
      listLocalContentSpendRecordsAction(projectId),
      listLocalContentSuppliersAction(projectId),
      getLocalContentScoreAction(projectId),
      listLocalContentClassificationsAction(projectId),
    ]);

  const spendRecords = spendRes.ok ? spendRes.data : [];
  const suppliers = suppliersRes.ok ? suppliersRes.data : [];
  const score = scoreRes.ok ? scoreRes.data : null;
  const classifications = classificationsRes.ok ? classificationsRes.data : [];

  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const classificationBySpend = new Map(
    classifications
      .filter((c) => c.spendRecordId)
      .map((c) => [c.spendRecordId!, c]),
  );

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="التصنيف / Classification"
        subtitle="تصنيف المحتوى المحلي للموردين وسجلات الإنفاق"
      />
      <DevPhaseBadge />

      {score && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "نسبة المحتوى المحلي",
              value: `${score.localContentPercentage.toFixed(1)}%`,
              icon: BarChart3,
            },
            {
              label: "مصنف",
              value: `${score.classificationStats.confirmed} / ${score.classificationStats.total}`,
              icon: BarChart3,
            },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <div className="p-3 text-center">
                <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {spendRecords.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات إنفاق"
          description="أضف سجلات إنفاق أولاً قبل التصنيف."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              تصنيف قاعدي — ليس ذكاءً اصطناعياً. التصنيف بشري ومراجع.
            </Badge>
            <Link
              href={`/local-content/projects/${projectId}/suppliers`}
              className="text-xs font-medium text-primary hover:underline"
            >
              تحديث بيانات الموردين
            </Link>
          </div>
          <div className="grid gap-2">
            {spendRecords.map((sr) => {
              const supplier = supplierMap.get(sr.supplierId);
              const existing = classificationBySpend.get(sr.id);
              const localityLabel =
                supplier?.localityClassification === "local"
                  ? "محلي"
                  : supplier?.localityClassification === "non_local"
                    ? "غير محلي"
                    : supplier?.localityClassification === "mixed"
                      ? "مشترك"
                      : "غير مصنف";
              const pct =
                existing?.localPercentage ?? supplier?.localContentPercentage;
              return (
                <Card key={sr.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-medium">
                        {supplier?.name || sr.supplierId}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">
                          {sr.amount.toLocaleString("ar-SA")} {sr.currency}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {CATEGORY_LABELS[sr.category] || sr.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pct != null ? (
                        <Badge variant="outline" className="bg-muted/50">
                          {pct}% محلي
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700"
                        >
                          غير مصنف
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {localityLabel}
                      </Badge>
                    </div>
                  </div>
                  {existing && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      تصنيف مسجّل: {existing.localPercentage}% —{" "}
                      {BASIS_LABELS[existing.classificationBasis] ||
                        existing.classificationBasis}
                      {existing.notes ? ` — ${existing.notes}` : ""}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>
                      نوع الملكية:{" "}
                      {supplier?.ownershipType === "Saudi"
                        ? "سعودي"
                        : supplier?.ownershipType === "foreign"
                          ? "أجنبي"
                          : supplier?.ownershipType === "joint_venture"
                            ? "مشترك"
                            : "—"}
                    </span>
                    {supplier?.workforceLocalPct != null && (
                      <span>السعودة: {supplier.workforceLocalPct}%</span>
                    )}
                  </div>
                  <ClassificationForm
                    projectId={projectId}
                    spendRecordId={sr.id}
                    supplierId={sr.supplierId}
                    supplierName={supplier?.name || sr.supplierId}
                    classifyAction={classifyLocalContentSpendRecordAction}
                  />
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
