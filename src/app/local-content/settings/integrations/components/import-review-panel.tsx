"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

import type { ErpImportBatch as PrismaErpImportBatch } from "@prisma/client";

type ErpImportBatch = PrismaErpImportBatch;

interface ImportReviewPanelProps {
  batch: ErpImportBatch;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}

export function ImportReviewPanel({
  batch,
  onApprove,
  onReject,
}: ImportReviewPanelProps) {
  const metadata = batch.metadata as
    | {
        issues?: Array<{
          rowNumber: number;
          field: string;
          issue: string;
          severity: string;
        }>;
        recordCount?: number;
        supplierCount?: number;
      }
    | null;
  const issues = metadata?.issues ?? [];
  const [reviewNote, setReviewNote] = useState(batch.reviewNotes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await onReject(reviewNote || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const errorIssues = issues.filter((i) => i.severity === "error");
  const warningIssues = issues.filter((i) => i.severity === "warning");

  return (
    <div className="border rounded-lg p-4 mt-2 bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">
            مراجعة الدفعة — {batch.totalLines} سجل
          </span>
        </div>
        <div className="flex items-center gap-2">
          {batch.status === "needs_review" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={submitting}
              >
                <XCircle className="ml-1 h-3 w-3" />
                رفض الكل
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={submitting}
              >
                <CheckCircle2 className="ml-1 h-3 w-3" />
                اعتماد الكل
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
        <span>الإجمالي: {batch.totalLines}</span>
        <span>الصحيح: {batch.validLines}</span>
        <span>الأخطاء: {batch.errorLines}</span>
      </div>

      {errorIssues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-1">
            أخطاء التحقق ({errorIssues.length})
          </p>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {errorIssues.slice(0, 20).map((iss, idx) => (
              <div
                key={idx}
                className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded"
              >
                سطر {iss.rowNumber}: {iss.field} — {iss.issue}
              </div>
            ))}
            {errorIssues.length > 20 && (
              <p className="text-xs text-muted-foreground">
                ... و {errorIssues.length - 20} خطأ آخر
              </p>
            )}
          </div>
        </div>
      )}

      {warningIssues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-amber-600 mb-1">
            تحذيرات ({warningIssues.length})
          </p>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {warningIssues.slice(0, 10).map((iss, idx) => (
              <div
                key={idx}
                className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded"
              >
                سطر {iss.rowNumber}: {iss.field} — {iss.issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {batch.status === "needs_review" && (
        <div className="space-y-1.5">
          <Label className="text-xs">ملاحظات المراجعة</Label>
          <Textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="أدخل ملاحظات المراجعة..."
            className="min-h-[60px]"
          />
        </div>
      )}
    </div>
  );
}
