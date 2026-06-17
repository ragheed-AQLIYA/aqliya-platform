"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Brain,
  KanbanSquare,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Bot,
  Globe,
  FileText,
  FileSpreadsheet,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const modules = [
  {
    id: "audit",
    name: "AuditOS",
    nameAr: "نظام التدقيق المالي",
    icon: ShieldCheck,
    href: "/audit",
    color: "text-module-audit",
    bgActive: "bg-module-audit/10",
    borderActive: "border-l-module-audit",
  },
  {
    id: "decision",
    name: "DecisionOS",
    nameAr: "نظام القرارات",
    icon: Brain,
    href: "/decisions",
    color: "text-module-decision",
    bgActive: "bg-module-decision/10",
    borderActive: "border-l-module-decision",
  },
  {
    id: "workflowos",
    name: "WorkflowOS",
    nameAr: "سير العمل الذكي",
    icon: KanbanSquare,
    href: "/workflowos",
    color: "text-aqliya-cyan",
    bgActive: "bg-aqliya-cyan/10",
    borderActive: "border-l-aqliya-cyan",
  },
  {
    id: "localContent",
    name: "LocalContentOS",
    nameAr: "المحتوى المحلي",
    icon: Globe,
    href: "/local-content",
    color: "text-module-localcontent",
    bgActive: "bg-module-localcontent/10",
    borderActive: "border-l-module-localcontent",
  },
];

const platformNav = [
  {
    name: "Decision Intelligence",
    nameAr: "الذكاء القرارات",
    href: "/decisions",
    icon: LayoutDashboard,
  },
  {
    name: "Sunbul Company",
    nameAr: "شركة سنبل",
    href: "/organizations/sunbul",
    icon: Building2,
  },
  { name: "الذكاء", href: "/intelligence/sectors", icon: Brain },
  { name: "الإعدادات", href: "/settings", icon: Settings },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
  {
    name: "Skills Evaluation",
    nameAr: "تقييم المهارات",
    href: "/settings/skills/evaluate",
    icon: BarChart3,
  },
];

const auditNav = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/audit",
    icon: LayoutDashboard,
  },
  { name: "Engagements", nameAr: "المهام", href: "/audit", icon: ShieldCheck },
  { name: "Clients", nameAr: "العملاء", href: "/audit", icon: Users },
  { name: "Evidence", nameAr: "الأدلة", href: "/audit", icon: LayoutDashboard },
  {
    name: "Findings",
    nameAr: "الملاحظات",
    href: "/audit",
    icon: LayoutDashboard,
  },
  {
    name: "Reviews",
    nameAr: "المراجعات",
    href: "/audit",
    icon: LayoutDashboard,
  },
  { name: "Approval", nameAr: "الموافقة", href: "/audit", icon: ShieldCheck },
  {
    name: "Audit Trail",
    nameAr: "سجل التدقيق",
    href: "/audit",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
  {
    name: "Skills Evaluation",
    nameAr: "تقييم المهارات",
    href: "/settings/skills/evaluate",
    icon: BarChart3,
  },
];

function getActiveModule(pathname: string | null) {
  if (!pathname) return "decision";
  if (pathname.startsWith("/audit")) return "audit";
  if (pathname.startsWith("/local-content")) return "localContent";
  if (pathname.startsWith("/workflowos") || pathname.startsWith("/sunbul"))
    return "workflowos";
  if (
    pathname.startsWith("/decisions") ||
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/intelligence")
  )
    return "decision";
  return "decision";
}

function getModuleNav(moduleId: string) {
  switch (moduleId) {
    case "audit":
      return auditNav;
    case "sales":
      return salesNav;
    case "workflowos":
      return workflowosNav;
    case "localContent":
      return localContentNav;
    case "decision":
      return platformNav;
    default:
      return platformNav;
  }
}

const salesNav = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/sales",
    icon: LayoutDashboard,
  },
  { name: "المنظمات", href: "/organizations", icon: Users },
  { name: "الإعدادات", href: "/settings", icon: Settings },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
];

const workflowosNav = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/workflowos",
    icon: LayoutDashboard,
  },
  {
    name: "Records",
    nameAr: "السجلات",
    href: "/workflowos/records",
    icon: FileText,
  },
  {
    name: "Templates",
    nameAr: "القوالب",
    href: "/workflowos/templates",
    icon: FolderKanban,
  },
  {
    name: "Admin Dashboard",
    nameAr: "لوحة الإدارة",
    href: "/workflowos/admin",
    icon: TrendingUp,
  },
  {
    name: "WorkflowOS Admin",
    nameAr: "إدارة سير العمل",
    href: "/workflowos/admin",
    icon: Settings,
  },
];

const localContentNav = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/local-content",
    icon: LayoutDashboard,
  },
  {
    name: "AI Quality",
    nameAr: "جودة الذكاء",
    href: "/local-content/quality-dashboard",
    icon: BarChart3,
  },
  {
    name: "AI Advisor",
    nameAr: "المستشار الذكي",
    href: "/local-content/ai-advisor",
    icon: Brain,
  },
  {
    name: "Review Center",
    nameAr: "مركز المراجعة",
    href: "/local-content/review-center",
    icon: FileText,
  },
  {
    name: "Pilot Readiness",
    nameAr: "الجاهزية التشغيلية",
    href: "/local-content/pilot-readiness",
    icon: ShieldCheck,
  },
  {
    name: "Projects",
    nameAr: "المشاريع",
    href: "/local-content/projects",
    icon: Globe,
  },
  {
    name: "Workbook Engine",
    nameAr: "محرك الدفتر",
    href: "/local-content/workbook",
    icon: FileSpreadsheet,
  },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);

  const activeModule = getActiveModule(pathname);
  const currentModule =
    modules.find((m) => m.id === activeModule) || modules[0];
  const navItems = getModuleNav(activeModule);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-l bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center border-b px-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 min-w-0"
          aria-label="AQLIYA — منصة ذكاء مؤسسي خاص ومحكوم"
        >
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={116}
            height={34}
            priority
            className="h-7 w-auto shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-bold tracking-wide text-primary truncate">
                AQLIYA
              </div>
              <div className="text-[9px] font-medium tracking-wider text-muted-foreground truncate">
                منصة ذكاء مؤسسي خاص ومحكوم
              </div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="mr-auto p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Module Switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => setModuleOpen(!moduleOpen)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              currentModule.bgActive,
              currentModule.color,
            )}
          >
            <currentModule.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentModule.nameAr}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 mr-auto transition-transform",
                moduleOpen && "rotate-180",
              )}
            />
          </button>

          {moduleOpen && (
            <div className="mt-1 space-y-0.5 rounded-md border bg-background p-1">
              {modules.map((module) => {
                const isActive = module.id === activeModule;
                return (
                  <Link
                    key={module.id}
                    href={module.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? cn(module.bgActive, module.color, "font-medium")
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <module.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{module.nameAr}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Current Organization Context */}
      {!collapsed && (
        <div className="px-3 pb-1">
          <Link
            href="/organizations/sunbul"
            className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 hover:bg-muted transition-colors"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
              S
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-medium text-foreground truncate">
                Sunbul
              </div>
              <div className="text-[9px] text-muted-foreground truncate">
                المؤسسة الحالية
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">
                  {"nameAr" in item && item.nameAr ? item.nameAr : item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t p-3">
          <div className="rounded-md bg-muted/50 px-3 py-2">
            <div className="text-[10px] font-medium tracking-wider text-muted-foreground">
              منصة ذكاء مؤسسي خاص ومحكوم
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              الإصدار 1.1
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
