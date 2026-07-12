"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markAsRead, markAllAsRead } from "@/actions/notification-actions"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
  readAt: string | null
}

interface NotificationsClientProps {
  initialNotifications: Notification[]
  initialTotal: number
}

const typeLabels: Record<string, string> = {
  task_assigned: "مهمة جديدة",
  review_needed: "مراجعة مطلوبة",
  approved: "تمت الموافقة",
  rejected: "تم الرفض",
  comment: "تعليق جديد",
  system: "إشعار نظام",
}

const typeIcons: Record<string, string> = {
  task_assigned: "📋",
  review_needed: "🔍",
  approved: "✅",
  rejected: "❌",
  comment: "💬",
  system: "🔔",
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "الآن"
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 7) return `منذ ${days} يوم`
  return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" })
}

export function NotificationsClient({ initialNotifications, initialTotal }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [total, setTotal] = useState(initialTotal)
  const router = useRouter()

  async function handleMarkAsRead(id: string) {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
    )
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {unreadCount > 0
              ? `${unreadCount} إشعار غير مقروء`
              : "جميع الإشعارات مقروءة"}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 items-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl">🔔</span>
          <h3 className="mt-4 text-lg font-semibold">لا توجد إشعارات</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ستظهر هنا الإشعارات الجديدة عند ورودها
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                !n.read ? "bg-blue-50/50" : ""
              }`}
            >
              <span className="mt-0.5 text-lg">{typeIcons[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {typeLabels[n.type] ?? n.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(new Date(n.createdAt))}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="rounded-full bg-blue-500 p-1 text-white hover:bg-blue-600"
                        title="تحديد كمقروء"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {n.body && (
                  <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                )}
                {n.link && (
                  <button
                    onClick={() => router.push(n.link!)}
                    className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    عرض التفاصيل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
