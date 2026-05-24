import { getDemoAuditEvents, getDemoAiOutputs } from "../demo-data";
import { StepNav } from "../step-nav";
import {
  GuidedDemoPanel,
  InsightCallout,
  MetricCard,
  TraceabilityChain,
} from "@/components/enterprise";
import {
  getSafeDemoActorLabel,
  getSafeDemoModelLabel,
  getSafeDemoEventDescription,
  sanitizeDemoNarrative,
} from "../demo-safety";

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  "engagement.created": {
    label: "تهيئة السيناريو",
    color: "bg-gray-100 text-gray-700",
  },
  "team.assigned": {
    label: "تجهيز الأدوار",
    color: "bg-gray-100 text-gray-700",
  },
  "trial_balance.uploaded": {
    label: "إدراج ميزان العرض",
    color: "bg-blue-100 text-blue-700",
  },
  "mapping.ai_suggested": {
    label: "ذكاء مؤسسي - تصنيف",
    color: "bg-purple-100 text-purple-700",
  },
  "mapping.confirmed": {
    label: "اعتماد التصنيف",
    color: "bg-green-100 text-green-700",
  },
  "validation.completed": {
    label: "اكتمال التحقق",
    color: "bg-blue-100 text-blue-700",
  },
  "evidence.uploaded": {
    label: "ربط دليل تجريبي",
    color: "bg-teal-100 text-teal-700",
  },
  "evidence.accepted": {
    label: "مراجعة دليل",
    color: "bg-green-100 text-green-700",
  },
  "signal.generated": {
    label: "إشارة ذكية",
    color: "bg-purple-100 text-purple-700",
  },
  "finding.created": {
    label: "إنشاء ملاحظة",
    color: "bg-orange-100 text-orange-700",
  },
  "finding.state_changed": {
    label: "تغيير حالة ملاحظة",
    color: "bg-orange-100 text-orange-700",
  },
  "recommendation.ai_suggested": {
    label: "ذكاء مؤسسي - توصية",
    color: "bg-purple-100 text-purple-700",
  },
  "recommendation.created": {
    label: "مراجعة توصية",
    color: "bg-teal-100 text-teal-700",
  },
  "recommendation.state_changed": {
    label: "تغيير حالة توصية",
    color: "bg-teal-100 text-teal-700",
  },
  "review.comment_added": {
    label: "تعليق مراجعة",
    color: "bg-amber-100 text-amber-700",
  },
  "engagement.state_changed": {
    label: "تقدم سيناريو العرض",
    color: "bg-indigo-100 text-indigo-700",
  },
};

export default function AuditosTraceability() {
  const events = getDemoAuditEvents().slice().reverse();
  const aiOutputs = getDemoAiOutputs();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          المرحلة 5 — التتبع الكامل
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          مسار التدقيق من البداية إلى المخرجات
        </h1>
        <p className="mt-2 text-muted-foreground">
          {events.length} حدثًا معروضًا · تسلسل توضيحي ثابت يشرح الربط بين
          البيانات والمراجعة والقرار
        </p>
      </div>

      {/* Guided Demo Panel */}
      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ المسار الزمني الكامل لكل حدث في عملية المراجعة.",
          "لماذا هذا مهم؟ كل مخرج مرتبط بمصدره، وكل قرار يمكن تتبعه.",
          "ما المخرج؟ سجل تدقيق كامل + مساهمات الذكاء المؤسسي.",
          "ما القرار التالي؟ هذا هو المخرج النهائي — النظام جاهز للمراجعة البشرية.",
        ]}
        className="mb-8"
      />

      {/* Insight Callout */}
      <InsightCallout
        text="هذا سجل عرض ثابت يوضح قابلية التتبع داخل AuditOS. لا تظهر هنا بيانات عميل حي أو سجل تشغيلي فعلي."
        type="success"
        className="mb-8"
      />

      {/* Traceability Chain — Dominant Visual */}
      <div className="mb-10 rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-background p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-center text-lg font-bold">
          سلسلة التتبع الكاملة
        </h2>
        <TraceabilityChain
          steps={[
            "حساب خام",
            "قرار التصنيف",
            "بند في القائمة",
            "إيضاح",
            "دليل",
            "نتيجة",
            "نقطة مراجعة",
          ]}
        />
      </div>

      {/* Metrics */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <MetricCard label="أحداث التتبع" value={events.length} />
        <MetricCard label="مساهمات الذكاء المؤسسي" value={aiOutputs.length} />
      </div>

      {/* Timeline & AI */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          <h2 className="mb-4 text-lg font-semibold">المسار الزمني</h2>
          <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
            <div className="relative space-y-0">
              {events.map((e, i) => {
                const meta = eventTypeLabels[e.eventType] ?? {
                  label: e.eventType,
                  color: "bg-gray-100 text-gray-700",
                };
                return (
                  <div key={e.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${e.aiRelated ? "border-purple-400 bg-purple-100" : "border-primary/30 bg-background"}`}
                      />
                      {i < events.length - 1 && (
                        <div className="h-6 w-px bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        {e.aiRelated && (
                          <span className="text-[10px] font-medium text-purple-600">
                            مساعد
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-5">
                        {getSafeDemoEventDescription(
                          e.eventType,
                          e.description,
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {getSafeDemoActorLabel(e.actorName)} ·{" "}
                        {new Date(e.timestamp).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">
            مساهمات الذكاء المؤسسي في العرض
          </h2>
          <div className="space-y-3">
            {aiOutputs.map((ai) => (
              <div
                key={ai.id}
                className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {ai.suggestionType === "mapping" && "تصنيف"}
                    {ai.suggestionType === "finding" && "ملاحظة"}
                    {ai.suggestionType === "recommendation" && "توصية"}
                    {ai.suggestionType === "note_draft" && "إيضاح"}
                    {ai.suggestionType === "anomaly_explanation" && "تحليل"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ثقة: {(ai.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {sanitizeDemoNarrative(ai.outputContent)}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-medium ${
                      ai.status === "accepted_by_human"
                        ? "bg-green-50 text-green-700"
                        : ai.status === "suggested"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {ai.status === "accepted_by_human" && "مقبول"}
                    {ai.status === "suggested" && "مقترح"}
                    {ai.status === "rejected_by_human" && "مرفوض"}
                  </span>
                  <span className="text-muted-foreground">
                    · {getSafeDemoModelLabel(ai.modelVersion)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StepNav current="/auditos/traceability" />
    </div>
  );
}
