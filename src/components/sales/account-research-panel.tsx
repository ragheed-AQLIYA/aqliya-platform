"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateAccountResearchAction,
  markAccountResearchReviewedAction,
} from "@/actions/sales-actions";
import type { AccountResearchRun } from "@/lib/sales/agents/account-research";
import { BookOpen, Check, RefreshCw, Sparkles } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار مراجعة ADMIN",
  reviewed: "تمت المراجعة",
};

const STATUS_COLORS: Record<string, string> = {
  draft_pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  reviewed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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

function formatGeneratedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function AccountResearchPanel({
  accountId,
  research,
  canGenerate = false,
  canMarkReviewed = false,
}: {
  accountId: string;
  research: AccountResearchRun | null;
  canGenerate?: boolean;
  canMarkReviewed?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAccountResearchAction(accountId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء ملخص البحث");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkReviewed() {
    setReviewing(true);
    setError(null);
    try {
      const res = await markAccountResearchReviewedAction(accountId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل المراجعة");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        ملخص بحث محكوم — قالب من حقول الحساب والإشارات فقط. لا استدعاء LLM
        خارجي؛ القرار البشري (ADMIN) يُسجَّل في SalesAuditEvent.
      </p>

      {!research ? (
        <p className="text-sm text-muted-foreground">
          لا يوجد ملخص بحث بعد. OPERATOR+ يمكنه توليد مسودة.
        </p>
      ) : (
        <div className="space-y-3 rounded-md border p-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">Research brief</span>
            </div>
            <Badge
              variant="outline"
              className={STATUS_COLORS[research.status] ?? ""}
            >
              {STATUS_LABELS[research.status] ?? research.status}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            الثقة (قالب): {research.confidence}% · المصادر:{" "}
            {research.sources.length} ·{" "}
            {formatGeneratedAt(research.generatedAt) ?? research.generatedAt}
            {research.generatedByName
              ? ` · ${research.generatedByName}`
              : null}
          </p>

          <pre className="whitespace-pre-wrap rounded bg-muted/40 p-2 text-xs font-sans">
            {research.brief}
          </pre>

          {research.sources.length > 0 ? (
            <ul className="text-xs text-muted-foreground space-y-1">
              {research.sources.map((source, index) => (
                <li key={`${source.type}-${source.label}-${index}`}>
                  {source.label}
                  {source.value != null ? `: ${String(source.value)}` : ""}
                </li>
              ))}
            </ul>
          ) : null}

          {research.reviewedAt ? (
            <p className="text-xs text-muted-foreground">
              مراجعة ADMIN: {research.reviewedByName ?? research.reviewedById} ·{" "}
              {formatGeneratedAt(research.reviewedAt)}
            </p>
          ) : null}
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {canGenerate ? (
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={handleGenerate}
            className="gap-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {research ? "إعادة توليد الملخص" : "توليد ملخص البحث"}
          </Button>
        ) : (
          <SalesViewerReadOnlyNotice action="توليد ملخص البحث" />
        )}

        {canMarkReviewed &&
        research?.status === "draft_pending_review" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={reviewing}
            onClick={handleMarkReviewed}
            className="gap-1"
          >
            {reviewing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            تسجيل مراجعة ADMIN
          </Button>
        ) : null}
      </div>
    </div>
  );
}
