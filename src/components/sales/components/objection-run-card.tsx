"use client";

import { MessageSquareWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ObjectionAnalysisRun } from "@/lib/sales/agents/objection-analysis";

const STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار المراجعة",
};

const STATUS_COLORS: Record<string, string> = {
  draft_pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

function formatTimestamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function ObjectionRunCard({ run }: { run: ObjectionAnalysisRun }) {
  return (
    <div className="space-y-2 rounded-md border p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium flex items-center gap-1">
            <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
            {run.categoryLabelAr}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            الثقة: {run.confidence}%
            {run.matchedKeywords.length > 0
              ? ` · ${run.matchedKeywords.length} كلمة مطابقة`
              : ""}
          </p>
        </div>
        <Badge
          variant="outline"
          className={STATUS_COLORS[run.status] ?? ""}
        >
          {STATUS_LABELS[run.status] ?? run.status}
        </Badge>
      </div>

      <div className="rounded bg-muted/40 p-2 text-xs">
        <p className="font-medium text-muted-foreground mb-1">النص المصدر</p>
        <p className="whitespace-pre-wrap">{run.sourceText}</p>
      </div>

      <div className="rounded border border-dashed p-2 text-xs">
        <p className="font-medium text-muted-foreground mb-1">رد مقترح (قالب)</p>
        <p>{run.suggestedResponse}</p>
      </div>

      {run.matchedKeywords.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          مطابقة: {run.matchedKeywords.join("، ")}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        تحليل: {run.analyzedByName ?? run.analyzedById}
        {formatTimestamp(run.analyzedAt)
          ? ` · ${formatTimestamp(run.analyzedAt)}`
          : ""}
        {run.interactionId
          ? ` · تفاعل: ${run.interactionId.slice(0, 8)}…`
          : ""}
      </p>
    </div>
  );
}
