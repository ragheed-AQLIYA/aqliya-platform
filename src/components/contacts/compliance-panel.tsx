import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, Clock, Scale } from "lucide-react";
import type { ComplianceSummary } from "@/lib/localcontactos/compliance-service";

interface CompliancePanelProps {
  summary: ComplianceSummary;
}

export function CompliancePanel({ summary }: CompliancePanelProps) {
  const sensitivityLabels: Record<string, { label: string; className: string }> = {
    normal: { label: "عادي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    sensitive: { label: "حساس", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    confidential: { label: "سري", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };

  const exportLabels: Record<string, { label: string; className: string }> = {
    none: { label: "لم يطلب", className: "bg-gray-100 text-gray-800" },
    requested: { label: "قيد الموافقة", className: "bg-blue-100 text-blue-800" },
    approved: { label: "معتمد", className: "bg-green-100 text-green-800" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-800" },
    exported: { label: "تم التصدير", className: "bg-purple-100 text-purple-800" },
  };

  const sensitivityEntry = sensitivityLabels[summary.sensitivityLevel] || sensitivityLabels.normal;
  const exportEntry = exportLabels[summary.exportStatus] || exportLabels.none;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          حالة الامتثال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">مستوى الحساسية</span>
          <Badge className={sensitivityEntry.className}>{sensitivityEntry.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">حالة التصدير</span>
          <Badge className={exportEntry.className}>{exportEntry.label}</Badge>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {summary.requiresExportApproval ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span>{summary.requiresExportApproval ? "يتطلب موافقة على التصدير" : "لا يتطلب موافقة"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {summary.requiresLegalReview ? (
              <Scale className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span>{summary.requiresLegalReview ? "يتطلب مراجعة قانونية" : "لا يتطلب مراجعة قانونية"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>الأدلة: {summary.evidenceCount}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">حالة المراجعات</p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>قيد المراجعة: {summary.pendingReviews}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>معتمدة: {summary.approvedReviews}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>مرفوضة: {summary.rejectedReviews}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
