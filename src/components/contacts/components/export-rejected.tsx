"use client";

import { Button } from "@/components/ui/button";
import { XCircle, Download, Loader2 } from "lucide-react";

interface ExportRejectedProps {
  reviewNote: string | null;
  loading: string | null;
  onRetry: () => void;
}

export function ExportRejected({
  reviewNote,
  loading,
  onRetry,
}: ExportRejectedProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-red-700 dark:text-red-300">
          تم رفض طلب التصدير
        </span>
      </div>
      {reviewNote && (
        <p className="text-sm text-muted-foreground">
          سبب الرفض: {reviewNote}
        </p>
      )}
      <Button
        onClick={onRetry}
        disabled={loading === "request"}
        variant="outline"
        className="w-full"
      >
        {loading === "request" ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="ml-2 h-4 w-4" />
        )}
        إعادة طلب التصدير
      </Button>
    </div>
  );
}
