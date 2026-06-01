import {
  listSalesAccountsAction,
  listSalesPipelineStagesAction,
} from "@/actions/sales-actions";
import { DealCreateForm } from "@/components/sales/deal-create-form";
import {
  SalesPageHeader,
  SalesPhaseBadge,
  SalesNavLinks,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewSalesDealPage() {
  const [accountsRes, stagesRes] = await Promise.all([
    listSalesAccountsAction(),
    listSalesPipelineStagesAction(),
  ]);

  const accounts = accountsRes.ok ? accountsRes.data : [];
  const stages = stagesRes.ok ? stagesRes.data.stages : [];
  const loadError =
    !accountsRes.ok
      ? accountsRes.error
      : !stagesRes.ok
        ? stagesRes.error
        : undefined;

  return (
    <div dir="rtl">
      <SalesNavLinks active="deals" />
      <Link
        href="/sales/deals"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الصفقات
      </Link>
      <SalesPageHeader
        title="صفقة جديدة"
        subtitle="إنشاء صفقة P0 — حساب، عنوان، مرحلة اختيارية"
      />
      <SalesPhaseBadge />

      {loadError ? (
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل بيانات النموذج"
          description={loadError}
        />
      ) : null}

      <DealCreateForm
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        stages={stages.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
