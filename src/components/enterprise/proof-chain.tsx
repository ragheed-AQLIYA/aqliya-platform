import { cn } from "@/lib/utils";

interface ProofChainProps {
  className?: string;
}

const chain = [
  { label: "البيانات المصدرية", icon: "◆" },
  { label: "منطق المعالجة", icon: "◇" },
  { label: "المخرج المتولد", icon: "●" },
  { label: "ربط الأدلة", icon: "○" },
  { label: "المراجعة البشرية", icon: "▲" },
  { label: "القرار المعتمد", icon: "■" },
];

const statements = [
  "كل مخرج له مصدر.",
  "كل توصية لها سبب.",
  "كل مراجعة لها أثر.",
  "كل قرار له سجل.",
];

export function ProofChain({ className }: ProofChainProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[#0B1728] p-5 shadow-2xl sm:p-8",
        className,
      )}
    >
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        role="list"
        aria-label="سلسلة الثقة والإثبات"
      >
        {chain.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-2 sm:gap-3"
            role="listitem"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-all hover:border-aqliya-cyan/30 hover:bg-aqliya-cyan/5">
              <span className="text-aqliya-cyan">{step.icon}</span>
              {step.label}
            </div>
            {i < chain.length - 1 && (
              <svg
                className="h-3 w-3 shrink-0 text-white/20 rtl:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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

      {/* Statements */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-6">
        {statements.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
          >
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqliya-cyan" />
            <span className="text-xs font-medium text-white/60">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
