"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyzeDealObjectionAction } from "@/actions/sales-actions";
import type { ObjectionAnalysisRun } from "@/lib/sales/agents/objection-analysis";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { MessageSquareWarning, RefreshCw, ScanSearch } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار المراجعة",
};

const STATUS_COLORS: Record<string, string> = {
  draft_pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تنفيذ الإجراء";
}

function formatTimestamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function interactionLabel(interaction: SalesInteractionView): string {
  const subject = interaction.subject?.trim();
  const summary = interaction.summary?.trim();
  const preview = subject || summary || interaction.type;
  const date = new Intl.DateTimeFormat("ar-SA", { dateStyle: "short" }).format(
    new Date(interaction.occurredAt),
  );
  return `${preview.slice(0, 60)}${preview.length > 60 ? "…" : ""} (${date})`;
}

export function DealObjectionAnalysisPanel({
  dealId,
  runs,
  interactions,
  canAnalyze = false,
}: {
  dealId: string;
  runs: ObjectionAnalysisRun[];
  interactions: SalesInteractionView[];
  canAnalyze?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"interaction" | "paste">("paste");
  const [interactionId, setInteractionId] = useState<string>("");
  const [pastedText, setPastedText] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeDealObjectionAction(dealId, {
        interactionId: mode === "interaction" ? interactionId || null : null,
        pastedText: mode === "paste" ? pastedText.trim() || null : null,
      });
      if (res.ok) {
        setPastedText("");
        setInteractionId("");
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل الاعتراض");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        تحليل اعتراض محكوم — تصنيف قواعدي من نص التفاعل أو نص ملصوق. لا
        استدعاء LLM خارجي. المخرجات مسودة بانتظار مراجعة بشرية.
      </p>

      {runs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا تحليلات اعتراض بعد — OPERATOR+ يمكنه تشغيل التحليل.
        </p>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="space-y-2 rounded-md border p-3 text-sm"
            >
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
                <p className="font-medium text-muted-foreground mb-1">
                  النص المصدر
                </p>
                <p className="whitespace-pre-wrap">{run.sourceText}</p>
              </div>

              <div className="rounded border border-dashed p-2 text-xs">
                <p className="font-medium text-muted-foreground mb-1">
                  رد مقترح (قالب)
                </p>
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
                {run.interactionId ? ` · تفاعل: ${run.interactionId.slice(0, 8)}…` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {!canAnalyze ? (
        <SalesViewerReadOnlyNotice action="تحليل الاعتراض" />
      ) : (
        <div className="space-y-3 border-t pt-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "paste" ? "default" : "outline"}
              onClick={() => setMode("paste")}
            >
              نص ملصوق
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "interaction" ? "default" : "outline"}
              onClick={() => setMode("interaction")}
              disabled={interactions.length === 0}
            >
              من تفاعل
            </Button>
          </div>

          {mode === "paste" ? (
            <div className="space-y-2">
              <Label htmlFor="objection-paste">نص الاعتراض</Label>
              <Textarea
                id="objection-paste"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="الصق نص الاعتراض من المكالمة أو البريد…"
                rows={4}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="objection-interaction">التفاعل</Label>
              <Select
                value={interactionId}
                onValueChange={setInteractionId}
                disabled={loading}
              >
                <SelectTrigger id="objection-interaction">
                  <SelectValue placeholder="اختر تفاعلاً…" />
                </SelectTrigger>
                <SelectContent>
                  {interactions.map((interaction) => (
                    <SelectItem key={interaction.id} value={interaction.id}>
                      {interactionLabel(interaction)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="button"
            size="sm"
            disabled={
              loading ||
              (mode === "paste"
                ? pastedText.trim().length < 10
                : !interactionId)
            }
            onClick={handleAnalyze}
            className="gap-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            تحليل الاعتراض
          </Button>
        </div>
      )}
    </div>
  );
}
