import { getCurrentUser } from "@/lib/auth"
import { getNotifications } from "@/actions/notification-actions"
import { NotificationsClient } from "./notifications-client"

export const dynamic = "force-dynamic"

function serialize(data: unknown) {
  return JSON.parse(JSON.stringify(data))
}

export default async function NotificationsPage() {
  await getCurrentUser()
  const { notifications, total } = await getNotifications(50, 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-sm text-muted-foreground">
            جميع الإشعارات والتنبيهات
          </p>
        </div>
        {total > 0 && (
          <p className="text-xs text-muted-foreground">
            إجمالي {total} إشعار
          </p>
        )}
      </div>
      <NotificationsClient
        initialNotifications={serialize(notifications)}
        initialTotal={total}
      />
    </div>
  )
}
