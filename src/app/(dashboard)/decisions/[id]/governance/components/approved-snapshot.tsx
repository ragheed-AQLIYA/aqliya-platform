"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApprovedSnapshotProps {
  approvedSnapshot: any;
  recommendationDiffers: boolean;
  recommendationSummary: any;
}

export function ApprovedSnapshot({
  approvedSnapshot,
  recommendationDiffers,
  recommendationSummary,
}: ApprovedSnapshotProps) {
  if (!approvedSnapshot) return null;

  return (
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
          {recommendationDiffers && recommendationSummary && (
            <div className="pt-3 border-t mt-3">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">
                التوصية الحالية (تختلف عن المعتمدة)
              </h4>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">الحالي:</span>{" "}
                {recommendationSummary.action}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                آخر تحديث:{" "}
                {new Date(recommendationSummary.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
