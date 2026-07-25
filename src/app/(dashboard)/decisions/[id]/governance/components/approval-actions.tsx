"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApprovalActionsProps {
  canSubmitForReview: boolean;
  canApprove: boolean;
  hasRecommendation: boolean;
  evidenceCount: number;
  saving: boolean;
  notes: string;
  conditions: string;
  overrideReason: string;
  showApproveForm: boolean;
  showRejectForm: boolean;
  showConditionsForm: boolean;
  onSubmitForReview: () => void;
  onApprove: () => void;
  onApproveWithConditions: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
  onNotesChange: (value: string) => void;
  onConditionsChange: (value: string) => void;
  onOverrideReasonChange: (value: string) => void;
  onToggleApproveForm: () => void;
  onToggleRejectForm: () => void;
  onToggleConditionsForm: () => void;
}

function getGovernanceNextStep(
  status: string,
  canApprove: boolean,
  canSubmitForReview: boolean,
) {
  if (canSubmitForReview) return "استكمال مواد الدعم ثم إرسال القرار للمراجعة";
  if (canApprove)
    return "مراجعة التوصية والأدلة ثم الاعتماد أو إعادة القرار للمراجعة";
  return "استكمل مسار القرار قبل الاعتماد";
}

export function ApprovalActions({
  canSubmitForReview,
  canApprove,
  hasRecommendation,
  evidenceCount,
  saving,
  notes,
  conditions,
  overrideReason,
  showApproveForm,
  showRejectForm,
  showConditionsForm,
  onSubmitForReview,
  onApprove,
  onApproveWithConditions,
  onReject,
  onRequestRevision,
  onNotesChange,
  onConditionsChange,
  onOverrideReasonChange,
  onToggleApproveForm,
  onToggleRejectForm,
  onToggleConditionsForm,
}: ApprovalActionsProps) {
  if (!canSubmitForReview && !canApprove) return null;

  return (
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
          <Button onClick={onSubmitForReview} disabled={saving}>
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
                onClick={onToggleApproveForm}
              >
                اعتماد
              </Button>
              <Button
                variant="secondary"
                onClick={onToggleConditionsForm}
              >
                اعتماد مع شروط
              </Button>
              <Button
                variant="destructive"
                onClick={onToggleRejectForm}
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
                  onChange={(e) => onNotesChange(e.target.value)}
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
                      onChange={(e) => onOverrideReasonChange(e.target.value)}
                      placeholder="اشرح سبب اعتمادك بدون توصية..."
                      required
                    />
                  </>
                )}
                <Button
                  onClick={onApprove}
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
                  onChange={(e) => onConditionsChange(e.target.value)}
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
                      onChange={(e) => onOverrideReasonChange(e.target.value)}
                      placeholder="اشرح سبب اعتمادك بدون توصية..."
                      required
                    />
                  </>
                )}
                <Button
                  onClick={onApproveWithConditions}
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
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="اشرح سبب رفض هذا القرار أو حاجته للمراجعة..."
                  required
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={onReject}
                    disabled={saving || !notes.trim()}
                  >
                    {saving ? "جارٍ الرفض..." : "رفض القرار"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRequestRevision}
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
  );
}
