"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface ExportStatus {
  exportStatus: string;
  exportRequestedAt: string | null;
  exportRequestedById: string | null;
  exportApprovedAt: string | null;
  exportApprovedById: string | null;
  exportRejectedReason: string | null;
  escalatedAt: string | null;
  escalatedToId: string | null;
}

interface ExportApprovalDialogProps {
  recordId: string;
  exportStatus: ExportStatus | null;
  userRole: string | null;
  userId: string;
  onRequestExport: () => Promise<void>;
  onApproveExport: () => Promise<void>;
  onRejectExport: (reason: string) => Promise<void>;
  onDownloadExport: () => Promise<void>;
}

export function ExportApprovalDialog({
  recordId,
  exportStatus,
  userRole,
  userId,
  onRequestExport,
  onApproveExport,
  onRejectExport,
  onDownloadExport,
}: ExportApprovalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = exportStatus?.exportStatus ?? "none";
  const isRequester =
    userId === exportStatus?.exportRequestedById && status === "requested";
  const canRequest = status === "none";
  const canReview = status === "requested" && !isRequester;
  const canDownload = status === "approved";

  async function handleAction(
    action: string,
    fn: () => Promise<void>,
  ) {
    setLoading(action);
    setError(null);
    try {
      await fn();
      setOpen(false);
    } catch {
      setError("فشل تنفيذ الإجراء");
    } finally {
      setLoading(null);
    }
  }

  const statusBadge = () => {
    switch (status) {
      case "none":
        return <Badge variant="outline">لم يُطلب بعد</Badge>;
      case "requested":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="ml-1 h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="ml-1 h-3 w-3" />
            معتمد
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="ml-1 h-3 w-3" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="ml-1 h-4 w-4" />
          تصدير
          {statusBadge()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب تصدير السجل</DialogTitle>
          <DialogDescription>
            إدارة طلب تصدير السجل بصيغة JSON مع الأدلة وسجل التدقيق
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">حالة التصدير</span>
            {statusBadge()}
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
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب رفض طلب التصدير"
                rows={3}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {status === "none" && canRequest && (
            <Button
              onClick={() => handleAction("request", onRequestExport)}
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
                onClick={() => handleAction("approve", onApproveExport)}
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
                onClick={() => setShowRejectInput(true)}
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
                  handleAction("reject", () =>
                    onRejectExport(rejectReason.trim()),
                  );
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
              <Button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                variant="outline"
              >
                إلغاء
              </Button>
            </div>
          )}

          {status === "rejected" && canRequest && (
            <Button
              onClick={() => handleAction("request", onRequestExport)}
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
              onClick={() => handleAction("download", onDownloadExport)}
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
      </DialogContent>
    </Dialog>
  );
}
