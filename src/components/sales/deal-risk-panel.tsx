"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recalculateDealRiskAction } from "@/actions/sales-actions";
import {
  dealRiskSeverityLabelAr,
  readDealRiskAssessment,
  type DealRiskFlag,
  type DealRiskSeverity,
} from "@/lib/sales/deal-risk-types";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const SEVERITY_BADGE: Record<DealRiskSeverity, string> = {
  none: "bg-muted text-muted-foreground",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const FLAG_LABELS: Record<DealRiskFlag["id"], string> = {
  activity_gap: "فجوة نشاط",
  no_response: "بدون رد",
  missing_stakeholder: "أصحاب مصلحة",
  missing_stakeholder_hint: "تلميح أصحاب مصلحة",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية إعادة حساب المخاطر";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر إعادة الحساب";
}

function formatComputedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function DealRiskPanel({
  dealId,
  metadata,
  canRecalculate = false,
}: {
  dealId: string;
  metadata: unknown;
  canRecalculate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { configured, assessment } = readDealRiskAssessment(metadata);

  async function handleRecalculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await recalculateDealRiskAction(dealId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إعادة الحساب");
    } finally {
      setLoading(false);
    }
  }

  const severity = assessment?.severity ?? "none";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">تقييم مخاطر الصفقة (استشاري)</p>
            <p className="text-xs text-muted-foreground">
              قواعد فقط — بدون LLM. لا يحل محل قرار بشري.
            </p>
          </div>
        </div>
        <Badge className={SEVERITY_BADGE[severity]}>
          {dealRiskSeverityLabelAr(severity)}
        </Badge>
      </div>

      {!configured || !assessment ? (
        <p className="text-sm text-muted-foreground">
          لا يوجد تقييم مخاطر بعد — OPERATOR+ يمكنه إعادة الحساب من النشاط
          والبيانات الوصفية.
        </p>
      ) : (
        <>
          {assessment.riskFlags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لم تُكتشف أعلام مخاطر في آخر حساب.
            </p>
          ) : (
            <ul className="space-y-2">
              {assessment.riskFlags.map((flag) => (
                <li
                  key={flag.id}
                  className="rounded-md border bg-muted/30 p-3 text-sm"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-medium">{FLAG_LABELS[flag.id]}</span>
                    <Badge variant="outline" className="text-xs">
                      {dealRiskSeverityLabelAr(flag.severity)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{flag.message}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            {formatComputedAt(assessment.computedAt)
              ? `آخر حساب: ${formatComputedAt(assessment.computedAt)}`
              : null}
            {assessment.agentGenerated ? (
              <span className="mr-2 text-amber-700 dark:text-amber-300">
                {" "}
                — مُولَّد بالوكيل
              </span>
            ) : null}
          </p>
        </>
      )}

      {canRecalculate ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={loading}
          onClick={handleRecalculate}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          إعادة حساب المخاطر (قواعد)
        </Button>
      ) : (
        <SalesViewerReadOnlyNotice action="إعادة حساب مخاطر الصفقة" />
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
