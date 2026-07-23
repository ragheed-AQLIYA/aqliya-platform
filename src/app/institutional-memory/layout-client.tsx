"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/institutional-memory", label: "لوحة المعلومات", labelEn: "Dashboard", icon: "📊" },
  { href: "/institutional-memory/events", label: "الأحداث", labelEn: "Events", icon: "🔗" },
  { href: "/institutional-memory/collections", label: "المجموعات", labelEn: "Collections", icon: "📁" },
  { href: "/institutional-memory/graph", label: "الرسم البياني", labelEn: "Graph", icon: "🕸️" },
];

export default function InstitutionalMemoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-l bg-card p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-bold">الذاكرة المؤسسية</h2>
          <p className="text-xs text-muted-foreground">Institutional Memory</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <div>
                  <div>{item.label}</div>
                  <div className="text-[10px] opacity-70">{item.labelEn}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="flex md:hidden gap-1 p-2 border-b overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
