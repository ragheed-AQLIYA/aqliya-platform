import { getRecentActivity } from "@/actions/activity-actions"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import { Activity } from "lucide-react"

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "الآن"
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

const TYPE_ICONS: Record<string, string> = {
  audit_event: "📋",
  decision_event: "📊",
  project_event: "📁",
  system_event: "⚙️",
}

export async function ActivityFeed() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let activities: Awaited<ReturnType<typeof getRecentActivity>> = []
  try {
    activities = await getRecentActivity(15)
  } catch { /* silent */ }

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">آخر النشاطات</h2>
      </div>

      {activities.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<Activity className="h-8 w-8 text-muted-foreground/40" />}
            title="لا توجد نشاطات بعد"
            description="ستظهر النشاطات هنا عند بدء العمل على المنصة"
          />
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-4">
              <span className="text-lg">{TYPE_ICONS[activity.type] ?? "📌"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {activity.action}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.entityName}
                  {activity.actorName && ` — ${activity.actorName}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
