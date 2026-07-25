"use client";

import { Badge } from "@/components/ui/badge";
import { evaluateDecisionIntake } from "@/lib/decision/intake";
import { evaluateDecisionFramework } from "@/lib/decision/framework";

type FrameworkSectionProps = {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  decision: Record<string, unknown>;
};

const FRAMEWORK_FIELDS = [
  { key: "context", label: "السياق" },
  { key: "purpose", label: "الغرض" },
  { key: "options", label: "الخيارات" },
  { key: "criteria", label: "المعايير" },
  { key: "values", label: "القيم" },
  { key: "informationGaps", label: "فجوات المعلومات" },
  { key: "certainty", label: "درجة اليقين" },
  { key: "assumptions", label: "الافتراضات" },
] as const;

export function DecisionDetailSectionFramework({
  intake,
  frameworkState,
  decision,
}: FrameworkSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫١ إطار القرار</h2>
        {intake.status === "accepted" ? (
          <Badge
            variant={frameworkState.isComplete ? "default" : "secondary"}
          >
            {frameworkState.isComplete ? "مكتمل" : "غير مكتمل"}
          </Badge>
        ) : (
          <Badge variant="secondary">محظور</Badge>
        )}
      </div>
      {intake.status !== "accepted" ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة الإطار قبل قبول الاستلام.
        </p>
      ) : decision.framework ? (
        <div className="grid gap-3 text-sm md:grid-cols-2">
          {FRAMEWORK_FIELDS.map((field) => (
            <div key={field.key}>
              <h3 className="font-medium">{field.label}</h3>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {(decision.framework as Record<string, unknown>)[field.key] as string || "غير محدّد"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم يبدأ إطار القرار بعد. افتح تبويب الإطار لتعريفه.
        </p>
      )}
    </section>
  );
}
