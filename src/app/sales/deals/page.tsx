import Link from "next/link";
import {
  listSalesDealsAction,
} from "@/actions/sales-actions";
import {
  SalesPageHeader,
  SalesPhaseBadge,
  SalesNavLinks,
  SalesDealList,
  SalesEmptyState,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SalesDealsPage() {
  const res = await listSalesDealsAction();
  const deals = res.ok ? res.data : [];

  return (
    <div dir="rtl">
      <SalesNavLinks active="deals" />
      <SalesPageHeader
        title="الصفقات"
        subtitle="قائمة الصفقات ضمن منظمتك — org-scoped"
      />
      <SalesPhaseBadge />

      <div className="mb-6">
        <Link
          href="/sales/deals/new"
          className={cn(buttonVariants({ size: "sm" }), "inline-flex items-center gap-1")}
        >
          <Plus className="h-4 w-4" />
          صفقة جديدة
        </Link>
      </div>

      {!res.ok ? (
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل الصفقات"
          description={res.error || "تحقق من migration salesos_p0_core و seed."}
        />
      ) : null}

      {res.ok && deals.length === 0 ? (
        <SalesEmptyState
          title="لا توجد صفقات"
          description="أنشئ صفقة جديدة أو شغّل scripts/seed-sales-demo.ts"
        />
      ) : res.ok ? (
        <SalesDealList deals={deals} />
      ) : null}
    </div>
  );
}
