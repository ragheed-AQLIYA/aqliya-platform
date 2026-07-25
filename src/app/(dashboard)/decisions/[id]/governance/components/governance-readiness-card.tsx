"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface GovernanceReadinessCardProps {
  hasRecommendation: boolean;
  evidenceCount: number;
  latestEvidenceAt: string | null;
  humanReviewRequired: boolean;
  status: string;
  nextStep: string;
  governanceWarnings: string[];
}

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

export function GovernanceReadinessCard({
  hasRecommendation,
  evidenceCount,
  latestEvidenceAt,
  humanReviewRequired,
  status,
  nextStep,
  governanceWarnings,
}: GovernanceReadinessCardProps) {
  return (
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
  );
}
