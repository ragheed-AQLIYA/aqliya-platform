"use client";

import { Clock, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ExportStatusBadge } from "./export-status-badge";
import type { ExportStatus } from "./use-export-approval";

interface ExportStatusInfoProps {
  status: string;
  exportStatus: ExportStatus | null;
  canRequest: boolean;
  showRejectInput: boolean;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  error: string | null;
}

export function ExportStatusInfo({
  status,
  exportStatus,
  canRequest,
  showRejectInput,
  rejectReason,
  onRejectReasonChange,
  error,
}: ExportStatusInfoProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">حالة التصدير</span>
        <ExportStatusBadge status={status} />
      </div>

      {status === "none" && canRequest && (
        <p className="text-sm text-muted-foreground">
          يمكنك طلب تصدير هذا السجل. سيحتاج الطلب إلى مراجعة واعتماد قبل التنزيل.
        </p>
      )}

      {status === "requested" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>في انتظار المراجعة</span>
          </div>
          {exportStatus?.escalatedAt && (
            <div className="flex items-center gap-2 text-sm text-status-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>تم تصعيد الطلب</span>
            </div>
          )}
        </div>
      )}

      {status === "rejected" && exportStatus?.exportRejectedReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">سبب الرفض</p>
          <p className="text-sm text-red-600 mt-1">
            {exportStatus.exportRejectedReason}
          </p>
        </div>
      )}

      {status === "approved" && (
        <p className="text-sm text-green-600">
          تم اعتماد التصدير. يمكنك الآن تنزيل ملف JSON.
        </p>
      )}

      {showRejectInput && (
        <div className="space-y-2">
          <label className="text-sm font-medium">سبب الرفض</label>
          <Textarea
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="أدخل سبب رفض طلب التصدير"
            rows={3}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
