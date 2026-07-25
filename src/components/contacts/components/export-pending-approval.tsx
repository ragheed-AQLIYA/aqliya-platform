"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Scale,
  Loader2,
} from "lucide-react";
import type { ExportRequest } from "./use-export-approval";

interface ExportPendingApprovalProps {
  pendingRequest: ExportRequest;
  reason: string;
  onReasonChange: (value: string) => void;
  loading: string | null;
  requiresLegalReview: boolean;
  onApprove: () => void;
  onReject: () => void;
  onLegalClear: (cleared: boolean) => void;
}

export function ExportPendingApproval({
  pendingRequest,
  reason,
  onReasonChange,
  loading,
  requiresLegalReview,
  onApprove,
  onReject,
  onLegalClear,
}: ExportPendingApprovalProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-100 text-blue-800">بانتظار الموافقة</Badge>
      </div>
      {pendingRequest.requestedByName && (
        <p className="text-sm text-muted-foreground">
          طلب من: {pendingRequest.requestedByName}
        </p>
      )}
      {pendingRequest.reason && (
        <p className="text-sm text-muted-foreground">
          السبب: {pendingRequest.reason}
        </p>
      )}

      {requiresLegalReview &&
        pendingRequest.legalReviewStatus === "pending" && (
          <div className="space-y-2 border rounded-lg p-3 bg-amber-50 dark:bg-amber-950">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              مراجعة قانونية مطلوبة
            </p>
            <div>
              <label className="text-sm">ملاحظات المراجعة القانونية</label>
              <Textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="نتيجة المراجعة القانونية"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onLegalClear(true)}
                disabled={loading === "legal"}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading === "legal" ? (
                  <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="ml-1 h-4 w-4" />
                )}
                موافقة قانونية
              </Button>
              <Button
                onClick={() => onLegalClear(false)}
                disabled={loading === "legal"}
                size="sm"
                variant="destructive"
              >
                <XCircle className="ml-1 h-4 w-4" />
                منع
              </Button>
            </div>
          </div>
        )}

      <div>
        <label className="text-sm font-medium">ملاحظات الموافقة</label>
        <Textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="ملاحظات الموافقة أو الرفض"
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onApprove}
          disabled={
            loading === "approve" ||
            (requiresLegalReview &&
              pendingRequest.legalReviewStatus !== "cleared")
          }
          className="bg-green-600 hover:bg-green-700 flex-1"
        >
          {loading === "approve" ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="ml-2 h-4 w-4" />
          )}
          اعتماد التصدير
        </Button>
        <Button
          onClick={onReject}
          disabled={loading === "reject" || !reason.trim()}
          variant="destructive"
          className="flex-1"
        >
          {loading === "reject" ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="ml-2 h-4 w-4" />
          )}
          رفض
        </Button>
      </div>
    </div>
  );
}
