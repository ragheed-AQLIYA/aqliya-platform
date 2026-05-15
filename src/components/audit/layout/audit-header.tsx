"use client"

import Link from "next/link"
import { ChevronRight, ChevronDown, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/audit/shared/status-badge"

interface Breadcrumb {
  label: string
  href?: string
}

interface AuditHeaderProps {
  breadcrumbs?: Breadcrumb[]
  engagementName?: string
  engagementStatus?: string
  userName?: string
  className?: string
}

function AuditHeader({
  breadcrumbs = [],
  engagementName,
  engagementStatus,
  userName = "User",
  className,
}: AuditHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {engagementName && (
          <>
            <span className="h-4 w-px bg-border" />
            <span className="text-sm font-semibold text-foreground truncate">
              {engagementName}
            </span>
            {engagementStatus && <StatusBadge status={engagementStatus} size="sm" />}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="group relative">
          <Button variant="ghost" size="sm" className="gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm sm:inline">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-lg border bg-background py-1 shadow-md group-focus-within:block group-hover:block">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-[10px] text-muted-foreground">مدقق</p>
            </div>
            <Link
              href="/audit/settings"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <User className="h-3.5 w-3.5" />
              الملف الشخصي
            </Link>
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export { AuditHeader }
export type { AuditHeaderProps, Breadcrumb }
