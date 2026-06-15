import Link from "next/link";
import {
  extractLocalContentSignalsFromEngagement,
  summarizeLocalContentSignals,
  estimateLocalContentPercent,
} from "@/lib/local-content-intelligence";
import { resolveLcProjectIdForEngagement } from "@/lib/local-content-intelligence/audit-engagement-bridge";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BarChart3 } from "lucide-react";

export async function LcTbSignalsCard({
  engagementId,
}: {
  engagementId: string;
}) {
  let signals: Awaited<
    ReturnType<typeof extractLocalContentSignalsFromEngagement>
  > = [];
  let lcProject: Awaited<
    ReturnType<typeof resolveLcProjectIdForEngagement>
  > = null;

  try {
    [signals, lcProject] = await Promise.all([
      extractLocalContentSignalsFromEngagement(engagementId),
      resolveLcProjectIdForEngagement(engagementId),
    ]);
  } catch {
    return null;
  }

  if (signals.length === 0 && !lcProject) return null;

  const summary = summarizeLocalContentSignals(signals);
  const estimatedPct = estimateLocalContentPercent(signals);

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart3 className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
        <span className="font-medium text-emerald-900 dark:text-emerald-200">
          إشارات المحتوى المحلي
        </span>
        <Badge variant="outline" className="text-[10px] h-4 px-1.5 mr-auto">
          مساعد — لا قرار آلي
        </Badge>
      </div>

      {signals.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3 mb-2">
          <div>
            <span className="text-muted-foreground">حسابات LC: </span>
            <span className="font-medium">{signals.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">إجمالي: </span>
            <span className="font-medium">
              {(summary.totalAmount / 1_000_000).toFixed(1)}M SAR
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">تقدير محلي: </span>
            <span className="font-medium">~{estimatedPct}%</span>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mb-2">
          لا توجد إشارات LC من ميزان المراجعة بعد.
        </p>
      )}

      {lcProject ? (
        <Link
          href={`/local-content/projects/${lcProject.projectId}/verification`}
          className="inline-flex items-center gap-1 text-emerald-800 hover:underline dark:text-emerald-300"
        >
          قائمة التحقق — {lcProject.projectName}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}
