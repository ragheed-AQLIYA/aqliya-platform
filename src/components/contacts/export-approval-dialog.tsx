"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle, AlertTriangle, Scale, Loader2 } from "lucide-react";

interface ExportRequest {
  id: string;
  status: string;
  requestedByName: string | null;
  reason: string | null;
  requiresLegalReview: boolean;
  legalReviewStatus: string | null;
  reviewedByName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  exportedAt: string | null;
  createdAt: string;
}

interface ExportApprovalDialogProps {
  contactId: string;
  exportStatus: string;
  sensitivityLevel: string;
  canExport: boolean;
  hasPendingRequest: boolean;
  requiresExportApproval: boolean;
  requiresLegalReview: boolean;
  exportRequests: ExportRequest[];
}

export function ExportApprovalDialog({
  contactId,
  exportStatus,
  sensitivityLevel,
  canExport,
  hasPendingRequest,
  requiresExportApproval,
  requiresLegalReview,
  exportRequests,
}: ExportApprovalDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    approved: "معتمد",
    rejected: "مرفوض",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  async function handleRequest() {
    setLoading("request");
    try {
      const { requestContactExport } = await import("@/actions/contact-export-actions");
      await requestContactExport(contactId, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleApprove() {
    setLoading("approve");
    try {
      const { approveContactExport } = await import("@/actions/contact-export-actions");
      await approveContactExport(contactId, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading("reject");
    try {
      const { rejectContactExport } = await import("@/actions/contact-export-actions");
      await rejectContactExport(contactId, reason);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleLegalClear(cleared: boolean) {
    setLoading("legal");
    try {
      const { clearLegalReview } = await import("@/actions/contact-export-actions");
      await clearLegalReview(contactId, cleared, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleExport() {
    setLoading("export");
    try {
      const { recordExportDownload } = await import("@/actions/contact-export-actions");
      await recordExportDownload(contactId);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  const pendingRequest = exportRequests.find((r) => r.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          تصدير جهة الاتصال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiresExportApproval && !hasPendingRequest && exportStatus === "none" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              جهة الاتصال هذه {sensitivityLevel === "confidential" ? "سرية" : "حساسة"} وتتطلب موافقة قبل التصدير.
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
                onChange={(e) => setReason(e.target.value)}
                placeholder="اذكر سبب طلب التصدير"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleRequest}
              disabled={loading === "request"}
              className="w-full"
            >
              {loading === "request" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              طلب تصدير
            </Button>
          </div>
        )}

        {hasPendingRequest && pendingRequest && (
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

            {requiresLegalReview && pendingRequest.legalReviewStatus === "pending" && (
              <div className="space-y-2 border rounded-lg p-3 bg-amber-50 dark:bg-amber-950">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  مراجعة قانونية مطلوبة
                </p>
                <div>
                  <label className="text-sm">ملاحظات المراجعة القانونية</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="نتيجة المراجعة القانونية"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLegalClear(true)}
                    disabled={loading === "legal"}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading === "legal" ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <CheckCircle className="ml-1 h-4 w-4" />}
                    موافقة قانونية
                  </Button>
                  <Button
                    onClick={() => handleLegalClear(false)}
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
                onChange={(e) => setReason(e.target.value)}
                placeholder="ملاحظات الموافقة أو الرفض"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={loading === "approve" || (requiresLegalReview && pendingRequest.legalReviewStatus !== "cleared")}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {loading === "approve" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                اعتماد التصدير
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading === "reject" || !reason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {loading === "reject" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <XCircle className="ml-2 h-4 w-4" />}
                رفض
              </Button>
            </div>
          </div>
        )}

        {exportStatus === "approved" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                تمت الموافقة على التصدير
              </span>
            </div>
            {pendingRequest?.reviewedByName && (
              <p className="text-xs text-muted-foreground">
                اعتمد بواسطة: {pendingRequest.reviewedByName}
              </p>
            )}
            <Button onClick={handleExport} disabled={loading === "export"} className="w-full">
              {loading === "export" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              تصدير الملف الشخصي
            </Button>
          </div>
        )}

        {exportStatus === "rejected" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                تم رفض طلب التصدير
              </span>
            </div>
            {pendingRequest?.reviewNote && (
              <p className="text-sm text-muted-foreground">
                سبب الرفض: {pendingRequest.reviewNote}
              </p>
            )}
            <Button onClick={handleRequest} disabled={loading === "request"} variant="outline" className="w-full">
              إعادة طلب التصدير
            </Button>
          </div>
        )}

        {exportStatus === "exported" && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              تم تصدير هذا الملف الشخصي
            </span>
          </div>
        )}

        {!requiresExportApproval && exportStatus === "none" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              يمكن تصدير جهة الاتصال هذه بدون موافقة مسبقة.
            </p>
            <Button onClick={handleExport} disabled={loading === "export"} className="w-full">
              {loading === "export" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              تصدير الملف الشخصي
            </Button>
          </div>
        )}

        {exportRequests.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">سجل طلبات التصدير</p>
            {exportRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between text-xs">
                <span>
                  {req.requestedByName || "مستخدم"} —{" "}
                  <Badge className={statusColors[req.status] || ""}>
                    {statusLabels[req.status] || req.status}
                  </Badge>
                </span>
                <span className="text-muted-foreground">
                  {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
