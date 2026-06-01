import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import type { WaveAInstitutionalSignal } from "@/lib/sales/services/cross-product-signals-service";

const SEVERITY_LABELS: Record<
  WaveAInstitutionalSignal["severity"],
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  critical: { label: "حرج", variant: "destructive" },
  warning: { label: "تحذير", variant: "default" },
  info: { label: "معلومة", variant: "secondary" },
};

const SOURCE_LABELS: Record<WaveAInstitutionalSignal["sourceProduct"], string> =
  {
    audit: "تدقيق",
    local_content: "محتوى محلي",
    sales: "مبيعات",
  };

export function CrossProductSignalStrip({
  signals,
}: {
  signals: WaveAInstitutionalSignal[];
}) {
  if (signals.length === 0) return null;

  return (
    <EnterpriseCard module="sales" aria-live="polite">
      <EnterpriseCardContent className="pt-4 pb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">إشارات cross-product</p>
          <Link
            href="/platform/commercial"
            className="text-xs text-primary hover:underline"
          >
            اللوحة التنفيذية
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {signals.slice(0, 6).map((signal) => {
            const severity = SEVERITY_LABELS[signal.severity];
            return (
              <div
                key={signal.id}
                className="min-w-[200px] shrink-0 rounded-lg border px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">
                    {signal.titleAr}
                  </p>
                  <Badge variant={severity.variant} className="shrink-0 text-[10px]">
                    {severity.label}
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {SOURCE_LABELS[signal.sourceProduct]} · {signal.waveAKind}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          إشارات مؤسسية — مسودة؛ المراجعة البشرية مطلوبة.
        </p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
