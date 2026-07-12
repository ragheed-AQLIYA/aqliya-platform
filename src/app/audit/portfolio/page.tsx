export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAuditActor } from "@/lib/audit/actor-context";
import { getOrganizationPortfolioAnalytics } from "@/lib/audit/portfolio-analytics-service";
import { PortfolioAnalyticsPanel } from "@/components/audit/portfolio/portfolio-analytics-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart3 } from "lucide-react";

export default async function AuditPortfolioPage() {
  const actor = await getAuditActor();
  const snapshot = await getOrganizationPortfolioAnalytics(actor.organizationId);
  const isEmpty = snapshot.totals.engagements === 0;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">محفظة التدقيق</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نظرة تشغيلية عبر كل التكليفات في المنظمة
          </p>
        </div>
        <Link
          href="/audit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ArrowRight className="size-4 ms-1" />
          لوحة AuditOS
        </Link>
      </div>
      {isEmpty ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="محفظة التدقيق فارغة"
          description="لا توجد تكليفات تدقيق بعد. ابدأ بإنشاء مهمة تدقيق من لوحة AuditOS."
          action={
            <Link
              href="/audit"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              العودة للوحة
            </Link>
          }
        />
      ) : (
        <PortfolioAnalyticsPanel snapshot={snapshot} />
      )}
    </div>
  );
}
