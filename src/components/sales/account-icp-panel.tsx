"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  readAccountIcpScore,
  icpBandLabelAr,
  type IcpFitDimensions,
} from "@/lib/sales/icp-types";
import {
  recalculateAccountIcpScoreAction,
  setAccountIcpReviewedAction,
} from "@/actions/sales-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RefreshCw, Target, XCircle } from "lucide-react";

function formatAssessedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث تقييم ICP";
}

function DimensionRow({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}%</span>
    </div>
  );
}

function DimensionsBlock({ dimensions }: { dimensions: IcpFitDimensions }) {
  const rows = [
    { label: "الألم", value: dimensions.pain },
    { label: "الإلحاح", value: dimensions.urgency },
    { label: "الميزانية", value: dimensions.budget },
    { label: "الصلاحية", value: dimensions.authority },
  ].filter((r) => r.value != null);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-1 rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">أبعاد الملاءمة</p>
      {rows.map((row) => (
        <DimensionRow key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}

export function AccountIcpPanel({
  accountId,
  metadata,
  canUpdate = false,
}: {
  accountId: string;
  metadata: unknown;
  canUpdate?: boolean;
}) {
  const router = useRouter();
  const assessment = readAccountIcpScore(metadata);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecalculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await recalculateAccountIcpScoreAction(accountId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إعادة حساب ICP");
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewToggle(checked: boolean) {
    setReviewLoading(true);
    setError(null);
    try {
      const res = await setAccountIcpReviewedAction(accountId, checked);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث حالة المراجعة");
    } finally {
      setReviewLoading(false);
    }
  }

  if (!assessment.configured || !assessment.score) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4 shrink-0" />
          <span>ICP assessment not configured</span>
        </div>
        <p className="text-xs text-muted-foreground">
          تقييم ملاءمة العميل المثالي (ICP) غير مفعّل — استخدم القواعد لحساب أول
          تقييم.
        </p>
        {canUpdate ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={handleRecalculate}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recalculate (rules)
          </Button>
        ) : null}
        {error ? (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  const { score } = assessment;
  const assessedLabel = formatAssessedAt(score.assessedAt);
  const showReviewPending =
    score.agentGenerated === true && score.reviewed !== true;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tabular-nums">{score.fitScore}%</p>
          <p className="text-sm text-muted-foreground">
            {icpBandLabelAr(score.band)}
          </p>
        </div>
        {score.segment ? (
          <span className="rounded-md border px-2 py-1 text-xs font-medium">
            {score.segment}
          </span>
        ) : null}
      </div>

      {score.agentGenerated ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {showReviewPending
            ? "تقييم آلي (قواعد) — بانتظار مراجعة بشرية"
            : score.reviewed
              ? "تقييم آلي (قواعد) — تمت المراجعة"
              : "تقييم آلي (قواعد)"}
        </p>
      ) : null}

      {score.confidence != null ? (
        <p className="text-sm text-muted-foreground">
          الثقة:{" "}
          <span className="font-medium text-foreground">{score.confidence}%</span>
        </p>
      ) : null}

      {score.dimensions ? <DimensionsBlock dimensions={score.dimensions} /> : null}

      {score.reasoning && score.reasoning.length > 0 ? (
        <div className="space-y-1 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">التبرير (قواعد)</p>
          <ul className="list-disc space-y-1 ps-4 text-xs text-muted-foreground">
            {score.reasoning.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {score.notes ? (
        <p className="text-sm text-muted-foreground">{score.notes}</p>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {score.source ? <span>المصدر: {score.source}</span> : null}
        {assessedLabel ? <span>آخر تقييم: {assessedLabel}</span> : null}
      </div>

      {canUpdate ? (
        <div className="flex flex-wrap items-center gap-4 border-t pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || reviewLoading}
            onClick={handleRecalculate}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recalculate (rules)
          </Button>

          {score.agentGenerated ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`icp-reviewed-${accountId}`}
                checked={score.reviewed === true}
                disabled={reviewLoading || loading}
                onCheckedChange={(checked) =>
                  handleReviewToggle(checked === true)
                }
              />
              <Label
                htmlFor={`icp-reviewed-${accountId}`}
                className="text-sm font-normal cursor-pointer"
              >
                Mark reviewed
              </Label>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
