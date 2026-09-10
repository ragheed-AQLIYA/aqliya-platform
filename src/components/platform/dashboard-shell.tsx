"use client";

import { useState, useCallback } from "react";
import { PlatformSidebar } from "./platform-sidebar";
import { PlatformHeader } from "./platform-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen" dir="rtl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[9999] focus:bg-background focus:px-4 focus:py-2 focus:border focus:rounded-md focus:text-sm">
        انتقل إلى المحتوى الرئيسي
      </a>
      <PlatformSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header role="banner">
          <PlatformHeader onToggleSidebar={toggleSidebar} />
        </header>
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
