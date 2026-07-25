"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";

interface ExportActionButtonsProps {
  status: string;
  canRequest: boolean;
  canReview: boolean;
  canDownload: boolean;
  showRejectInput: boolean;
  loading: string | null;
  rejectReason: string;
  onAction: (action: string, fn: () => Promise<void>) => Promise<void>;
  onShowRejectInput: () => void;
  onCancelReject: () => void;
  onRequestExport: () => Promise<void>;
  onApproveExport: () => Promise<void>;
  onRejectExport: (reason: string) => Promise<void>;
  onDownloadExport: () => Promise<void>;
}

export function ExportActionButtons({
  status,
  canRequest,
  canReview,
  canDownload,
  showRejectInput,
  loading,
  rejectReason,
  onAction,
  onShowRejectInput,
  onCancelReject,
  onRequestExport,
  onApproveExport,
  onRejectExport,
  onDownloadExport,
}: ExportActionButtonsProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      {status === "none" && canRequest && (
        <Button
          onClick={() => onAction("request", onRequestExport)}
          disabled={loading !== null}
          className="w-full sm:w-auto"
        >
          {loading === "request" ? (
            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="ml-1 h-4 w-4" />
          )}
          طلب تصدير
        </Button>
      )}

      {canReview && !showRejectInput && (
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => onAction("approve", onApproveExport)}
            disabled={loading !== null}
            variant="default"
            className="flex-1"
          >
            {loading === "approve" ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="ml-1 h-4 w-4" />
            )}
            اعتماد
          </Button>
          <Button
            onClick={onShowRejectInput}
            disabled={loading !== null}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="ml-1 h-4 w-4" />
            رفض
          </Button>
        </div>
      )}

      {canReview && showRejectInput && (
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => {
              if (!rejectReason.trim()) return;
              onAction("reject", () => onRejectExport(rejectReason.trim()));
            }}
            disabled={loading !== null || !rejectReason.trim()}
            variant="destructive"
          >
            {loading === "reject" ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="ml-1 h-4 w-4" />
            )}
            تأكيد الرفض
          </Button>
          <Button onClick={onCancelReject} variant="outline">
            إلغاء
          </Button>
        </div>
      )}

      {status === "rejected" && canRequest && (
        <Button
          onClick={() => onAction("request", onRequestExport)}
          disabled={loading !== null}
          variant="outline"
        >
          {loading === "request" ? (
            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
          ) : null}
          إعادة طلب
        </Button>
      )}

      {canDownload && (
        <Button
          onClick={() => onAction("download", onDownloadExport)}
          disabled={loading !== null}
        >
          {loading === "download" ? (
            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="ml-1 h-4 w-4" />
          )}
          تنزيل التصدير
        </Button>
      )}
    </DialogFooter>
  );
}
