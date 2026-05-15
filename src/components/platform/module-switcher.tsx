"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { ShieldCheck, TrendingUp, Brain } from "lucide-react"
import { useState } from "react"

const modules = [
  {
    id: "audit",
    name: "AuditOS",
    nameAr: "التدقيق",
    icon: ShieldCheck,
    href: "/audit",
    accent: "text-module-audit",
    bgActive: "bg-module-audit/10",
    borderActive: "border-module-audit",
  },
  {
    id: "decision",
    name: "DecisionOS",
    nameAr: "القرارات",
    icon: Brain,
    href: "/decisions",
    accent: "text-module-decision",
    bgActive: "bg-module-decision/10",
    borderActive: "border-module-decision",
  },
  {
    id: "sales",
    name: "SalesOS",
    nameAr: "المبيعات",
    icon: TrendingUp,
    href: "/sales",
    accent: "text-module-sales",
    bgActive: "bg-module-sales/10",
    borderActive: "border-module-sales",
  },
]

function getActiveModule(pathname: string | null) {
  if (!pathname) return "decision"
  if (pathname.startsWith("/audit")) return "audit"
  if (pathname.startsWith("/sales")) return "sales"
  if (pathname.startsWith("/decisions") || pathname.startsWith("/organizations") || pathname.startsWith("/intelligence")) return "decision"
  return "decision"
}

interface ModuleSwitcherProps {
  className?: string
  variant?: "dropdown" | "tabs" | "compact"
}

export function ModuleSwitcher({ className, variant = "dropdown" }: ModuleSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const activeModule = getActiveModule(pathname)
  const currentModule = modules.find((m) => m.id === activeModule) || modules[0]

  if (variant === "tabs") {
    return (
      <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted/50", className)}>
        {modules.map((module) => {
          const isActive = module.id === activeModule
          return (
            <button
              key={module.id}
              onClick={() => router.push(module.href)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? cn("bg-background shadow-sm", module.accent)
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <module.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{module.name}</span>
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <currentModule.icon className={cn("h-4 w-4", currentModule.accent)} />
        <span className={cn("text-sm font-semibold", currentModule.accent)}>
          {currentModule.name}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
          currentModule.accent
        )}
      >
        <currentModule.icon className="h-4 w-4" />
        <span>{currentModule.name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-lg border bg-background p-1 shadow-lg">
            {modules.map((module) => {
              const isActive = module.id === activeModule
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    router.push(module.href)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? cn(module.bgActive, module.accent, "font-medium")
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <module.icon className="h-4 w-4" />
                  <span>{module.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
