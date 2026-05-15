import { cn } from "@/lib/utils";

interface OperatingSystemMapVisualProps {
  variant?: "light" | "dark";
  className?: string;
}

const mainNodes = [
  { id: "workflows", label: "Workflows", sub: "مسارات العمل" },
  { id: "data", label: "Data", sub: "البيانات" },
  { id: "rules", label: "Rules", sub: "القواعد" },
  { id: "outputs", label: "Outputs", sub: "المخرجات" },
  { id: "review", label: "Review", sub: "المراجعة" },
  { id: "decisions", label: "Decisions", sub: "القرارات" },
];

const supportingNodes = [
  { label: "Traceability", sub: "التتبع" },
  { label: "Simulation", sub: "المحاكاة" },
  { label: "Reports", sub: "التقارير" },
  { label: "Approval", sub: "الاعتماد" },
  { label: "Improvement", sub: "التطوير" },
];

export function OperatingSystemMapVisual({
  variant = "dark",
  className,
}: OperatingSystemMapVisualProps) {
  const isDark = variant === "dark";
  const nodeBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF";
  const nodeBorder = isDark ? "rgba(255,255,255,0.1)" : "#D7E2EA";
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B";
  const accentColor = "#137DC5";
  const lineColor = isDark ? "rgba(19,125,197,0.25)" : "rgba(19,125,197,0.2)";

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border p-4 sm:p-6",
        isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between mb-4 pb-3 border-b",
          isDark ? "border-white/10" : "border-border",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#137DC5] animate-pulse" />
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.15em]",
              isDark ? "text-white/50" : "text-muted-foreground",
            )}
          >
            AQLIYA Enterprise Systems
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span
            className={cn(
              "flex items-center gap-1",
              isDark ? "text-white/40" : "text-muted-foreground",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#137DC5]" /> Active
          </span>
        </div>
      </div>

      {/* Main Flow */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {mainNodes.map((node, i) => (
          <div key={node.id} className="flex items-center gap-2 sm:gap-3">
            <div
              className="rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-center transition-all hover:scale-[1.02]"
              style={{
                background: nodeBg,
                border: `1px solid ${nodeBorder}`,
                minWidth: "60px",
              }}
            >
              <div
                className="text-xs sm:text-sm font-semibold"
                style={{ color: textPrimary }}
              >
                {node.label}
              </div>
              <div
                className="text-[9px] sm:text-[10px]"
                style={{ color: textSecondary }}
              >
                {node.sub}
              </div>
            </div>
            {i < mainNodes.length - 1 && (
              <svg
                className="h-3 w-3 shrink-0 rtl:rotate-180"
                style={{ color: lineColor }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Supporting Nodes */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-2 pt-3 border-t",
          isDark ? "border-white/10" : "border-border",
        )}
      >
        {supportingNodes.map((node, i) => (
          <div
            key={i}
            className="rounded-full px-3 py-1 text-center transition-all hover:scale-[1.02]"
            style={{
              background: isDark
                ? "rgba(19,125,197,0.08)"
                : "rgba(19,125,197,0.06)",
              border: `1px dashed ${isDark ? "rgba(19,125,197,0.2)" : "rgba(19,125,197,0.15)"}`,
            }}
          >
            <div
              className="text-[10px] sm:text-xs font-medium"
              style={{ color: accentColor }}
            >
              {node.label}
            </div>
            <div
              className="text-[8px] sm:text-[9px]"
              style={{ color: textSecondary }}
            >
              {node.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
