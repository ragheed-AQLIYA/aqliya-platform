"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileSpreadsheet,
  GitCompareArrows,
  ShieldCheck,
  FileText,
  StickyNote,
  FolderOpen,
  SearchCheck,
  ListChecks,
  Eye,
  CheckCircle2,
  FileOutput,
  History,
  Rocket,
} from "lucide-react"

interface TabCount {
  key: string
  count?: number
}

interface EngagementTabsProps {
  engagementId: string
  basePath?: string
  counts?: TabCount[]
  className?: string
}

const tabDefs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "trial-balance", label: "Trial Balance", icon: FileSpreadsheet },
  { key: "mapping", label: "Mapping", icon: GitCompareArrows },
  { key: "validation", label: "Validation", icon: ShieldCheck },
  { key: "statements", label: "Statements", icon: FileText },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "evidence", label: "Evidence", icon: FolderOpen },
  { key: "findings", label: "Findings", icon: SearchCheck },
  { key: "recommendations", label: "Recommendations", icon: ListChecks },
  { key: "review", label: "Reviews", icon: Eye },
  { key: "approval", label: "Approval", icon: CheckCircle2 },
  { key: "publication", label: "Publication", icon: FileOutput },
  { key: "audit-trail", label: "Audit Trail", icon: History },
  { key: "pilot", label: "Pilot", icon: Rocket },
]

function EngagementTabs({
  engagementId,
  basePath,
  counts = [],
  className,
}: EngagementTabsProps) {
  const pathname = usePathname()
  const base = basePath ?? `/audit/engagements/${engagementId}`

  const countMap = new Map<string, number>()
  counts.forEach((c) => countMap.set(c.key, c.count ?? 0))

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex gap-0.5 min-w-max border-b">
        {tabDefs.map((tab) => {
          const href = tab.key === "overview" ? base : `${base}/${tab.key}`
          const isActive = tab.key === "overview"
            ? (pathname === base)
            : (pathname === href || pathname?.startsWith(href + "/") || false)
          const tabCount = countMap.get(tab.key)

          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tabCount !== undefined && tabCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-bold leading-none",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tabCount > 99 ? "99+" : tabCount}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export { EngagementTabs, tabDefs }
export type { EngagementTabsProps, TabCount }
