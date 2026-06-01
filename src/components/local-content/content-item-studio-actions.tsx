"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  draftAssistContentItemAction,
  submitContentStudioReviewAction,
} from "@/actions/local-content-workspace-actions";

export function ContentItemStudioActions({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "review" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDraft() {
    setLoading("draft");
    setError(null);
    try {
      const res = await draftAssistContentItemAction(itemId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error || "تعذر مساعدة المسودة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر مساعدة المسودة");
    } finally {
      setLoading(null);
    }
  }

  async function runSubmitReview() {
    setLoading("review");
    setError(null);
    try {
      const res = await submitContentStudioReviewAction(itemId);
      if (res.ok) {
        router.push("/local-content/review");
        router.refresh();
      } else {
        setError(res.error || "تعذر الإرسال للمراجعة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الإرسال للمراجعة");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={loading !== null}
          onClick={() => void runDraft()}
        >
          {loading === "draft" ? "جاري المساعدة…" : "مساعدة مسودة (AI)"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={() => void runSubmitReview()}
        >
          {loading === "review" ? "جاري الإرسال…" : "إرسال للمراجعة"}
        </Button>
      </div>
    </div>
  );
}
