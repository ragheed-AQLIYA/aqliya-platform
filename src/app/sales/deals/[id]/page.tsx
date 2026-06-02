import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSalesDealAction,
  listSalesDealAuditEventsAction,
  listSalesPipelineStagesAction,
} from "@/actions/sales-actions";
import { DealStageForm } from "@/components/sales/deal-stage-form";
import {
  SalesPageHeader,
  SalesPhaseBadge,
  SalesNavLinks,
  SalesDealStatusBadge,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { EntityTimeline } from "@/components/entity/entity-timeline";
import { mapSalesAuditEventsToTimeline } from "@/lib/sales/audit-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function SalesDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [dealRes, auditRes, stagesRes] = await Promise.all([
    getSalesDealAction(id),
    listSalesDealAuditEventsAction(id),
    listSalesPipelineStagesAction(),
  ]);

  if (!dealRes.ok) {
    if (dealRes.code === "NOT_FOUND" || dealRes.code === "FORBIDDEN") {
      notFound();
    }
  }

  if (!dealRes.ok) {
    return (
      <div dir="rtl">
        <SalesNavLinks active="deals" />
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل الصفقة"
          description={dealRes.error}
        />
      </div>
    );
  }

  const deal = dealRes.data;
  const timeline = auditRes.ok
    ? mapSalesAuditEventsToTimeline(auditRes.data)
    : [];
  const stages = stagesRes.ok ? stagesRes.data : [];

  return (
    <div dir="rtl">
      <SalesNavLinks active="deals" />
      <Link
        href="/sales/deals"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الصفقات
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <SalesPageHeader title={deal.title} subtitle="تفاصيل الصفقة — org-scoped" />
        <SalesDealStatusBadge status={deal.status} />
      </div>
      <SalesPhaseBadge />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات الصفقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">الحساب:</span>
                <span className="font-medium">{deal.account.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">المرحلة:</span>
                <span className="font-medium">
                  {deal.stage?.name ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">القيمة: </span>
                <span className="font-medium">
                  {formatAmount(deal.amount, deal.currency)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">آخر تحديث: </span>
                <span>{new Date(deal.updatedAt).toLocaleString("ar-SA")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل النشاط (SalesAuditEvent)</CardTitle>
            </CardHeader>
            <CardContent>
              {!auditRes.ok ? (
                <SalesInlineNotice
                  variant="warning"
                  title="تعذر تحميل السجل"
                  description={auditRes.error}
                />
              ) : (
                <EntityTimeline
                  events={timeline}
                  emptyMessage="لا نشاط مسجّل لهذه الصفقة بعد"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تحديث المرحلة</CardTitle>
            </CardHeader>
            <CardContent>
              <DealStageForm
                dealId={deal.id}
                currentStageId={deal.stageId}
                stages={stages.map((s) => ({ id: s.id, name: s.name }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
