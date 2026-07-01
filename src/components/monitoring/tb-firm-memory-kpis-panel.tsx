import { getFirmMemoryKpis } from "@/lib/tb-intelligence/firm-memory-kpis";

async function TbFirmMemoryKpisPanel() {
  const kpis = await getFirmMemoryKpis();

  const cards = [
    {
      label: "سجلات التغذية الراجعة",
      value: kpis.feedbackTotal,
      color: "text-module-audit",
    },
    {
      label: "مقبولة",
      value: kpis.feedbackAccepted,
      color: "text-status-success",
    },
    {
      label: "مرفوضة / مصحّحة",
      value: kpis.feedbackRejected,
      color: "text-status-warning",
    },
    {
      label: "أنماط متعلّمة",
      value: kpis.patternCount,
      color: "text-module-decision",
    },
    {
      label: "أنماط موثوقة",
      value: kpis.trustedPatternCount,
      color: "text-purple-600",
    },
    {
      label: "معدل إعادة الاستخدام",
      value:
        kpis.reuseRate !== null
          ? `${Math.round(kpis.reuseRate * 100)}%`
          : "—",
      color: "text-status-success",
      hint:
        kpis.reuseSampleSize > 0
          ? `${kpis.firmMemoryHits}/${kpis.reuseSampleSize} حساب`
          : undefined,
    },
    {
      label: "متوسط ثقة الأنماط",
      value:
        kpis.averagePatternConfidence !== null
          ? `${Math.round(kpis.averagePatternConfidence * 100)}%`
          : "—",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">ذاكرة التصنيف — Trial Balance</h2>
        <p className="text-sm text-muted-foreground">
          حلقة التعلم من التصحيحات البشرية (Firm Memory)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, color, hint }) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            {hint ? (
              <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export { TbFirmMemoryKpisPanel };
