"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Loader2 } from "lucide-react";

interface ExportApprovedProps {
  reviewedByName: string | null;
  loading: string | null;
  onExport: () => void;
}

export function ExportApproved({
  reviewedByName,
  loading,
  onExport,
}: ExportApprovedProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          تمت الموافقة على التصدير
        </span>
      </div>
      {reviewedByName && (
        <p className="text-xs text-muted-foreground">
          اعتمد بواسطة: {reviewedByName}
        </p>
      )}
      <Button
        onClick={onExport}
        disabled={loading === "export"}
        className="w-full"
      >
        {loading === "export" ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="ml-2 h-4 w-4" />
        )}
        تصدير الملف الشخصي
      </Button>
    </div>
  );
}
