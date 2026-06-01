import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountCreateForm } from "@/components/sales/account-create-form";
import {
  SalesPageHeader,
  SalesPhaseBadge,
  SalesNavLinks,
} from "@/components/sales/sales-shell";

export const dynamic = "force-dynamic";

export default async function NewSalesAccountPage() {
  return (
    <div dir="rtl">
      <SalesNavLinks active="accounts" />
      <Link
        href="/sales/accounts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الحسابات
      </Link>
      <SalesPageHeader
        title="حساب جديد"
        subtitle="إنشاء حساب P0 — اسم وقطاع اختياري"
      />
      <SalesPhaseBadge />
      <AccountCreateForm />
    </div>
  );
}
