"use client";

import { Badge } from "@/components/ui/badge";
import { evaluateDecisionIntake } from "@/lib/decision/intake";

type IntakeSectionProps = {
  intake: ReturnType<typeof evaluateDecisionIntake>;
};

export function DecisionDetailSectionIntake({ intake }: IntakeSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٠ استلام القرار</h2>
        <Badge
          variant={
            intake.status === "accepted"
              ? "default"
              : intake.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {intake.status.replace("_", " ")}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {intake.readyForFramework
          ? "جاهز للمتابعة إلى أ-١٫١ أطر القرار."
          : "غير جاهز لتحليل الإطار حتى حل مشكلات الاستلام."}
      </p>
      {intake.reasons.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">الأسباب</h3>
          <ul className="mt-2 list-disc ps-5 text-sm">
            {intake.reasons.map((reason: string) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      {intake.requiredNextSteps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">الخطوات التالية المطلوبة</h3>
          <ul className="mt-2 list-disc ps-5 text-sm">
            {intake.requiredNextSteps.map((step: string) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
