import { cn } from "@/lib/utils"

interface CompanyProductMapProps {
  className?: string
}

const products = [
  { name: "Custom Enterprise Systems", desc: "أنظمة مبنية من الصفر حسب طبيعة العمل", icon: "⬡" },
  { name: "DecisionOS", desc: "تنظيم القرارات من المشكلة إلى الاعتماد", icon: "◆" },
  { name: "SimulationOS", desc: "اختبار السيناريوهات قبل التنفيذ", icon: "◈" },
  { name: "SalesOS", desc: "تأهيل وترتيب ومتابعة الفرص", icon: "▲" },
  { name: "AuditOS", desc: "المراجعة والتدقيق والذكاء المالي", icon: "●" },
  { name: "Local Content OS", desc: "إدارة الموردين والالتزام والمؤشرات", icon: "▤" },
]

export function CompanyProductMap({ className }: CompanyProductMapProps) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      {/* Parent Company Panel */}
      <div className="relative rounded-xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-background p-6 shadow-lg">
        <div className="flex items-center gap-4 border-b border-primary/10 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-black text-primary-foreground shadow-md">
            A
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">AQLIYA — عقلية</h3>
            <p className="text-sm text-muted-foreground">الشركة الأم لبناء الأنظمة المؤسسية</p>
          </div>
          <div className="mr-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Parent Company
          </div>
        </div>

        {/* Connection Lines Container */}
        <div className="relative mt-4 pr-6 rtl:pr-0 rtl:pl-6">
          {/* Vertical Connection Line */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent rtl:right-auto rtl:left-0" />

          {/* Product Lines */}
          <div className="space-y-2">
            {products.map((product, i) => (
              <div key={i} className="group relative flex items-center gap-3">
                {/* Horizontal Connection */}
                <div className="absolute -right-6 top-1/2 h-px w-6 bg-primary/20 rtl:-right-auto rtl:-left-6" />
                <div className="absolute -right-1.5 top-1/2 h-3 w-px bg-primary/20 rtl:-right-auto rtl:-left-1.5" />

                {/* Product Panel */}
                <div className="flex flex-1 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-sm text-muted-foreground group-hover:border-primary/30 group-hover:text-primary">
                    {product.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{product.name}</div>
                    <div className="text-[11px] text-muted-foreground">{product.desc}</div>
                  </div>
                  <div className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
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
