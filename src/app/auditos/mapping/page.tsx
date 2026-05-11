import { getDemoMappings } from "@/lib/audit/demo-data"
import { StepNav } from "../step-nav"
import { GuidedDemoPanel, InsightCallout, MetricCard } from "@/components/enterprise"

export default function AuditosMapping() {
  const mappings = getDemoMappings()
  const confirmed = mappings.filter((m) => m.status === "confirmed").length
  const pending = mappings.filter((m) => m.status === "pending").length

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 space-y-2 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">المرحلة 2</p>
        <h1 className="text-2xl font-bold">تصنيف الحسابات</h1>
        <p className="text-muted-foreground">
          {confirmed} حسابًا مصنفًا · {pending} معلق · الربط بدليل الحسابات المعياري IFRS for SMEs
        </p>
      </div>

      {/* Guided Demo Panel */}
      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ جدول يربط كل حساب من ميزان المراجعة بالحساب المعياري المقابل.",
          "لماذا هذا مهم؟ التصنيف الصحيح هو أساس القوائم المالية الدقيقة.",
          "ما المخرج؟ 21 حسابًا مؤكد التصنيف، وحساب واحد يحتاج مراجعة بشرية.",
          "ما القرار التالي؟ اعتماد الحساب المعلق أو تعديله، ثم الانتقال إلى القوائم.",
        ]}
        className="mb-8"
      />

      {/* Insight Callout */}
      <InsightCallout text="تم تصنيف 21 من 22 حسابًا تلقائيًا بمساعدة الذكاء المؤسسي. حساب واحد معلق للمراجعة البشرية." type="info" className="mb-8" />

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="مؤكد" value={confirmed} />
        <MetricCard label="معلق" value={pending} />
        <MetricCard label="بمساعدة الذكاء المؤسسي" value={mappings.filter((m) => m.mappingType?.includes("ai")).length} />
      </div>

      {/* Mapping Table */}
      <div className="mb-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">الحساب المصدر</th>
              <th className="px-4 py-3 text-right">الحساب المعياري</th>
              <th className="px-4 py-3 text-right">التصنيف</th>
              <th className="px-4 py-3 text-right">النوع</th>
              <th className="px-4 py-3 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mappings.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{m.sourceAccountCode}</span>
                  <span className="mx-1">·</span>
                  <span>{m.sourceAccountName}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{m.canonicalAccountCode}</span>
                  <span className="mx-1">·</span>
                  <span>{m.canonicalAccountName}</span>
                </td>
                <td className="px-4 py-2.5 text-xs">{m.statementClassification}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {m.mappingType === "confirmed_ai" && "ذكاء مؤسسي"}
                    {m.mappingType === "ai_suggested" && "مقترح"}
                    {m.mappingType === "human_mapped" && "يدوي"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {m.status === "confirmed" ? "مؤكد" : "معلق"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StepNav current="/auditos/mapping" />
    </div>
  )
}
