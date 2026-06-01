import { notFound } from "next/navigation";
import { AccountBriefView } from "@/components/sales/account-brief-view";
import {
  SalesNavLinks,
  SalesPhaseBadge,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import {
  assertSalesAccountAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import { loadAccountBriefPack } from "@/lib/sales/account-brief-pack";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";

export const dynamic = "force-dynamic";

export default async function SalesAccountBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const ctx = await requireSalesPermission("salesos:read");
    await assertSalesAccountAccess(id);
    const { canCreate } = getSalesPermissionsForRole(ctx.user.role);

    const pack = await loadAccountBriefPack(id, {
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
    });

    if (!pack) {
      notFound();
    }

    return (
      <div dir="rtl">
        <SalesNavLinks active="accounts" canCreate={canCreate} />
        <SalesPhaseBadge />
        <AccountBriefView pack={pack} />
      </div>
    );
  } catch (e) {
    if (e instanceof SalesAccessError) {
      if (e.code === "NOT_FOUND" || e.code === "FORBIDDEN") {
        notFound();
      }
    }
    return (
      <div dir="rtl">
        <SalesNavLinks active="accounts" canCreate={false} />
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل موجز الحساب"
          description={e instanceof Error ? e.message : "خطأ غير متوقع"}
        />
      </div>
    );
  }
}
