"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileDiff, AlertTriangle } from "lucide-react";
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff";

interface DiffData {
  fields: FieldDiff[];
  changeCount: number;
  summary: string;
}

interface RecommendationDiffCardProps {
  recommendationDiffers: boolean;
  diffData: DiffData | null;
  showDiff: boolean;
  loadingDiff: boolean;
  showReReviewForm: boolean;
  reReviewReason: string;
  status: string;
  saving: boolean;
  onToggleDiff: () => void;
  onToggleReReviewForm: () => void;
  onReReviewReasonChange: (value: string) => void;
  onSubmitReReview: () => void;
}

export function RecommendationDiffCard({
  recommendationDiffers,
  diffData,
  showDiff,
  loadingDiff,
  showReReviewForm,
  reReviewReason,
  status,
  saving,
  onToggleDiff,
  onToggleReReviewForm,
  onReReviewReasonChange,
  onSubmitReReview,
}: RecommendationDiffCardProps) {
  if (!recommendationDiffers) return null;

  return (
    <>
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
                onClick={onToggleDiff}
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
                  onClick={onToggleReReviewForm}
                >
                  طلب إعادة مراجعة
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

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
            onChange={(e) => onReReviewReasonChange(e.target.value)}
            placeholder="اشرح سبب الحاجة لإعادة المراجعة..."
            className="mt-1"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onSubmitReReview}
              disabled={saving || !reReviewReason.trim()}
            >
              {saving ? "جارٍ الطلب..." : "تأكيد إعادة المراجعة"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleReReviewForm}
            >
              إلغاء
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
