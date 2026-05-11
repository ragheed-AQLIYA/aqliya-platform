import { cn } from "@/lib/utils"

interface ProofChainProps {
  className?: string
}

const chain = [
  { label: "Source Data", icon: "◆" },
  { label: "Processing Logic", icon: "◇" },
  { label: "Generated Output", icon: "●" },
  { label: "Evidence Link", icon: "○" },
  { label: "Human Review", icon: "▲" },
  { label: "Approved Decision", icon: "■" },
]

const statements = [
  "كل مخرج له مصدر.",
  "كل توصية لها سبب.",
  "كل مراجعة لها أثر.",
  "كل قرار له سجل.",
]

export function ProofChain({ className }: ProofChainProps) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-[#0B1728] p-5 sm:p-8 shadow-2xl", className)}>
      {/* Chain */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {chain.map((step, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-all hover:border-[#137dc5]/30 hover:bg-[#137dc5]/5">
              <span className="text-[#137dc5]">{step.icon}</span>
              {step.label}
            </div>
            {i < chain.length - 1 && (
              <svg className="h-3 w-3 shrink-0 text-white/20 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div key={i} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-3 py-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#137dc5]" />
            <span className="text-xs font-medium text-white/60">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
