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
      <PlatformSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlatformHeader onToggleSidebar={toggleSidebar} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
