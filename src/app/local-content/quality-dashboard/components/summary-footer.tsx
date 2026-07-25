"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Brain, Clock } from "lucide-react";
import type { AiQualityMetrics } from "@/actions/localcontent-quality-actions";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-SA");
}

export function SummaryFooter({ metrics }: { metrics: AiQualityMetrics }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>
            <strong>{metrics.totalExplanationsGenerated}</strong> تفسير تم
            توليده
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <span>
            <strong>{metrics.totalPatternSuggestions}</strong> اقتراح نمط
          </span>
        </div>
        {metrics.lastRunAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              آخر تشغيل: {formatDate(metrics.lastRunAt)}
              {metrics.lastRunDuration
                ? ` (${(metrics.lastRunDuration / 1000).toFixed(1)}s)`
                : ""}
            </span>
          </div>
        )}
      </div>
      <Badge
        variant="outline"
        className={
          metrics.lastRunStatus === "completed"
            ? "bg-green-100 text-green-800"
            : metrics.lastRunStatus === "failed"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100"
        }
      >
        {metrics.lastRunStatus === "completed"
          ? "آخر تشغيل ناجح ✅"
          : metrics.lastRunStatus === "failed"
            ? "آخر تشغيل فاشل ❌"
            : "لا توجد تشغيلات سابقة"}
      </Badge>
    </div>
  );
}
