"use client"

import { AlertTriangle, XCircle, Info, X } from "lucide-react"
import { useState } from "react"
import type { EngagementAlert } from "@/types/audit"

const alertConfig = {
  warning: { icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300" },
  error: { icon: XCircle, className: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300" },
  info: { icon: Info, className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300" },
}

interface AlertsBarProps {
  alerts: EngagementAlert[]
}

export function AlertsBar({ alerts }: AlertsBarProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  if (alerts.length === 0) return null

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const config = alertConfig[alert.type]
        const Icon = config.icon
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${config.className}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <span>{alert.message}</span>
              <span className="ml-2 text-xs opacity-70">({alert.source})</span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
              className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss alert"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
