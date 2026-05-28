"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import { getDecisionById } from "@/actions/decisions";
import {
  getApprovalStatus,
  submitForReview,
  approveDecision,
  approveWithConditions,
  rejectDecision,
  requestRevision,
  getRecommendationDiff,
  requestReReview,
  getDecisionTimeline,
} from "@/actions/approval";
import { getDecisionExportData } from "@/actions/decision-export";
import {
  formatExportJSON,
  formatExportMarkdown,
} from "@/lib/decision/decision-export-formats";
import { FileDiff, AlertTriangle, Clock, Download, Copy } from "lucide-react";
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff";
import type { TimelineEvent } from "@/lib/decision/decision-timeline";

function getStatusVariant(status: string) {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "IN_REVIEW":
      return "default";
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "ARCHIVED":
      return "outline";
    default:
      return "secondary";
  }
}

function getApprovalVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

function getGovernanceNextStep(
  status: string,
  canApprove: boolean,
  canSubmitForReview: boolean,
) {
  if (canSubmitForReview) return "استكمال مواد الدعم ثم إرسال القرار للمراجعة";
  if (canApprove)
    return "مراجعة التوصية والأدلة ثم الاعتماد أو إعادة القرار للمراجعة";
  if (status === "IN_REVIEW") return "القرار بانتظار إجراء من المعتمِد";
  if (status === "APPROVED")
    return "يمكن تجهيز سجل التصدير أو متابعة النشر وفق الحوكمة";
  if (status === "REJECTED")
    return "يتطلب القرار إعادة عمل قبل دورة اعتماد جديدة";
  return "استكمل مسار القرار قبل الاعتماد";
}

export default function GovernancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [decision, setDecision] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");
  const [notes, setNotes] = useState("");
  const [conditions, setConditions] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showConditionsForm, setShowConditionsForm] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState<{
    fields: FieldDiff[];
    changeCount: number;
    summary: string;
  } | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [showReReviewForm, setShowReReviewForm] = useState(false);
  const [reReviewReason, setReReviewReason] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "markdown" | null>(
    null,
  );
  const [exportData, setExportData] = useState<string | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params;
      setId(decisionId);
    };
    getId();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const [decisionResult, approvalResult] = await Promise.all([
        getDecisionById(id),
        getApprovalStatus(id),
      ]);

      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
        setUserRole(decisionResult.data.owner?.role || "VIEWER");
      }

      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }

      setLoading(false);
    };
    loadData();
  }, [id]);

  async function handleSubmitForReview() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await submitForReview(id);
    if (result.success) {
      setSuccess("تم إرسال القرار للمراجعة");
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في إرسال القرار للمراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleApprove() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const needsOverride = !approvalStatus?.hasRecommendation;
    const result = await approveDecision(
      id,
      notes,
      needsOverride ? overrideReason : undefined,
    );
    if (result.success) {
      setSuccess("تم اعتماد القرار");
      setNotes("");
      setOverrideReason("");
      setShowApproveForm(false);
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في اعتماد القرار");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleApproveWithConditions() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const needsOverride = !approvalStatus?.hasRecommendation;
    const result = await approveWithConditions(
      id,
      conditions,
      needsOverride ? overrideReason : undefined,
    );
    if (result.success) {
      setSuccess("تم اعتماد القرار مع الشروط");
      setConditions("");
      setOverrideReason("");
      setShowConditionsForm(false);
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في الاعتماد مع الشروط");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleReject() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await rejectDecision(id, notes);
    if (result.success) {
      setSuccess("تم رفض القرار");
      setNotes("");
      setShowRejectForm(false);
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في رفض القرار");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleRequestRevision() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await requestRevision(id, notes);
    if (result.success) {
      setSuccess("طلب مراجعة — تمت إعادة القرار للمسودة");
      setNotes("");
      setShowRejectForm(false);
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في طلب المراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleLoadDiff() {
    if (!id) return;
    setLoadingDiff(true);
    const result = await getRecommendationDiff(id);
    if (result.success && result.data) {
      setDiffData({
        fields: result.data.diff.fields,
        changeCount: result.data.diff.changeCount,
        summary: result.data.summary,
      });
      setShowDiff(true);
    } else {
      setError(result.error || "فشل في تحميل الفروقات");
    }
    setLoadingDiff(false);
  }

  async function handleRequestReReview() {
    if (!id) return;
    if (!reReviewReason.trim()) {
      setError("سبب إعادة المراجعة مطلوب");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await requestReReview(id, reReviewReason);
    if (result.success) {
      setSuccess("طلب إعادة مراجعة — تمت إعادة القرار للمسودة");
      setReReviewReason("");
      setShowReReviewForm(false);
      setShowDiff(false);
      const approvalResult = await getApprovalStatus(id);
      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }
      const decisionResult = await getDecisionById(id);
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
      }
    } else {
      setError(result.error || "فشل في طلب إعادة المراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleLoadTimeline() {
    if (!id) return;
    setLoadingTimeline(true);
    const result = await getDecisionTimeline(id);
    if (result.success && result.data) {
      setTimeline(result.data);
    }
    setLoadingTimeline(false);
  }

  async function handleExport(format: "json" | "markdown") {
    if (!id) return;
    setLoadingExport(true);
    setExportFormat(format);
    const result = await getDecisionExportData(id, format);
    if (result.success && result.data) {
      const content =
        format === "json"
          ? formatExportJSON(result.data)
          : formatExportMarkdown(result.data);
      setExportData(content);
    } else {
      setError(result.error || "Failed to export");
    }
    setLoadingExport(false);
  }

  function handleCopyExport() {
    if (exportData) {
      navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownloadExport() {
    if (!exportData || !exportFormat) return;
    const extension = exportFormat === "json" ? "json" : "md";
    const mimeType =
      exportFormat === "json" ? "application/json" : "text/markdown";
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-export-${id}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div>
        <DecisionTabs decisionId={id} />
        <div className="mt-6 text-center text-muted-foreground">
          القرار غير موجود
        </div>
      </div>
    );
  }

  const status = approvalStatus?.status || decision.status;
  const canSubmitForReview = userRole === "OPERATOR" && status === "DRAFT";
  const canApprove = userRole === "ADMIN" && status === "IN_REVIEW";
  const hasRecommendation = approvalStatus?.hasRecommendation;
  const approvedSnapshot = approvalStatus?.approvedSnapshot;
  const recommendationDiffers = approvalStatus?.recommendationDiffers;
  const isLegacySnapshot = approvalStatus?.isLegacySnapshot;
  const evidenceCount = approvalStatus?.evidenceCount || 0;
  const latestEvidenceAt = approvalStatus?.latestEvidenceAt;
  const humanReviewRequired =
    approvalStatus?.recommendationSummary?.humanReviewRequired ??
    decision.recommendation?.humanReviewRequired ??
    true;
  const nextStep = getGovernanceNextStep(
    status,
    canApprove,
    canSubmitForReview,
  );
  const governanceWarnings = [
    !hasRecommendation ? "لا توجد توصية حالية مرتبطة بهذا القرار." : null,
    evidenceCount === 0
      ? "لا توجد أدلة دعم مرفقة حتى الآن، ما يضعف قابلية المراجعة والتتبع."
      : null,
    humanReviewRequired
      ? "هذا القرار يتطلب مراجعة بشرية صريحة قبل الاعتماد أو الاعتماد على التصدير."
      : null,
    status !== "APPROVED"
      ? "أي تصدير يتم تجهيزه الآن يجب التعامل معه كمسودة تشغيلية غير نهائية."
      : null,
  ].filter(Boolean) as string[];

  return (
    <div>
      <DecisionTabs decisionId={id} decisionType={decision.type} />
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">الحوكمة والاعتماد</h2>
            <p className="text-sm text-muted-foreground">
              مراجعة واعتماد وتدقيق دورة حياة القرار.
            </p>
          </div>
          <Badge variant={getStatusVariant(status)}>
            {status.replace("_", " ")}
          </Badge>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">جاهزية الحوكمة</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                التوصية الحالية
              </div>
              <div className="mt-1 font-medium">
                {hasRecommendation ? "موجودة" : "غير موجودة"}
              </div>
              <Badge
                variant={hasRecommendation ? "default" : "secondary"}
                className="mt-2"
              >
                {hasRecommendation ? "جاهزة للمراجعة" : "تحتاج استكمال"}
              </Badge>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">مواد الدعم</div>
              <div className="mt-1 font-medium">{evidenceCount} مستند</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {latestEvidenceAt
                  ? `آخر إضافة: ${new Date(latestEvidenceAt).toLocaleString()}`
                  : "لا توجد أدلة مرفقة بعد"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                المراجعة البشرية
              </div>
              <div className="mt-1 font-medium">
                {humanReviewRequired ? "مطلوبة" : "غير مطلوبة صراحة"}
              </div>
              <Badge
                variant={humanReviewRequired ? "secondary" : "outline"}
                className="mt-2"
              >
                {humanReviewRequired
                  ? "بوابة إلزامية"
                  : "تحقق من السياسة قبل النشر"}
              </Badge>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                الخطوة الحالية
              </div>
              <div className="mt-1 font-medium">{status.replace("_", " ")}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {nextStep}
              </div>
            </Card>
          </div>

          {governanceWarnings.length > 0 && (
            <Card className="mt-4 border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">
                    تنبيهات الحوكمة الحالية
                  </h4>
                  <ul className="mt-2 list-disc pr-5 text-sm text-amber-700 space-y-1">
                    {governanceWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </section>

        {recommendationDiffers && (
          <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  توصية تغيّرت منذ الاعتماد
                </h3>
                <p className="text-sm text-amber-700">
                  التوصية الحالية تختلف عن اللقطة المعتمدة غير القابلة للتعديل.
                  النسخة المعتمدة محفوظة أدناه.
                </p>
                {diffData && (
                  <p className="text-sm text-amber-700 mt-1 font-medium">
                    {diffData.summary}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDiff(!showDiff);
                      if (!showDiff && !diffData) handleLoadDiff();
                    }}
                  >
                    <FileDiff className="h-4 w-4 mr-1" />
                    {showDiff
                      ? "إخفاء الفروقات"
                      : loadingDiff
                        ? "جارٍ التحميل..."
                        : "عرض الفروقات"}
                  </Button>
                  {(status === "APPROVED" || status === "IN_REVIEW") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowReReviewForm(!showReReviewForm)}
                    >
                      طلب إعادة مراجعة
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {showDiff && diffData && (
          <Card className="p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3">
              فروقات جنباً إلى جنب — {diffData.changeCount} حقل/حقول تغيّرت
            </h3>
            <div className="space-y-2">
              {diffData.fields
                .filter((f) => f.changed)
                .map((field) => (
                  <div
                    key={field.field}
                    className="grid grid-cols-2 gap-3 text-sm"
                  >
                    <div className="rounded border border-green-200 bg-green-50 p-3">
                      <div className="text-xs font-medium text-green-700 mb-1">
                        المعتمد: {field.label}
                      </div>
                      <div className="whitespace-pre-wrap text-xs text-green-900">
                        {field.approvedValue ?? "(فارغ)"}
                      </div>
                    </div>
                    <div className="rounded border border-red-200 bg-red-50 p-3">
                      <div className="text-xs font-medium text-red-700 mb-1">
                        الحالي: {field.label}
                      </div>
                      <div className="whitespace-pre-wrap text-xs text-red-900">
                        {field.currentValue ?? "(فارغ)"}
                      </div>
                    </div>
                  </div>
                ))}
              {diffData.fields.filter((f) => !f.changed).length > 0 && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {diffData.fields.filter((f) => !f.changed).length} حقل/حقول
                  غير متغيرة:{" "}
                  {diffData.fields
                    .filter((f) => !f.changed)
                    .map((f) => f.label)
                    .join(", ")}
                </div>
              )}
            </div>
          </Card>
        )}

        {showReReviewForm && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <h3 className="text-sm font-semibold text-red-800 mb-3">
              طلب إعادة مراجعة
            </h3>
            <p className="text-sm text-red-700 mb-3">
              سيعيد القرار إلى حالة المسودة ويتطلب دورة مراجعة جديدة.
            </p>
            <Label htmlFor="rereview-reason">السبب (مطلوب)</Label>
            <Textarea
              id="rereview-reason"
              value={reReviewReason}
              onChange={(e) => setReReviewReason(e.target.value)}
              placeholder="اشرح سبب الحاجة لإعادة المراجعة..."
              className="mt-1"
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRequestReReview}
                disabled={saving || !reReviewReason.trim()}
              >
                {saving ? "جارٍ الطلب..." : "تأكيد إعادة المراجعة"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReReviewForm(false)}
              >
                إلغاء
              </Button>
            </div>
          </Card>
        )}

        {isLegacySnapshot && approvedSnapshot && (
          <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
            <h3 className="text-sm font-semibold text-amber-800 mb-1">
              لقطة اعتماد سابقة
            </h3>
            <p className="text-sm text-amber-700">
              تم إنشاء هذا الاعتماد قبل إدخال اللقطات غير القابلة للتعديل. يُعرض
              المحتوى من سجل التوصية المرتبط، وقد يكون قد تغيّر منذ الاعتماد.
            </p>
          </Card>
        )}

        {!hasRecommendation && status === "IN_REVIEW" && (
          <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              لم تُنشأ توصية بعد. يُفضّل تشغيل المحاكاة قبل الاعتماد، أو تقديم
              سبب التجاوز.
            </p>
          </Card>
        )}

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">أدوار القرار</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">المالك</div>
              <div className="font-medium">
                {decision.owner?.name || "غير معيّن"}
              </div>
              <div className="text-xs text-muted-foreground">
                {decision.owner?.email}
              </div>
              <Badge variant="outline" className="mt-1">
                {decision.owner?.role}
              </Badge>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">المراجع</div>
              <div className="font-medium">
                {decision.reviewer?.name || "غير معيّن"}
              </div>
              <div className="text-xs text-muted-foreground">
                {decision.reviewer?.email}
              </div>
              <Badge variant="outline" className="mt-1">
                {decision.reviewer?.role}
              </Badge>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">المعتمِد</div>
              <div className="font-medium">
                {decision.approver?.name || "غير معيّن"}
              </div>
              <div className="text-xs text-muted-foreground">
                {decision.approver?.email}
              </div>
              <Badge variant="outline" className="mt-1">
                {decision.approver?.role}
              </Badge>
            </Card>
          </div>
        </section>

        {approvedSnapshot && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              لقطة التوصية المعتمدة
              {approvedSnapshot.isImmutable ? (
                <Badge variant="default">لقطة غير قابلة للتعديل</Badge>
              ) : (
                <Badge variant="secondary">سابقة — غير مجمّدة</Badge>
              )}
            </h3>
            <Card
              className={`p-4 ${approvedSnapshot.isImmutable ? "border-2 border-primary/20" : "border border-amber-200"}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    معتمَد من {approvedSnapshot.approver}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(approvedSnapshot.approvedAt).toLocaleString()}
                  </span>
                </div>
                {approvedSnapshot.confidence != null && (
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">الثقة:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(approvedSnapshot.confidence * 100)}%
                      </span>
                    </div>
                    {approvedSnapshot.score != null && (
                      <div>
                        <span className="text-muted-foreground">النتيجة:</span>
                        <span className="ml-2 font-medium">
                          {approvedSnapshot.score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">الإجراء:</span>
                  <span className="ml-2 font-medium">
                    {approvedSnapshot.recommendedAction}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">المبرّر:</span>
                  <p className="mt-1 text-sm">{approvedSnapshot.rationale}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    الحالة التالية المتوقّعة:
                  </span>
                  <p className="mt-1 text-sm">
                    {approvedSnapshot.expectedNextState}
                  </p>
                </div>
                {approvedSnapshot.scopeExclusions && (
                  <div>
                    <span className="text-muted-foreground">
                      استثناءات النطاق:
                    </span>
                    <p className="mt-1 text-sm">
                      {approvedSnapshot.scopeExclusions}
                    </p>
                  </div>
                )}
                {approvedSnapshot.assumptionsUsed && (
                  <div>
                    <span className="text-muted-foreground">الافتراضات:</span>
                    <p className="mt-1 text-sm">
                      {approvedSnapshot.assumptionsUsed}
                    </p>
                  </div>
                )}
                {approvedSnapshot.risksAccepted && (
                  <div>
                    <span className="text-muted-foreground">
                      المخاطر المقبولة:
                    </span>
                    <p className="mt-1 text-sm">
                      {approvedSnapshot.risksAccepted}
                    </p>
                  </div>
                )}
                {approvedSnapshot.risksRejected && (
                  <div>
                    <span className="text-muted-foreground">
                      المخاطر المرفوضة:
                    </span>
                    <p className="mt-1 text-sm">
                      {approvedSnapshot.risksRejected}
                    </p>
                  </div>
                )}
                {approvedSnapshot.risks && (
                  <div>
                    <span className="text-muted-foreground">
                      المخاطر (JSON):
                    </span>
                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {typeof approvedSnapshot.risks === "string"
                        ? approvedSnapshot.risks
                        : JSON.stringify(approvedSnapshot.risks, null, 2)}
                    </pre>
                  </div>
                )}
                {approvedSnapshot.nextActions && (
                  <div>
                    <span className="text-muted-foreground">
                      الإجراءات التالية (JSON):
                    </span>
                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {typeof approvedSnapshot.nextActions === "string"
                        ? approvedSnapshot.nextActions
                        : JSON.stringify(approvedSnapshot.nextActions, null, 2)}
                    </pre>
                  </div>
                )}
                {approvedSnapshot.conditions && (
                  <div>
                    <span className="text-muted-foreground">الشروط:</span>
                    <p className="mt-1 text-sm text-amber-700">
                      {approvedSnapshot.conditions}
                    </p>
                  </div>
                )}
                {approvedSnapshot.overrideReason && (
                  <div>
                    <span className="text-muted-foreground">سبب التجاوز:</span>
                    <p className="mt-1 text-sm text-red-600">
                      {approvedSnapshot.overrideReason}
                    </p>
                  </div>
                )}
                {recommendationDiffers &&
                  approvalStatus?.recommendationSummary && (
                    <div className="pt-3 border-t mt-3">
                      <h4 className="text-sm font-semibold text-amber-700 mb-2">
                        التوصية الحالية (تختلف عن المعتمدة)
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">الحالي:</span>{" "}
                        {approvalStatus.recommendationSummary.action}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        آخر تحديث:{" "}
                        {new Date(
                          approvalStatus.recommendationSummary.updatedAt,
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          </section>
        )}

        {approvalStatus?.recommendationSummary && !approvedSnapshot && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">التوصية الحالية</h3>
            <Card className="p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">الإجراء:</span>
                  <span className="ml-2 font-medium">
                    {approvalStatus.recommendationSummary.action}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">المبرّر:</span>
                  <p className="mt-1 text-sm">
                    {approvalStatus.recommendationSummary.rationale}
                  </p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {(canSubmitForReview || canApprove) && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">إجراءات الاعتماد</h3>
            <Card className="p-4">
              {evidenceCount === 0 && (
                <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  لا توجد أدلة مرفقة لهذا القرار حتى الآن. يمكن متابعة المسار
                  الحالي، لكن الأفضل إرفاق مواد دعم قبل الإرسال للمراجعة أو
                  الاعتماد.
                </div>
              )}

              {canSubmitForReview && (
                <Button onClick={handleSubmitForReview} disabled={saving}>
                  {saving ? "جارٍ الإرسال..." : "إرسال للمراجعة"}
                </Button>
              )}

              {canApprove && (
                <div className="space-y-4">
                  {!hasRecommendation && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      لا توجد توصية. قدّم سبب تجاوز للاعتماد بدونها.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => setShowApproveForm(!showApproveForm)}
                    >
                      اعتماد
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowConditionsForm(!showConditionsForm)}
                    >
                      اعتماد مع شروط
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectForm(!showRejectForm)}
                    >
                      رفض / طلب مراجعة
                    </Button>
                  </div>

                  {showApproveForm && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="approve-notes">
                        ملاحظات الاعتماد (اختياري)
                      </Label>
                      <Textarea
                        id="approve-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أضف ملاحظات لسجل الاعتماد..."
                      />
                      {!hasRecommendation && (
                        <>
                          <Label htmlFor="override-reason">
                            سبب التجاوز (مطلوب — لا توجد توصية)
                          </Label>
                          <Textarea
                            id="override-reason"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="اشرح سبب اعتمادك بدون توصية..."
                            required
                          />
                        </>
                      )}
                      <Button
                        onClick={handleApprove}
                        disabled={
                          saving ||
                          (!hasRecommendation && !overrideReason.trim())
                        }
                      >
                        {saving ? "جارٍ الاعتماد..." : "تأكيد الاعتماد"}
                      </Button>
                    </div>
                  )}

                  {showConditionsForm && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="conditions">الشروط (مطلوبة)</Label>
                      <Textarea
                        id="conditions"
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        placeholder="حدّد الشروط التي يجب استيفاؤها..."
                        required
                      />
                      {!hasRecommendation && (
                        <>
                          <Label htmlFor="override-reason-conditions">
                            سبب التجاوز (مطلوب — لا توجد توصية)
                          </Label>
                          <Textarea
                            id="override-reason-conditions"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="اشرح سبب اعتمادك بدون توصية..."
                            required
                          />
                        </>
                      )}
                      <Button
                        onClick={handleApproveWithConditions}
                        disabled={
                          saving ||
                          !conditions.trim() ||
                          (!hasRecommendation && !overrideReason.trim())
                        }
                      >
                        {saving ? "جارٍ الاعتماد..." : "اعتماد مع الشروط"}
                      </Button>
                    </div>
                  )}

                  {showRejectForm && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="reject-reason">السبب (مطلوب)</Label>
                      <Textarea
                        id="reject-reason"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="اشرح سبب رفض هذا القرار أو حاجته للمراجعة..."
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={saving || !notes.trim()}
                        >
                          {saving ? "جارٍ الرفض..." : "رفض القرار"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleRequestRevision}
                          disabled={saving || !notes.trim()}
                        >
                          {saving ? "جارٍ الطلب..." : "طلب مراجعة"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </section>
        )}

        {approvalStatus?.latestApproval && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">آخر اعتماد</h3>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {approvalStatus.latestApproval.approver || "غير معروف"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {approvalStatus.latestApproval.comments}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(
                      approvalStatus.latestApproval.createdAt,
                    ).toLocaleString()}
                  </div>
                  {approvalStatus.latestApproval.recommendationId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      معرف التوصية:{" "}
                      {approvalStatus.latestApproval.recommendationId}
                    </div>
                  )}
                </div>
                <Badge
                  variant={getApprovalVariant(
                    approvalStatus.latestApproval.status,
                  )}
                >
                  {approvalStatus.latestApproval.status}
                </Badge>
              </div>
            </Card>
          </section>
        )}

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">سجل الاعتماد</h3>
          {approvalStatus?.approvals?.length > 0 ? (
            <div className="space-y-2">
              {approvalStatus.approvals.map((approval: any) => (
                <Card key={approval.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {approval.approver?.name || "غير معروف"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {approval.comments}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(approval.createdAt).toLocaleString()}
                      </div>
                      {approval.recommendationId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          اللقطة: {approval.recommendationId}
                        </div>
                      )}
                    </div>
                    <Badge variant={getApprovalVariant(approval.status)}>
                      {approval.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد اعتمادات بعد
            </p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">سجل تدقيق المراجعة</h3>
          {approvalStatus?.reviewActions?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراء</TableHead>
                  <TableHead>بواسطة</TableHead>
                  <TableHead>التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvalStatus.reviewActions.map((action: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      {new Date(action.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {action.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{action.user || "غير معروف"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {action.details?.reason ||
                        action.details?.conditions ||
                        action.details?.notes ||
                        action.details?.overrideReason ||
                        "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد إجراءات مراجعة بعد
            </p>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              الخط الزمني للقرار
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadTimeline}
              disabled={loadingTimeline}
            >
              {loadingTimeline
                ? "جارٍ التحميل..."
                : timeline.length > 0
                  ? "تحديث الخط الزمني"
                  : "تحميل الخط الزمني"}
            </Button>
          </div>
          {timeline.length > 0 && (
            <div className="space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${event.isCritical ? "bg-red-500" : event.category === "governance" ? "bg-amber-500" : event.category === "publication" ? "bg-blue-500" : "bg-muted"}`}
                    />
                    {i < timeline.length - 1 && (
                      <div className="w-px h-8 bg-border" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {event.label}
                        </span>
                        {event.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            حرج
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                    {event.actor && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        بواسطة: {event.actor}
                      </p>
                    )}
                    {event.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="h-5 w-5" />
              تصدير
            </h3>
          </div>
          <Card className="mb-4 border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-900 space-y-1">
              <p className="font-semibold">تجهيز سجل التصدير</p>
              <p>
                هذا الإجراء يجهز نسخة JSON أو Markdown من سجل القرار الحالي
                للمراجعة أو الأرشفة. لا يعني ذلك اعتمادًا نهائيًا أو نشرًا
                خارجيًا.
              </p>
              <p className="text-xs text-blue-700">
                يتم تسجيل تجهيز التصدير في سجل المنصة، ويجب التعامل مع أي ملف
                ناتج كمسودة تشغيلية إذا لم تكن حالة القرار معتمدة.
              </p>
            </div>
          </Card>
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={loadingExport}
            >
              تجهيز JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("markdown")}
              disabled={loadingExport}
            >
              تجهيز Markdown
            </Button>
          </div>
          {exportData && (
            <div className="space-y-2">
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {status === "APPROVED"
                  ? "القرار معتمد، لكن ما يزال الملف الناتج سجلًا تشغيليًا يجب استخدامه ضمن سياق الحوكمة المؤسسية."
                  : "القرار غير معتمد حاليًا، لذلك يجب التعامل مع هذا التصدير كمسودة تشغيلية للمراجعة فقط."}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadExport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  تحميل الملف
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyExport}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? "تم النسخ!" : "نسخ المحتوى"}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                {exportData}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
