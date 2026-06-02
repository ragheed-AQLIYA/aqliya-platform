import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";

export function CrossProductSignalsStrip({
  signals,
}: {
  signals: WaveAInstitutionalSignal[];
}) {
  if (signals.length === 0) {
    return (
      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            لا إشارات cross-product حالياً — ستظهر عند تجميع AuditOS وLocalContentOS
            وSalesOS.
          </p>
        </EnterpriseCardContent>
      </EnterpriseCard>
    );
  }

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">إشارات مؤسسية cross-product</p>
          <Link
            href="/platform/commercial"
            className="text-xs text-primary hover:underline"
          >
            اللوحة التنفيذية
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {signals.slice(0, 6).map((signal) => (
            <li key={signal.id}>
              <Badge
                variant="outline"
                className="max-w-[220px] truncate text-[11px] font-normal"
                title={signal.titleAr}
              >
                {signal.titleAr}
              </Badge>
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
