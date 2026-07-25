"use client";

import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";
import { useDealConversionMemo } from "./components/use-deal-conversion-memo";
import { MemoSummary } from "./components/deal-conversion-memo-summary";
import { MemoForm } from "./components/deal-conversion-memo-form";
import { MemoSubmitActions } from "./components/deal-conversion-memo-submit-actions";
import type { ConversionMemo } from "@/lib/sales/conversion-memo";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";

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
  const { loading, submitting, error, handleSave, handleSubmit } =
    useDealConversionMemo(dealId);

  const isDraft = !memo || memo.status === "draft";

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
        <MemoForm
          memo={memo}
          evidenceLinks={evidenceLinks}
          loading={loading}
          error={error}
          handleSave={handleSave}
        />
      )}

      {memo && isDraft ? (
        <MemoSubmitActions
          submitting={submitting}
          evidenceCount={evidenceLinks.length}
          onSubmit={handleSubmit}
        />
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
