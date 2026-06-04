export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAuditActor } from "@/lib/audit/actor-context";
import { getOrganizationPortfolioAnalytics } from "@/lib/audit/portfolio-analytics-service";
import { PortfolioAnalyticsPanel } from "@/components/audit/portfolio/portfolio-analytics-panel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function AuditPortfolioPage() {
  const actor = await getAuditActor();
  const snapshot = await getOrganizationPortfolioAnalytics(actor.organizationId);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">محفظة التدقيق</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نظرة تشغيلية عبر كل التكليفات في المنظمة
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/audit">
            <ArrowRight className="size-4 ms-1" />
            لوحة AuditOS
          </Link>
        </Button>
      </div>
      <PortfolioAnalyticsPanel snapshot={snapshot} />
    </div>
  );
}
