import Link from "next/link"

const ACTIONS = [
  { label: "مهمة تدقيق جديدة", href: "/audit/engagements/new", icon: "📋" },
  { label: "قرار جديد", href: "/decisions/new", icon: "📊" },
  { label: "مشروع محتوى محلي", href: "/local-content/projects/new", icon: "📁" },
  { label: "رفع ميزان مراجعة", href: "/audit/trial-balance/upload", icon: "📄" },
  { label: "تقرير جديد", href: "/reports/new", icon: "📝" },
]

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">إجراءات سريعة</h2>
      </div>
      <div className="divide-y">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
          >
            <span className="text-lg">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
