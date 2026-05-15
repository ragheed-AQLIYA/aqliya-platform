"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getDecisionOutcome,
  upsertDecisionOutcome,
  reviewDecisionOutcome,
} from "@/actions/decision-outcomes";
import { getDecisionById } from "@/actions/decisions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { OutcomeStatus } from "@prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "PARTIAL_SUCCESS":
      return <AlertCircle className="h-5 w-5 text-amber-600" />;
    case "FAILURE":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "SUCCESS":
      return "default";
    case "PARTIAL_SUCCESS":
      return "secondary";
    case "FAILURE":
      return "destructive";
    default:
      return "outline";
  }
}

export default function OutcomePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<any>(null);
  const [outcomeData, setOutcomeData] = useState<any>(null);
  const [formData, setFormData] = useState({
    expectedOutcome: "",
    actualOutcome: "",
    outcomeStatus: "UNKNOWN" as OutcomeStatus,
    actualValue: "",
    expectedValue: "",
    lessonsLearned: "",
    followUpActions: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("VIEWER");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const [decisionResult, outcomeResult] = await Promise.all([
        getDecisionById(id),
        getDecisionOutcome(id),
      ]);

      if (cancelled) return;

      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
        setCurrentUserRole(decisionResult.data.owner?.role || "VIEWER");
      }

      if (outcomeResult.success && outcomeResult.data) {
        setOutcomeData(outcomeResult.data);
        if (outcomeResult.data.outcome) {
          const o = outcomeResult.data.outcome;
          setFormData({
            expectedOutcome:
              o.expectedOutcome || outcomeResult.data.expectedOutcome || "",
            actualOutcome: o.actualOutcome || "",
            outcomeStatus: o.outcomeStatus || "UNKNOWN",
            actualValue: o.actualValue?.toString() || "",
            expectedValue: o.expectedValue?.toString() || "",
            lessonsLearned: o.lessonsLearned || "",
            followUpActions: o.followUpActions
              ? JSON.stringify(o.followUpActions, null, 2)
              : "",
          });
        } else if (outcomeResult.data.expectedOutcome) {
          setFormData((prev) => ({
            ...prev,
            expectedOutcome: outcomeResult.data.expectedOutcome || "",
          }));
        }
      }

      setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    const followUpActions = formData.followUpActions.trim()
      ? (() => {
          try {
            return JSON.parse(formData.followUpActions);
          } catch {
            return null;
          }
        })()
      : null;

    const result = await upsertDecisionOutcome({
      decisionId: id,
      expectedOutcome: formData.expectedOutcome,
      actualOutcome: formData.actualOutcome || undefined,
      outcomeStatus: formData.outcomeStatus,
      actualValue: formData.actualValue
        ? parseFloat(formData.actualValue)
        : undefined,
      expectedValue: formData.expectedValue
        ? parseFloat(formData.expectedValue)
        : undefined,
      lessonsLearned: formData.lessonsLearned || undefined,
      followUpActions: followUpActions || undefined,
    });

    if (result.success) {
      setSuccess("تم حفظ النتيجة بنجاح");
      const outcomeResult = await getDecisionOutcome(id);
      if (outcomeResult.success && outcomeResult.data) {
        setOutcomeData(outcomeResult.data);
      }
    } else {
      setError(result.error || "فشل في حفظ النتيجة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleReview() {
    setSaving(true);
    setError("");
    const result = await reviewDecisionOutcome(id);
    if (result.success) {
      setSuccess("تمت مراجعة النتيجة");
      const outcomeResult = await getDecisionOutcome(id);
      if (outcomeResult.success && outcomeResult.data) {
        setOutcomeData(outcomeResult.data);
      }
    } else {
      setError(result.error || "فشل في مراجعة النتيجة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isApproved =
    decision?.status === "APPROVED" || decision?.status === "ARCHIVED";
  const isPublished = decision?.recommendation?.isClientVisible;
  const canEdit = currentUserRole === "OPERATOR" || currentUserRole === "ADMIN";
  const canReview =
    currentUserRole === "ADMIN" &&
    outcomeData?.outcome &&
    !outcomeData.outcome.reviewedAt;

  if (!isApproved && !isPublished) {
    return (
      <div className="space-y-6">
        <DecisionTabs decisionId={id} decisionType={decision?.type} />
        <Card className="rounded-[24px] border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              تتبّع النتيجة غير متاح
            </CardTitle>
            <CardDescription>
              تتبّع النتيجة متاح بعد اعتماد القرار أو نشره. الحالة الحالية:{" "}
              <Badge variant="secondary">{decision?.status}</Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const variance = outcomeData?.outcome
    ? outcomeData.outcome.actualValue != null &&
      outcomeData.outcome.expectedValue != null
      ? outcomeData.outcome.actualValue - outcomeData.outcome.expectedValue
      : null
    : null;

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} decisionType={decision?.type} />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
          {success}
        </div>
      )}

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>تتبّع النتيجة</CardTitle>
              <CardDescription>
                مقارنة النتائج المتوقّعة بالفعلية وتسجيل الدروس المستفادة.
              </CardDescription>
            </div>
            {outcomeData?.outcome && (
              <div className="flex items-center gap-2">
                {getStatusIcon(outcomeData.outcome.outcomeStatus)}
                <Badge
                  variant={getStatusVariant(outcomeData.outcome.outcomeStatus)}
                >
                  {outcomeData.outcome.outcomeStatus.replace(/_/g, " ")}
                </Badge>
                {outcomeData.outcome.reviewedAt && (
                  <Badge variant="outline" className="text-xs">
                    مراجعة بواسطة{" "}
                    {outcomeData.outcome.reviewedBy?.name || "غير معروف"}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expectedOutcome">النتيجة المتوقّعة</Label>
            <Textarea
              id="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={(e) =>
                setFormData({ ...formData, expectedOutcome: e.target.value })
              }
              placeholder="صِف النتيجة المتوقّعة من التوصية..."
              rows={3}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualOutcome">النتيجة الفعلية</Label>
            <Textarea
              id="actualOutcome"
              value={formData.actualOutcome}
              onChange={(e) =>
                setFormData({ ...formData, actualOutcome: e.target.value })
              }
              placeholder="صِف ما حدث فعلياً..."
              rows={3}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcomeStatus">حالة النتيجة</Label>
            <div className="flex gap-2">
              {(
                [
                  "SUCCESS",
                  "PARTIAL_SUCCESS",
                  "FAILURE",
                  "UNKNOWN",
                ] as OutcomeStatus[]
              ).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={
                    formData.outcomeStatus === status ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setFormData({ ...formData, outcomeStatus: status })
                  }
                  disabled={!canEdit}
                >
                  {status.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedValue">القيمة المتوقّعة (اختياري)</Label>
              <Input
                id="expectedValue"
                type="number"
                step="0.01"
                value={formData.expectedValue}
                onChange={(e) =>
                  setFormData({ ...formData, expectedValue: e.target.value })
                }
                placeholder="مثال: ١٠٠٠٠٠"
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualValue">القيمة الفعلية (اختياري)</Label>
              <Input
                id="actualValue"
                type="number"
                step="0.01"
                value={formData.actualValue}
                onChange={(e) =>
                  setFormData({ ...formData, actualValue: e.target.value })
                }
                placeholder="مثال: ٩٥٠٠٠"
                disabled={!canEdit}
              />
            </div>
          </div>

          {variance != null && (
            <div
              className={`p-3 rounded text-sm ${variance >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              <span className="font-medium">الانحراف:</span>{" "}
              {variance >= 0 ? "+" : ""}
              {variance.toFixed(2)}
              {formData.expectedValue && (
                <span className="ml-2">
                  (
                  {(
                    (variance / parseFloat(formData.expectedValue)) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="lessonsLearned">الدروس المستفادة</Label>
            <Textarea
              id="lessonsLearned"
              value={formData.lessonsLearned}
              onChange={(e) =>
                setFormData({ ...formData, lessonsLearned: e.target.value })
              }
              placeholder="ماذا تعلّمنا من هذا القرار؟"
              rows={3}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpActions">
              إجراءات المتابعة (JSON، اختياري)
            </Label>
            <Textarea
              id="followUpActions"
              value={formData.followUpActions}
              onChange={(e) =>
                setFormData({ ...formData, followUpActions: e.target.value })
              }
              placeholder='{"action1": "description", "action2": "description"}'
              rows={3}
              disabled={!canEdit}
            />
          </div>

          {outcomeData?.outcome && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>
                تاريخ الإنشاء:{" "}
                {new Date(outcomeData.outcome.createdAt).toLocaleString()}
              </p>
              <p>
                آخر تحديث:{" "}
                {new Date(outcomeData.outcome.updatedAt).toLocaleString()}
              </p>
              {outcomeData.outcome.reviewedAt && (
                <p>
                  تاريخ المراجعة:{" "}
                  {new Date(outcomeData.outcome.reviewedAt).toLocaleString()}{" "}
                  بواسطة {outcomeData.outcome.reviewedBy?.name || "غير معروف"}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {canEdit && (
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                حفظ النتيجة
              </Button>
            )}
            {canReview && (
              <Button
                variant="secondary"
                onClick={handleReview}
                disabled={saving}
              >
                تأكيد المراجعة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
