import { cn } from "@/lib/utils"

interface BrandArchitecturePanelProps {
  className?: string
}

const branches = [
  { name: "Custom Systems", desc: "أنظمة مبنية من الصفر حول طريقة العمل", icon: "⬡" },
  { name: "Decision Systems", desc: "قرارات موثقة وقابلة للمراجعة", icon: "◆" },
  { name: "Simulation Systems", desc: "اختبار السيناريوهات قبل التنفيذ", icon: "◈" },
  { name: "Sales Systems", desc: "تأهيل وترتيب ومتابعة الفرص", icon: "▲" },
  { name: "AQLIYA AuditOS", desc: "مراجعة وتدقيق قابل للتتبع", icon: "●" },
  { name: "Local Content Systems", desc: "موردون، إنفاق، التزام، مؤشرات", icon: "▤" },
]

export function BrandArchitecturePanel({ className }: BrandArchitecturePanelProps) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      <div className="rounded-xl border border-white/10 bg-[#0B1728] p-5 sm:p-6 shadow-2xl">
        {/* Core */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#137dc5] text-lg font-black text-white shadow-lg shadow-[#137dc5]/20">
            A
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">AQLIYA — عقلية</h3>
            <p className="text-xs text-white/50">Enterprise Systems Builder</p>
          </div>
          <div className="mr-auto rounded-full border border-[#137dc5]/30 bg-[#137dc5]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#137dc5]">
            Core
          </div>
        </div>

        {/* Branches */}
        <div className="relative mt-4 pr-5 rtl:pr-0 rtl:pl-5">
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#137dc5]/30 via-[#137dc5]/15 to-transparent rtl:right-auto rtl:left-0" />

          <div className="space-y-1.5">
            {branches.map((branch, i) => (
              <div key={i} className="group relative flex items-center gap-2.5">
                <div className="absolute -right-5 top-1/2 h-px w-5 bg-[#137dc5]/20 rtl:-right-auto rtl:-left-5" />
                <div className="absolute -right-1.5 top-1/2 h-2.5 w-px bg-[#137dc5]/20 rtl:-right-auto rtl:-left-1.5" />

                <div className="flex flex-1 items-center gap-2.5 rounded-md border border-white/8 bg-white/[0.03] px-3 py-2 transition-all group-hover:border-[#137dc5]/30 group-hover:bg-[#137dc5]/5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] text-white/50 group-hover:border-[#137dc5]/30 group-hover:text-[#137dc5]">
                    {branch.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white/80">{branch.name}</div>
                    <div className="text-[10px] text-white/40">{branch.desc}</div>
                  </div>
                  <div className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-white/30">
                    Product
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
