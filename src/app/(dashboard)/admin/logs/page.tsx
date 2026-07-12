import "server-only"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { listAuditEvents } from "@/actions/admin-actions"
import { EmptyState } from "@/components/ui/empty-state"

export const dynamic = "force-dynamic"

export default async function AdminLogsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/access-denied")

  let events: Array<{
    id: string
    action: string
    targetType: string | null
    targetId: string | null
    actorId: string | null
    metadata: unknown
    createdAt: Date
  }> = []
  let total = 0

  try {
    const result = await listAuditEvents(user.organizationId!, 50, 0)
    events = result.events
    total = result.total
  } catch {
    // fall through to empty state
  }

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← العودة إلى لوحة الإدارة
        </Link>
        <h1 className="text-2xl font-bold">سجل التدقيق</h1>
        <p className="text-sm text-muted-foreground">
          إجمالي {total} حدث
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="لا توجد أحداث"
          description="لم يتم تسجيل أي أحداث تدقيق بعد"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium">الوقت</th>
                <th className="p-3 text-right font-medium">الإجراء</th>
                <th className="p-3 text-right font-medium">النوع</th>
                <th className="p-3 text-right font-medium">المرجع</th>
                <th className="p-3 text-right font-medium">المستخدم</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap" dir="ltr">
                    {event.createdAt.toLocaleString("ar-SA")}
                  </td>
                  <td className="p-3 font-medium">{event.action}</td>
                  <td className="p-3 text-muted-foreground">{event.targetType ?? "—"}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground" dir="ltr">
                    {event.targetId ? event.targetId.slice(0, 8) + "…" : "—"}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground" dir="ltr">
                    {event.actorId ? event.actorId.slice(0, 8) + "…" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 50 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          عرض أول 50 حدثاً من أصل {total}
        </p>
      )}
    </main>
  )
}
