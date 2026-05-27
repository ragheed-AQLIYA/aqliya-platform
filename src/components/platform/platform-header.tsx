"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Command, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PlatformCommandPalette } from "./command-palette";

function getWorkspaceInfo(pathname: string | null) {
  if (!pathname)
    return {
      module: "منصة عقلية",
      moduleAr: "حوكمة القرارات",
      accent: "text-module-decision",
    };
  if (pathname.startsWith("/workflowos") || pathname.startsWith("/sunbul"))
    return {
      module: "Sunbul",
      moduleAr: "سنبل",
      accent: "text-aqliya-cyan",
    };
  if (pathname.startsWith("/audit"))
    return {
      module: "AuditOS",
      moduleAr: "نظام التدقيق المالي",
      accent: "text-module-audit",
    };
  if (pathname.startsWith("/local-content"))
    return {
      module: "LocalContentOS",
      moduleAr: "نظام المحتوى المحلي",
      accent: "text-module-localcontent",
    };
  if (pathname.startsWith("/sales"))
    return {
      module: "SalesOS",
      moduleAr: "الذاكرة التجارية والمبيعات",
      accent: "text-module-sales",
    };
  if (pathname.startsWith("/decisions"))
    return {
      module: "DecisionOS",
      moduleAr: "حوكمة القرارات",
      accent: "text-module-decision",
    };
  if (pathname === "/organizations/sunbul")
    return {
      module: "Sunbul",
      moduleAr: "شركة سنبل",
      accent: "text-aqliya-cyan",
    };
  if (pathname.startsWith("/organizations"))
    return {
      module: "DecisionOS",
      moduleAr: "حوكمة القرارات",
      accent: "text-module-decision",
    };
  if (pathname.startsWith("/intelligence"))
    return {
      module: "DecisionOS",
      moduleAr: "حوكمة القرارات",
      accent: "text-module-decision",
    };
  if (pathname.startsWith("/settings"))
    return {
      module: "منصة عقلية",
      moduleAr: "الإعدادات",
      accent: "text-muted-foreground",
    };
  return {
    module: "منصة عقلية",
    moduleAr: "مساحة العمل",
    accent: "text-aqliya-blue",
  };
}

function getPageTitle(pathname: string | null) {
  if (!pathname) return "";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "";
  const last = segments[segments.length - 1];
  const map: Record<string, string> = {
    new: "جديد",
    framework: "الإطار",
    governance: "الحوكمة",
    insight: "الرؤى",
    intake: "الاستقبال",
    outcome: "النتيجة",
    overview: "نظرة عامة",
    recommendation: "التوصية",
    report: "التقرير",
    risks: "المخاطر",
    scenarios: "السيناريوهات",
    sector: "القطاع",
    signals: "المؤشرات",
    simulation: "المحاكاة",
    tender: "المنافسة",
    "what-to-do": "الإجراء المقترح",
    projects: "المشاريع",
    engagements: "الارتباطات",
    approval: "الاعتماد",
    "audit-trail": "سجل التدقيق",
    evidence: "الأدلة",
    findings: "الملاحظات",
    mapping: "الربط",
    notes: "الإيضاحات",
    pilot: "التفعيل الأولي",
    publication: "النشر",
    recommendations: "التوصيات",
    review: "المراجعة",
    statements: "القوائم",
    "trial-balance": "ميزان المراجعة",
    validation: "التحقق",
    organizations: "المنظمات",
    sunbul: "شركة سنبل",
    settings: "الإعدادات",
  };
  return map[last] ?? last.replace(/-/g, " ");
}

export function PlatformHeader() {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const workspace = getWorkspaceInfo(pathname);
  const pageTitle = getPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Mobile logo + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 md:hidden"
              aria-label="AQLIYA"
            >
              <Image
                src="/brand/aqliya-logo-approved.png"
                alt="AQLIYA"
                width={28}
                height={28}
                priority
              />
              <span className="font-bold text-primary">AQLIYA</span>
            </Link>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2">
              <span className={cn("text-sm font-semibold", workspace.accent)}>
                {workspace.moduleAr}
              </span>
              {pageTitle && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">
                    {pageTitle}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Search, Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Open command palette"
            >
              <Command className="h-3.5 w-3.5" />
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">ابحث في مساحة العمل...</span>
              <kbd className="ml-2 rounded bg-background px-1.5 py-0.5 text-[10px] font-mono border">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="sm:hidden rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Open command palette"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button
              className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-error" />
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">A</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </div>
        </div>
      </header>

      <PlatformCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </>
  );
}
