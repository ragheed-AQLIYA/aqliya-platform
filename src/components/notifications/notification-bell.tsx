"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getUnreadNotifications, markAsRead, getUnreadCount } from "@/actions/notification-actions"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  createdAt: string
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        getUnreadNotifications(5),
        getUnreadCount(),
      ])
      setNotifications(notifs as unknown as Notification[])
      setUnreadCount(count)
    } catch {
      // Not authenticated — silent fail
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!cancelled) await fetchData()
    }
    load()
    const interval = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [fetchData])

  async function handleClick(notification: Notification) {
    await markAsRead(notification.id)
    setUnreadCount((c) => Math.max(0, c - 1))
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    if (notification.link) {
      router.push(notification.link)
    }
    setIsOpen(false)
  }

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted"
        aria-label={`الإشعارات (${unreadCount} غير مقروء)`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-1/2 z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="text-sm font-semibold">الإشعارات</h3>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    const { markAllAsRead } = await import("@/actions/notification-actions")
                    await markAllAsRead()
                    setNotifications([])
                    setUnreadCount(0)
                  }}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  لا توجد إشعارات جديدة
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="w-full border-b p-3 text-right last:border-0 hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    </div>
                    {n.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatTime(new Date(n.createdAt))}
                    </p>
                  </button>
                ))
              )}
            </div>
            
            <div className="border-t p-2">
              <button
                onClick={() => { router.push("/notifications"); setIsOpen(false) }}
                className="w-full rounded-lg p-2 text-center text-xs text-muted-foreground hover:bg-muted"
              >
                عرض جميع الإشعارات
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
