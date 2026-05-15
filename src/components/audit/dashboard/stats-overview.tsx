"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Briefcase, Activity, MessageSquare, AlertTriangle, FileSearch,
  CheckCircle, Send,
} from "lucide-react"

interface StatItem {
  label: string
  value: number
  icon: React.ReactNode
  trend?: { direction: "up" | "down"; value: string }
  variant?: "default" | "warning" | "danger"
}

interface StatsOverviewProps {
  stats: {
    totalEngagements: number
    activeEngagements: number
    pendingReviews: number
    openFindings: number
    missingEvidence: number
    readyForApproval: number
    publishedCount: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const items: StatItem[] = [
    {
      label: "إجمالي المهام",
      value: stats.totalEngagements,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      label: "نشط",
      value: stats.activeEngagements,
      icon: <Activity className="h-5 w-5" />,
      trend: { direction: "up", value: "2" },
    },
    {
      label: "مراجعات معلقة",
      value: stats.pendingReviews,
      icon: <MessageSquare className="h-5 w-5" />,
      variant: "warning",
    },
    {
      label: "نتائج مفتوحة",
      value: stats.openFindings,
      icon: <AlertTriangle className="h-5 w-5" />,
      variant: stats.openFindings > 0 ? "danger" : "default",
    },
    {
      label: "أدلة مفقودة",
      value: stats.missingEvidence,
      icon: <FileSearch className="h-5 w-5" />,
      variant: stats.missingEvidence > 0 ? "danger" : "default",
    },
    {
      label: "جاهز للاعتماد",
      value: stats.readyForApproval,
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "منشور",
      value: stats.publishedCount,
      icon: <Send className="h-5 w-5" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardContent className="flex flex-col gap-2 p-0 px-3 py-3">
            <div className="flex items-center justify-between">
              <span className={item.variant === "danger" ? "text-destructive" : item.variant === "warning" ? "text-amber-500" : "text-muted-foreground"}>
                {item.icon}
              </span>
              {item.trend && (
                <span className={`text-xs font-medium ${item.trend.direction === "up" ? "text-emerald-500" : "text-red-500"}`}>
                  {item.trend.direction === "up" ? "+" : "-"}{item.trend.value}
                </span>
              )}
            </div>
            <span className="text-2xl font-bold tracking-tight">{item.value}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
