"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { PlatformCommandPalette } from "./command-palette";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";

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

export function PlatformHeader({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const workspace = getWorkspaceInfo(pathname);
  const pageTitle = getPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: hamburger + Mobile logo + Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Hamburger menu — mobile only */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 md:hidden"
              aria-label="AQLIYA"
            >
              <Image
                src="/brand/aqliya-logo-approved.png"
                alt="AQLIYA"
                width={116}
                height={34}
                priority
                className="h-7 w-auto shrink-0"
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

          {/* Right: Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Global Search (hidden on mobile) */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Mobile search / Command palette trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="بحث"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Command palette shortcut */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="لوحة الأوامر"
              title="فتح لوحة الأوامر"
            >
              <Command className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <button
              className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted transition-colors"
              aria-label="القائمة الشخصية"
            >
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
