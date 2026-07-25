"use client";

interface RuleItem {
  phrase: string;
  canonicalCode: string;
  category: string;
  confidence?: number;
  oldConfidence?: number;
  newConfidence?: number;
}

interface RuleSectionProps {
  title: string;
  rules: RuleItem[];
  variant: "added" | "modified" | "removed";
}

const variantStyles = {
  added: { border: "border-green-100", bg: "bg-green-50", text: "text-green-700" },
  modified: { border: "border-blue-100", bg: "bg-blue-50", text: "text-blue-700" },
  removed: { border: "border-red-100", bg: "bg-red-50", text: "text-red-700" },
};

export function RuleSection({ title, rules, variant }: RuleSectionProps) {
  if (rules.length === 0) return null;

  const style = variantStyles[variant];

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h4 className={`mb-3 text-sm font-semibold ${style.text}`}>
        {title} ({rules.length})
      </h4>
      <div className="space-y-2 text-sm">
        {rules.map((r, i) => (
          <div
            key={i}
            className={`rounded-lg border ${style.border} ${style.bg} p-2`}
          >
            <span className="font-medium">{r.phrase}</span>
            <span className="mr-2 text-xs text-muted-foreground">
              {r.canonicalCode} · {r.category} ·{" "}
              {r.oldConfidence !== undefined && r.newConfidence !== undefined
                ? `ثقة: ${r.oldConfidence} → ${r.newConfidence}`
                : `ثقة: ${r.confidence}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
