"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Scale, Loader2 } from "lucide-react";

interface ExportRequestFormProps {
  reason: string;
  onReasonChange: (value: string) => void;
  loading: string | null;
  requiresLegalReview: boolean;
  sensitivityLevel: string;
  onRequest: () => void;
}

export function ExportRequestForm({
  reason,
  onReasonChange,
  loading,
  requiresLegalReview,
  sensitivityLevel,
  onRequest,
}: ExportRequestFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        جهة الاتصال هذه{" "}
        {sensitivityLevel === "confidential" ? "سرية" : "حساسة"} وتتطلب موافقة
        قبل التصدير.
      </p>
      {requiresLegalReview && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 p-2 rounded">
          <Scale className="h-4 w-4" />
          <span>تتطلب مراجعة قانونية قبل التصدير</span>
        </div>
      )}
      <div>
        <label className="text-sm font-medium">سبب طلب التصدير</label>
        <Textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="اذكر سبب طلب التصدير"
          className="mt-1"
        />
      </div>
      <Button
        onClick={onRequest}
        disabled={loading === "request"}
        className="w-full"
      >
        {loading === "request" ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="ml-2 h-4 w-4" />
        )}
        طلب تصدير
      </Button>
    </div>
  );
}
