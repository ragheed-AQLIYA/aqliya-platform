import { getDemoAuditEvents, getDemoAiOutputs } from "@/lib/audit/demo-data"
import { StepNav } from "../step-nav"

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  "engagement.created": { label: "إنشاء الارتباط", color: "bg-gray-100 text-gray-700" },
  "team.assigned": { label: "تعيين الفريق", color: "bg-gray-100 text-gray-700" },
  "trial_balance.uploaded": { label: "رفع ميزان المراجعة", color: "bg-blue-100 text-blue-700" },
  "mapping.ai_suggested": { label: "ذكاء مؤسسي - تصنيف", color: "bg-purple-100 text-purple-700" },
  "mapping.confirmed": { label: "تأكيد التصنيف", color: "bg-green-100 text-green-700" },
  "validation.completed": { label: "اكتمال التحقق", color: "bg-blue-100 text-blue-700" },
  "evidence.uploaded": { label: "رفع دليل", color: "bg-teal-100 text-teal-700" },
  "evidence.accepted": { label: "قبول دليل", color: "bg-green-100 text-green-700" },
  "signal.generated": { label: "إشارة ذكية", color: "bg-purple-100 text-purple-700" },
  "finding.created": { label: "إنشاء ملاحظة", color: "bg-orange-100 text-orange-700" },
  "finding.state_changed": { label: "تغيير حالة ملاحظة", color: "bg-orange-100 text-orange-700" },
  "recommendation.ai_suggested": { label: "ذكاء مؤسسي - توصية", color: "bg-purple-100 text-purple-700" },
  "recommendation.created": { label: "إنشاء توصية", color: "bg-teal-100 text-teal-700" },
  "recommendation.state_changed": { label: "تغيير حالة توصية", color: "bg-teal-100 text-teal-700" },
  "review.comment_added": { label: "تعليق مراجعة", color: "bg-amber-100 text-amber-700" },
  "engagement.state_changed": { label: "تغيير حالة الارتباط", color: "bg-indigo-100 text-indigo-700" },
}

export default function AuditosTraceability() {
  const events = getDemoAuditEvents().slice().reverse()
  const aiOutputs = getDemoAiOutputs()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="space-y-2 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">المرحلة 5</p>
        <h1 className="text-2xl font-bold">التتبع الكامل</h1>
        <p className="text-muted-foreground">
          مسار التدقيق من البداية إلى المخرجات — {events.length} حدثًا مسجلًا
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          <h2 className="mb-4 text-lg font-bold">المسار الزمني</h2>
          <div className="relative space-y-0">
            {events.map((e, i) => {
              const meta = eventTypeLabels[e.eventType] ?? { label: e.eventType, color: "bg-gray-100 text-gray-700" }
              return (
                <div key={e.id} className="flex gap-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full border-2 ${e.aiRelated ? "border-purple-400 bg-purple-100" : "border-primary/30 bg-background"}`} />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      {e.aiRelated && (
                        <span className="text-[10px] font-medium text-purple-600">AI</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-5">{e.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.actorName} · {new Date(e.timestamp).toLocaleDateString("ar-SA", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">مساهمات الذكاء المؤسسي</h2>
          <div className="space-y-3">
            {aiOutputs.map((ai) => (
              <div key={ai.id} className="rounded-lg border bg-background p-4">
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
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{ai.outputContent}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className={`rounded-full px-1.5 py-0.5 font-medium ${
                    ai.status === "accepted_by_human" ? "bg-green-50 text-green-700"
                      : ai.status === "suggested" ? "bg-amber-50 text-amber-700"
                      : "bg-gray-50 text-gray-700"
                  }`}>
                    {ai.status === "accepted_by_human" && "مقبول"}
                    {ai.status === "suggested" && "مقترح"}
                    {ai.status === "rejected_by_human" && "مرفوض"}
                  </span>
                  <span className="text-muted-foreground">· {ai.modelVersion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StepNav current="/auditos/traceability" />
    </div>
  )
}
