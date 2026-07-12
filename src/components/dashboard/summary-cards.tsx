import { getActivitySummary } from "@/actions/activity-actions"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function SummaryCards() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const summary = await getActivitySummary()

  const cards = [
    { label: "مهام التدقيق", value: summary?.engagementCount ?? 0, color: "text-blue-600" },
    { label: "القرارات", value: summary?.decisionCount ?? 0, color: "text-purple-600" },
    { label: "مشاريع المحتوى المحلي", value: summary?.projectCount ?? 0, color: "text-emerald-600" },
    { label: "المستخدمون النشطون", value: summary?.activeUsers ?? 0, color: "text-amber-600" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className={`mt-1 text-3xl font-black ${card.color}`}>
            {card.value.toLocaleString("ar-SA")}
          </p>
        </div>
      ))}
    </div>
  )
}
