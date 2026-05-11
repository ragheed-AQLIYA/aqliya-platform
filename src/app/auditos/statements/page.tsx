import { getDemoFinancialStatements, getDemoDisclosureNotes } from "@/lib/audit/demo-data"
import { StepNav } from "../step-nav"
import { GuidedDemoPanel, InsightCallout, MetricCard } from "@/components/enterprise"

function formatSAR(n: number) {
  if (n === 0) return "—"
  return Math.abs(n).toLocaleString("ar-SA") + " ر.س"
}

export default function AuditosStatements() {
  const statements = getDemoFinancialStatements()
  const notes = getDemoDisclosureNotes()
  const incomeStmt = statements.find((s) => s.statementType === "income_statement")
  const balanceSheet = statements.find((s) => s.statementType === "balance_sheet")

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 space-y-2 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">المرحلة 3</p>
        <h1 className="text-2xl font-bold">القوائم المالية</h1>
        <p className="text-muted-foreground">
          قائمة الدخل والمركز المالي مُولّدة تلقائيًا من تصنيف الحسابات
        </p>
      </div>

      {/* Guided Demo Panel */}
      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ قائمة الدخل والمركز المالي مولّدة تلقائيًا من الحسابات المصنفة.",
          "لماذا هذا مهم؟ القوائم هي المخرج الرئيسي لعملية المراجعة.",
          "ما المخرج؟ قوائم مالية أولية + إيضاحات مسودة جاهزة للمراجعة.",
          "ما القرار التالي؟ مراجعة الإيضاحات والمضي إلى الأدلة والنتائج.",
        ]}
        className="mb-8"
      />

      {/* Insight Callout */}
      <InsightCallout text="تم توليد القوائم المالية تلقائيًا. 7 إيضاحات مسودة، بعضها يحتاج معلومات إضافية." type="info" className="mb-8" />

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <MetricCard label="قوائم مالية مولّدة" value={statements.length} />
        <MetricCard label="إيضاحات مسودة" value={notes.length} />
      </div>

      {/* Statements */}
      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {incomeStmt && (
          <div className="rounded-xl border bg-background p-6">
            <h2 className="mb-1 text-lg font-bold">{incomeStmt.title}</h2>
            <p className="mb-4 text-xs text-muted-foreground">للسنة المنتهية في 31 ديسمبر 2025 — بالريال السعودي</p>
            <div className="space-y-1 text-sm">
              {incomeStmt.lines.map((line) => (
                <div
                  key={line.id}
                  className={`flex items-center justify-between py-1.5 ${
                    line.isTotal ? "border-t font-bold" : ""
                  } ${line.indentLevel === 1 ? "pr-6 text-muted-foreground text-xs" : ""}`}
                >
                  <span>{line.label}</span>
                  <span className="font-mono text-xs">
                    {line.isTotal || line.amount !== 0 ? formatSAR(line.amount) : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {balanceSheet && (
          <div className="rounded-xl border bg-background p-6">
            <h2 className="mb-1 text-lg font-bold">{balanceSheet.title}</h2>
            <p className="mb-4 text-xs text-muted-foreground">كما في 31 ديسمبر 2025 — بالريال السعودي</p>
            <div className="space-y-1 text-sm">
              {balanceSheet.lines.map((line) => (
                <div
                  key={line.id}
                  className={`flex items-center justify-between py-1.5 ${
                    line.isTotal ? "border-t font-bold" : ""
                  } ${line.indentLevel === 1 ? "pr-6 text-muted-foreground text-xs" : ""}`}
                >
                  <span>{line.label}</span>
                  <span className="font-mono text-xs">
                    {line.isTotal || line.amount !== 0 ? formatSAR(line.amount) : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-8 rounded-xl border bg-background p-6">
        <h2 className="mb-4 text-lg font-bold">الإيضاحات ({notes.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  إيضاح {note.noteNumber}: {note.title}
                </h3>
                {note.aiDrafted && (
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                    AI
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-3">{note.content}</p>
              {note.missingInformation && note.missingInformation.length > 0 && (
                <div className="mt-2">
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    {note.status === "draft" ? "مسودة" : "تحتاج معلومات"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <StepNav current="/auditos/statements" />
    </div>
  )
}
