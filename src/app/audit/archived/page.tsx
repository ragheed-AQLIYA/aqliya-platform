export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAuditActor } from "@/lib/audit/actor-context";
import { listArchivedEngagements } from "@/lib/audit/engagement-archival-service";
import { ArchivedEngagementsPanel } from "@/components/audit/archived/archived-engagements-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AuditArchivedPage() {
  const actor = await getAuditActor();
  const rows = await listArchivedEngagements(actor.organizationId);
  const canRestore = ["admin", "partner"].includes(actor.actorRole);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">أرشيف التكليفات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تكليفات منشورة/معتمدة تم أرشفتها — الاستعادة للمشرف/الشريك فقط (A1-10)
          </p>
        </div>
        <Link
          href="/audit/portfolio"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          محفظة التدقيق
        </Link>
      </div>
      <ArchivedEngagementsPanel rows={rows} canRestore={canRestore} />
    </div>
  );
}
