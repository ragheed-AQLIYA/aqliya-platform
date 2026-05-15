"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Brain,
  Search,
  FileText,
  Plus,
  Clock,
  Settings,
  Users,
  BarChart3,
  Command,
  History,
  Zap,
  FolderOpen,
  Target,
  Building2,
} from "lucide-react"

type CommandCategory = "navigate" | "module" | "create" | "review" | "recent" | "settings" | "entity"

interface CommandEntry {
  id: string
  label: string
  labelAr?: string
  icon: React.ElementType
  category: CommandCategory
  href?: string
  action?: () => void
  shortcut?: string
  module?: string
  score?: number
}

interface PlatformCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const baseCommands: CommandEntry[] = [
  // Navigate
  { id: "nav-decisions", label: "Decision Intelligence", labelAr: "الذكاء القرارات", icon: LayoutDashboard, category: "navigate", href: "/decisions", shortcut: "G D" },
  { id: "nav-audit", label: "AuditOS Dashboard", labelAr: "لوحة التدقيق", icon: ShieldCheck, category: "navigate", href: "/audit", shortcut: "G A" },
  { id: "nav-sales", label: "SalesOS Dashboard", labelAr: "لوحة المبيعات", icon: TrendingUp, category: "navigate", href: "/sales", shortcut: "G S" },
  { id: "nav-organizations", label: "Organizations", labelAr: "المنظمات", icon: Users, category: "navigate", href: "/organizations" },
  { id: "nav-intelligence", label: "Intelligence Sectors", labelAr: "قطاعات الذكاء", icon: BarChart3, category: "navigate", href: "/intelligence/sectors" },

  // Module Switch
  { id: "module-audit", label: "Switch to AuditOS", labelAr: "نظام التدقيق", icon: ShieldCheck, category: "module", href: "/audit", module: "audit" },
  { id: "module-decision", label: "Switch to DecisionOS", labelAr: "نظام القرارات", icon: Brain, category: "module", href: "/decisions", module: "decision" },
  { id: "module-sales", label: "Switch to SalesOS", labelAr: "نظام المبيعات", icon: TrendingUp, category: "module", href: "/sales", module: "sales" },

  // Create
  { id: "create-decision", label: "New Decision", labelAr: "قرار جديد", icon: Plus, category: "create", href: "/decisions/new", shortcut: "N" },
  { id: "create-engagement", label: "New Engagement", labelAr: "مهمة جديدة", icon: Plus, category: "create", href: "/audit" },
  { id: "create-deal", label: "New Deal", labelAr: "صفقة جديدة", icon: Plus, category: "create", href: "/sales" },

  // Review
  { id: "review-pending", label: "Pending Reviews", labelAr: "المراجعات المعلقة", icon: Clock, category: "review", href: "/audit" },
  { id: "review-approvals", label: "Pending Approvals", labelAr: "الموافقات المعلقة", icon: ShieldCheck, category: "review", href: "/audit" },
  { id: "review-findings", label: "Open Findings", labelAr: "الملاحظات المفتوحة", icon: FolderOpen, category: "review", href: "/audit" },

  // Settings
  { id: "settings", label: "Settings", labelAr: "الإعدادات", icon: Settings, category: "settings", href: "/settings", shortcut: "," },
]

// Mock recent entities (would come from workspace context in production)
const recentEntities: CommandEntry[] = [
  { id: "recent-1", label: "Acme Corp — FY2025 Audit", icon: ShieldCheck, category: "recent", href: "/audit/engagements/acme-2025", score: 100 },
  { id: "recent-2", label: "Q3 Investment Decision", icon: Brain, category: "recent", href: "/decisions/q3-investment", score: 90 },
  { id: "recent-3", label: "Enterprise Deal — Global Finance", icon: TrendingUp, category: "recent", href: "/sales/deals/global-finance", score: 80 },
  { id: "recent-4", label: "TechStart Inc — Engagement", icon: ShieldCheck, category: "recent", href: "/audit/engagements/techstart", score: 70 },
  { id: "recent-5", label: "Market Expansion Decision", icon: Brain, category: "recent", href: "/decisions/market-expansion", score: 60 },
]

// Mock entity search results (would come from search API in production)
const searchableEntities: CommandEntry[] = [
  { id: "entity-d1", label: "Decision: Q3 Investment", icon: Brain, category: "entity", href: "/decisions/q3-investment" },
  { id: "entity-d2", label: "Decision: Market Expansion", icon: Brain, category: "entity", href: "/decisions/market-expansion" },
  { id: "entity-d3", label: "Decision: Hiring Plan 2025", icon: Brain, category: "entity", href: "/decisions/hiring-2025" },
  { id: "entity-a1", label: "Engagement: Acme Corp FY2025", icon: ShieldCheck, category: "entity", href: "/audit/engagements/acme-2025" },
  { id: "entity-a2", label: "Engagement: TechStart Inc", icon: ShieldCheck, category: "entity", href: "/audit/engagements/techstart" },
  { id: "entity-s1", label: "Deal: Global Finance", icon: TrendingUp, category: "entity", href: "/sales/deals/global-finance" },
  { id: "entity-s2", label: "Deal: DataFlow Ltd", icon: TrendingUp, category: "entity", href: "/sales/deals/dataflow" },
]

export function PlatformCommandPalette({ open, onOpenChange }: PlatformCommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState("")

  const handleAction = useCallback(
    (command: CommandEntry) => {
      if (command.href) {
        router.push(command.href)
      } else if (command.action) {
        command.action()
      }
      onOpenChange(false)
      setSearch("")
    },
    [router, onOpenChange]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  // Hotkey navigation (G+D/A/S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open) return
      if (e.key === "g") {
        const nextKey = (e2: KeyboardEvent) => {
          if (e2.key === "d") { router.push("/decisions"); e2.preventDefault() }
          if (e2.key === "a") { router.push("/audit"); e2.preventDefault() }
          if (e2.key === "s") { router.push("/sales"); e2.preventDefault() }
          window.removeEventListener("keydown", nextKey)
        }
        window.addEventListener("keydown", nextKey, { once: true })
        setTimeout(() => window.removeEventListener("keydown", nextKey), 1000)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, router])

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return baseCommands

    const query = search.toLowerCase()
    const allSearchable = [...searchableEntities, ...recentEntities]
    return allSearchable.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        (cmd.labelAr && cmd.labelAr.includes(query))
    )
  }, [search])

  const navigateCommands = filteredCommands.filter((c) => c.category === "navigate" || !search)
  const moduleCommands = filteredCommands.filter((c) => c.category === "module")
  const createCommands = filteredCommands.filter((c) => c.category === "create")
  const reviewCommands = filteredCommands.filter((c) => c.category === "review")
  const settingsCommands = filteredCommands.filter((c) => c.category === "settings")
  const entityCommands = filteredCommands.filter((c) => c.category === "entity")
  const recentCommands = search ? [] : recentEntities

  function getModuleColor(module?: string): string {
    switch (module) {
      case "audit": return "text-module-audit"
      case "sales": return "text-module-sales"
      case "decision": return "text-module-decision"
      default: return "text-aqliya-blue"
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search commands, entities, or navigate..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Search Results */}
        {search && entityCommands.length > 0 && (
          <>
            <CommandGroup heading="Entities">
              {entityCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigate */}
        {!search && navigateCommands.length > 0 && (
          <>
            <CommandGroup heading="Navigate">
              {navigateCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Module Switch */}
        {!search && moduleCommands.length > 0 && (
          <>
            <CommandGroup heading="Switch Module">
              {moduleCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className={cn("h-4 w-4", getModuleColor(cmd.module))} />
                  <span>{cmd.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Create */}
        {!search && createCommands.length > 0 && (
          <>
            <CommandGroup heading="Create">
              {createCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Review */}
        {!search && reviewCommands.length > 0 && (
          <>
            <CommandGroup heading="Review">
              {reviewCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Recent */}
        {!search && recentCommands.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                  <History className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Settings */}
        {!search && settingsCommands.length > 0 && (
          <CommandGroup heading="Settings">
            {settingsCommands.map((cmd) => (
              <CommandItem key={cmd.id} onSelect={() => handleAction(cmd)}>
                <cmd.icon className="h-4 w-4 text-muted-foreground" />
                <span>{cmd.label}</span>
                {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
