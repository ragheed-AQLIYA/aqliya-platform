import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSalesDealAction,
  getSalesAccountAction,
  listDealEvidenceLinksAction,
} from "@/actions/sales-actions";
import { PilotHandoffPackView } from "@/components/sales/pilot-handoff-pack-view";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesPhaseBadge,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { buildPilotHandoffPack } from "@/lib/sales/pilot-handoff-pack";
import { getCurrentUser } from "@/lib/auth";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import { ArrowRight, PackageOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SalesDealPilotHandoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { canCreate } = getSalesPermissionsForRole(user.role);

  const dealRes = await getSalesDealAction(id);
  if (!dealRes.ok) {
    if (dealRes.code === "NOT_FOUND" || dealRes.code === "FORBIDDEN") {
      notFound();
    }
    return (
      <div dir="rtl">
        <SalesNavLinks active="deals" canCreate={canCreate} />
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل حزمة pilot"
          description={dealRes.error}
        />
      </div>
    );
  }

  const deal = dealRes.data;
  const [accountRes, evidenceRes] = await Promise.all([
    getSalesAccountAction(deal.accountId),
    listDealEvidenceLinksAction(id),
  ]);

  const accountMetadata =
    accountRes.ok && accountRes.data.metadata != null
      ? accountRes.data.metadata
      : {};
  const evidenceLinks = evidenceRes.ok ? evidenceRes.data : [];

  const pack = buildPilotHandoffPack({
    deal,
    accountMetadata,
    evidenceLinks,
  });

  return (
    <div dir="rtl">
      <SalesNavLinks active="deals" canCreate={canCreate} />
      <Link
        href={`/sales/deals/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الصفقة
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <SalesPageHeader
          title={deal.title}
          subtitle={
            <span className="inline-flex items-center gap-1">
              <PackageOpen className="h-4 w-4" />
              حزمة onboarding pilot — قراءة فقط
            </span>
          }
        />
      </div>
      <SalesPhaseBadge />

      <PilotHandoffPackView
        deal={pack.deal}
        conversionMemo={pack.conversionMemo}
        evidenceLinks={pack.evidenceLinks}
        reviewDecisions={pack.reviewDecisions}
        icpAssessment={pack.icpAssessment}
        checklist={pack.checklist}
        generatedAt={pack.generatedAt}
      />
    </div>
  );
}
