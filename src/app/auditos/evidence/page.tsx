import {
  getDemoEvidence,
  getDemoFindings,
  getDemoRecommendations,
} from "@/lib/audit/demo-data";
import { StepNav } from "../step-nav";
import {
  GuidedDemoPanel,
  InsightCallout,
  MetricCard,
} from "@/components/enterprise";

const severityColors: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-blue-50 text-blue-700",
};

const stateLabels: Record<string, string> = {
  accepted: "مقبول",
  reviewed: "تمت مراجعته",
  missing: "ناقص",
  uploaded: "مُرفوع",
};

export default function AuditosEvidence() {
  const evidence = getDemoEvidence();
  const findings = getDemoFindings();
  const recommendations = getDemoRecommendations();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          المرحلة 4 — الأدلة والملاحظات
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          الأدلة والملاحظات
        </h1>
        <p className="mt-2 text-muted-foreground">
          {evidence.length} مستند · {findings.length} ملاحظة ·{" "}
          {recommendations.length} توصية
        </p>
      </div>

      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ مستندات الأدلة، الملاحظات، والتوصيات المرتبطة بها.",
          "لماذا هذا مهم؟ كل ملاحظة يجب أن تكون مدعومة بدليل واضح.",
          "ما المخرج؟ قائمة أدلة وملاحظات وتوصيات قابلة للمراجعة.",
          "ما القرار التالي؟ الانتقال إلى صفحة التتبع لرؤية المسار الكامل.",
        ]}
        className="mb-8"
      />

      <InsightCallout
        text="هذا الإيضاح مرتبط بدليل محدد. كل مخرج مرتبط بمصدره."
        type="success"
        className="mb-8"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="أدلة" value={evidence.length} />
        <MetricCard label="ملاحظات" value={findings.length} />
        <MetricCard label="توصيات" value={recommendations.length} />
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            الأدلة ({evidence.length})
          </h2>
          <div className="space-y-3">
            {evidence.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm"
              >
                <div
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    ev.state === "missing" ? "bg-amber-400" : "bg-green-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ev.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {ev.fileType?.toUpperCase()} ·{" "}
                    {ev.state === "missing"
                      ? "—"
                      : `${(ev.fileSize / 1000).toFixed(0)} KB`}
                    {" · "}
                    {ev.uploadedBy || "غير مرفوع"}
                  </p>
                  {ev.linkedEntities?.map((link) => (
                    <p
                      key={link.id}
                      className="text-[10px] text-muted-foreground"
                    >
                      مرتبط بـ: {link.targetLabel}
                    </p>
                  ))}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    ev.state === "accepted"
                      ? "bg-green-50 text-green-700"
                      : ev.state === "reviewed"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {stateLabels[ev.state] ?? ev.state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">
            الملاحظات ({findings.length})
          </h2>
          <div className="space-y-4">
            {findings.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[f.severity] ?? ""}`}
                  >
                    {f.severity === "high" && "عالي"}
                    {f.severity === "medium" && "متوسط"}
                    {f.severity === "low" && "منخفض"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {f.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {f.findingType}
                  </span>
                  <span>·</span>
                  <span>{f.materiality}</span>
                  {f.aiSuggested && (
                    <span className="text-purple-600">· AI</span>
                  )}
                </div>
                {recommendations
                  .filter((r) => r.findingId === f.id)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="mt-2 rounded-xl bg-muted/30 px-3 py-2"
                    >
                      <p className="text-xs font-medium text-primary">
                        توصية: {r.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {r.recommendedAction}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <StepNav current="/auditos/evidence" />
    </div>
  );
}
