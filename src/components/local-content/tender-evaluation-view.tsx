// ─── LocalContentOS — LCGPA Tender Evaluation View ───
// Displays complete tender evaluation results with all LCGPA rules applied.

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenderEvaluationResult } from "@/lib/local-content/lcgpa/types";

const STATUS_LABELS: Record<string, string> = {
  meetsThreshold: "مطابق",
  doesNotMeetThreshold: "غير مطابق",
  preferenceApplied: "مُطبّق",
  noPreference: "غير مُطبّق",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  meetsThreshold: "default",
  doesNotMeetThreshold: "destructive",
  preferenceApplied: "default",
  noPreference: "secondary",
};

function Stat({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "secondary" | "destructive";
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">
        <Badge variant={variant}>{value}</Badge>
      </p>
    </div>
  );
}

export function TenderEvaluationView({
  result,
}: {
  result: TenderEvaluationResult;
}) {
  const ownershipStatus = result.ownershipCheck.meetsThreshold
    ? "meetsThreshold"
    : "doesNotMeetThreshold";
  const smeStatus = result.smePreference.preferenceApplied
    ? "preferenceApplied"
    : "noPreference";
  const priceStatus = result.pricePreference.preferenceApplied
    ? "preferenceApplied"
    : "noPreference";

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">تقييم المناقصة — LCGPA</h1>
        <Badge variant={STATUS_VARIANT[ownershipStatus]}>
          {STATUS_LABELS[ownershipStatus]}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        تقييم شامل يشمل قاعدة الملكية، تفضيل SME، تفضيل السعر، التقييم المالي
        (المادة 17)، العقوبات، والخطة التدريجية.
      </p>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="ملكية سعودية"
          value={`${result.ownershipCheck.saudiOwnershipPct}%`}
          variant={STATUS_VARIANT[ownershipStatus]}
        />
        <Stat
          label="سعر المزايدة المعدّل"
          value={`${result.adjustedBidPrice.toLocaleString("ar-SA")} ر.س`}
        />
        <Stat
          label="التقييم المالي"
          value={
            result.financialEvaluation.success
              ? `${result.financialEvaluation.result!.overallScore.toFixed(1)}`
              : "فشل"
          }
          variant={
            result.financialEvaluation.success ? "default" : "destructive"
          }
        />
        <Stat
          label="التحذيرات"
          value={String(result.warnings.length)}
          variant={result.warnings.length > 0 ? "secondary" : "default"}
        />
      </div>

      {/* Ownership Card */}
      <Card>
        <CardHeader>
          <CardTitle>قاعدة الملكية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="الحصة السعودية"
              value={`${result.ownershipCheck.saudiOwnershipPct}%`}
            />
            <Stat
              label="التصنيف"
              value={result.ownershipCheck.classification || "غير محدد"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>التفضيلات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="تفضيل SME (المادة 12)"
              value={
                result.smePreference.preferenceApplied
                  ? `-${result.smePreference.preferenceAmount.toLocaleString("ar-SA")} ر.س`
                  : "غير مُطبّق"
              }
              variant={STATUS_VARIANT[smeStatus]}
            />
            <Stat
              label="تفضيل السعر (المادة 11)"
              value={
                result.pricePreference.preferenceApplied
                  ? `+${result.pricePreference.preferenceAmount.toLocaleString("ar-SA")} ر.س`
                  : "غير مُطبّق"
              }
              variant={STATUS_VARIANT[priceStatus]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Evaluation Card */}
      {result.financialEvaluation.success && (
        <Card>
          <CardHeader>
            <CardTitle>التقييم المالي (المادة 17)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                label="نتيجة السعر"
                value={result.financialEvaluation.result!.priceScore.toFixed(1)}
              />
              <Stat
                label="نتيجة المحتوى المحلي"
                value={result.financialEvaluation.result!.lcScore.toFixed(1)}
              />
              <Stat
                label="النتيجة الإجمالية"
                value={result.financialEvaluation.result!.overallScore.toFixed(1)}
                variant="default"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Penalty Assessment Card */}
      {result.penaltyAssessment && result.penaltyAssessment.success && (
        <Card>
          <CardHeader>
            <CardTitle>تقييم العقوبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="نسبة الانحراف"
                value={`${(result.penaltyAssessment.result!.variance * 100).toFixed(1)}%`}
              />
              <Stat
                label="الغرامة"
                value={`${result.penaltyAssessment.result!.maxPenaltyAmount.toLocaleString("ar-SA")} ر.س`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gradual Plan Card */}
      {result.gradualPlan && result.gradualPlan.success && (
        <Card>
          <CardHeader>
            <CardTitle>الخطة التدريجية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="موعد التسليم"
                value={result.gradualPlan.result!.submissionDeadline.toLocaleDateString("ar-SA")}
              />
              <Stat
                label="الأيام المتبقية"
                value={String(result.gradualPlan.result!.daysRemaining)}
                variant={
                  result.gradualPlan.result!.daysRemaining > 0
                    ? "default"
                    : "destructive"
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>تحذيرات</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
