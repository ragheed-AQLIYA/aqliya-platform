"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  submitConversionMemoAction,
  upsertConversionMemoAction,
} from "@/actions/sales-actions";
import type { ConversionMemo } from "@/lib/sales/conversion-memo";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";
import { CheckCircle2, FileText, Send, XCircle } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُرسَل للتسليم",
  decided: "قرار مسجّل",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  decided:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تعديل مذكرة التحويل";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث مذكرة التحويل";
}

export function DealConversionMemoPanel({
  dealId,
  memo,
  evidenceLinks,
  canUpdate = false,
}: {
  dealId: string;
  memo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
  canUpdate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraft = !memo || memo.status === "draft";
  const selectedRefs = new Set(memo?.evidenceRefs ?? []);

  async function handleSave(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await upsertConversionMemoAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ المذكرة");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(markDecided: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitConversionMemoAction(dealId, markDecided);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال المذكرة");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canUpdate) {
    return (
      <div className="space-y-4">
        {memo ? (
          <MemoSummary memo={memo} evidenceLinks={evidenceLinks} />
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد مذكرة تحويل مسجّلة لهذه الصفقة.
          </p>
        )}
        <SalesViewerReadOnlyNotice action="تعديل مذكرة تحويل البilot" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memo && !isDraft ? (
        <MemoSummary memo={memo} evidenceLinks={evidenceLinks} />
      ) : (
        <form action={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="conversionDraft">مسودة المذكرة (pilot → paid)</Label>
            <Textarea
              id="conversionDraft"
              name="draft"
              required
              rows={5}
              defaultValue={memo?.draft ?? ""}
              placeholder="ملخص نتائج الـ pilot، قرار التحول، والخطوات التالية — بدون إرسال بريد أو LLM"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pilotCriteria">معايير نجاح الـ pilot</Label>
            <Textarea
              id="pilotCriteria"
              name="pilotCriteria"
              required
              rows={3}
              defaultValue={memo?.pilotCriteria ?? ""}
              placeholder="معايير قابلة للتحقق مرتبطة بالأدلة المربوطة"
              className="mt-1"
            />
          </div>

          <div>
            <Label>مراجع الأدلة (مطلوبة عند الإرسال)</Label>
            {evidenceLinks.length === 0 ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                اربط دليلاً واحداً على الأقل في لوحة الأدلة قبل إرسال المذكرة.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {evidenceLinks.map((link) => (
                  <li key={link.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="evidenceRefs"
                      value={link.id}
                      defaultChecked={selectedRefs.has(link.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{link.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {link.evidenceId}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            <FileText className="h-4 w-4" />
            {loading ? "جارٍ الحفظ..." : "حفظ المسودة"}
          </Button>
        </form>
      )}

      {memo && isDraft ? (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={submitting || evidenceLinks.length === 0}
            className="gap-1"
            onClick={() => handleSubmit(false)}
          >
            <Send className="h-4 w-4" />
            {submitting ? "جارٍ الإرسال..." : "إرسال للتسليم (يتطلب أدلة)"}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={submitting || evidenceLinks.length === 0}
            className="gap-1"
            onClick={() => handleSubmit(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "جارٍ التسجيل..." : "تسجيل قرار التحويل"}
          </Button>
        </div>
      ) : null}

      {!isDraft && error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        stub PR-13 — تخزين metadata فقط، بدون بريد أو LLM. يُسجَّل{" "}
        <code className="text-[10px]">sales.conversion.memo_updated</code> عند
        كل تحديث.
      </p>
    </div>
  );
}

function MemoSummary({
  memo,
  evidenceLinks,
}: {
  memo: ConversionMemo;
  evidenceLinks: SalesEvidenceLinkView[];
}) {
  const linkById = new Map(evidenceLinks.map((l) => [l.id, l]));

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={STATUS_COLORS[memo.status] ?? STATUS_COLORS.draft}>
          {STATUS_LABELS[memo.status] ?? memo.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          آخر تحديث: {new Date(memo.updatedAt).toLocaleString("ar-SA")}
        </span>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">المسودة</p>
        <p className="whitespace-pre-wrap">{memo.draft}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">معايير الـ pilot</p>
        <p className="whitespace-pre-wrap">{memo.pilotCriteria}</p>
      </div>
      {memo.evidenceRefs.length > 0 ? (
        <div>
          <p className="text-muted-foreground text-xs">مراجع الأدلة</p>
          <ul className="list-disc pr-4">
            {memo.evidenceRefs.map((ref) => {
              const link = linkById.get(ref);
              return (
                <li key={ref}>
                  {link?.title ?? ref}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {memo.submittedAt ? (
        <p className="text-xs text-muted-foreground">
          أُرسل: {new Date(memo.submittedAt).toLocaleString("ar-SA")}
        </p>
      ) : null}
      {memo.decidedAt ? (
        <p className="text-xs text-muted-foreground">
          قرار: {new Date(memo.decidedAt).toLocaleString("ar-SA")}
        </p>
      ) : null}
    </div>
  );
}
