"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  createOutreachDraftAction,
  submitOutreachDraftAction,
  reviewOutreachDraftAction,
} from "@/actions/sales-actions";
import type { OutreachDraft } from "@/lib/sales/outreach";
import { Check, FileText, RefreshCw, Send, X } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  pending_review: "بانتظار المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
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

export function DealOutreachPanel({
  dealId,
  drafts,
  canCreate = false,
  canReview = false,
}: {
  dealId: string;
  drafts: OutreachDraft[];
  canCreate?: boolean;
  canReview?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await createOutreachDraftAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء المسودة");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(draftId: string) {
    setSubmittingId(draftId);
    setError(null);
    try {
      const res = await submitOutreachDraftAction(dealId, draftId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال للمراجعة");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleReview(
    draftId: string,
    decision: "approved" | "rejected",
  ) {
    setReviewingId(draftId);
    setError(null);
    try {
      const res = await reviewOutreachDraftAction(dealId, draftId, decision);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل المراجعة");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        مسودات outreach محكومة — لا إرسال تلقائي ولا تكامل بريد. المراجعة
        البشرية (اعتماد/رفض) تُسجَّل في SalesAuditEvent فقط.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا مسودات outreach بعد.</p>
      ) : (
        <ul className="space-y-3">
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className="rounded-md border p-3 text-sm space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{draft.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {draft.channel ?? "—"} ·{" "}
                    {new Date(draft.createdAt).toLocaleString("ar-SA")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[draft.status] ?? ""}
                >
                  {STATUS_LABELS[draft.status] ?? draft.status}
                </Badge>
              </div>
              <p className="text-xs whitespace-pre-wrap rounded bg-muted/40 p-2">
                {draft.body}
              </p>
              {draft.reviewedAt ? (
                <p className="text-xs text-muted-foreground">
                  مراجعة: {draft.reviewedByName ?? draft.reviewedById} ·{" "}
                  {new Date(draft.reviewedAt).toLocaleString("ar-SA")}
                  {draft.reviewNote ? ` — ${draft.reviewNote}` : ""}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {canCreate && draft.status === "draft" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={submittingId === draft.id}
                    onClick={() => handleSubmit(draft.id)}
                  >
                    {submittingId === draft.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    إرسال للمراجعة
                  </Button>
                ) : null}
                {canReview && draft.status === "pending_review" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={reviewingId === draft.id}
                      onClick={() => handleReview(draft.id, "approved")}
                    >
                      {reviewingId === draft.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      اعتماد
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={reviewingId === draft.id}
                      onClick={() => handleReview(draft.id, "rejected")}
                    >
                      <X className="h-4 w-4" />
                      رفض
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!canCreate ? (
        <SalesViewerReadOnlyNotice action="إنشاء مسودات outreach" />
      ) : null}

      {canCreate ? (
        <form action={handleCreate} className="space-y-3 border-t pt-4">
          <div className="space-y-1">
            <Label htmlFor="outreachSubject">الموضوع</Label>
            <Input
              id="outreachSubject"
              name="subject"
              required
              disabled={loading}
              placeholder="موضوع الرسالة"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="outreachBody">نص المسودة</Label>
            <Textarea
              id="outreachBody"
              name="body"
              required
              disabled={loading}
              rows={4}
              placeholder="نص outreach — لا يُرسل خارج المنصة"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="outreachChannel">القناة (اختياري)</Label>
            <select
              id="outreachChannel"
              name="channel"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              disabled={loading}
              defaultValue=""
            >
              <option value="">—</option>
              <option value="email">بريد</option>
              <option value="linkedin">LinkedIn</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="submitForReview" value="1" />
            إرسال مباشرة لقائمة المراجعة (pending_review)
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            إنشاء مسودة
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function OutreachReviewQueue({
  items,
  canReview = false,
}: {
  items: Array<
    OutreachDraft & {
      dealId: string;
      dealTitle: string;
      accountId: string;
      accountName: string;
    }
  >;
  canReview?: boolean;
}) {
  const router = useRouter();
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReview(
    dealId: string,
    draftId: string,
    decision: "approved" | "rejected",
  ) {
    const key = `${dealId}:${draftId}`;
    setReviewingKey(key);
    setError(null);
    try {
      const res = await reviewOutreachDraftAction(dealId, draftId, decision);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل المراجعة");
    } finally {
      setReviewingKey(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        لا مسودات بانتظار المراجعة في هذه المنظمة.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => {
          const key = `${item.dealId}:${item.id}`;
          return (
            <li key={key} className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Link
                      href={`/sales/deals/${item.dealId}`}
                      className="text-primary hover:underline"
                    >
                      {item.dealTitle}
                    </Link>
                    {" · "}
                    {item.accountName}
                  </p>
                </div>
                <Badge variant="outline" className={STATUS_COLORS.pending_review}>
                  {STATUS_LABELS.pending_review}
                </Badge>
              </div>
              <p className="text-xs whitespace-pre-wrap rounded bg-muted/40 p-2">
                {item.body}
              </p>
              <p className="text-xs text-muted-foreground">
                بواسطة {item.createdByName ?? item.createdById} ·{" "}
                {new Date(item.submittedAt ?? item.createdAt).toLocaleString(
                  "ar-SA",
                )}
              </p>
              {canReview ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    disabled={reviewingKey === key}
                    onClick={() =>
                      handleReview(item.dealId, item.id, "approved")
                    }
                  >
                    {reviewingKey === key ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    اعتماد
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={reviewingKey === key}
                    onClick={() =>
                      handleReview(item.dealId, item.id, "rejected")
                    }
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </Button>
                </div>
              ) : (
                <SalesViewerReadOnlyNotice action="اعتماد أو رفض المسودات" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
