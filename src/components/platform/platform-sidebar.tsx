"use client";

import { cn } from "@/lib/utils";
import { usePlatformSidebar } from "./components/use-platform-sidebar";
import { SidebarMobileOverlay } from "./components/sidebar-mobile-overlay";
import { SidebarBrand } from "./components/sidebar-brand";
import { SidebarModuleSwitcher } from "./components/sidebar-module-switcher";
import { SidebarOrganizationContext } from "./components/sidebar-organization-context";
import { SidebarNavigation } from "./components/sidebar-navigation";
import { SidebarFooter } from "./components/sidebar-footer";

export function PlatformSidebar({
  mobileOpen = false,
  onCloseMobile,
}: {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const {
    collapsed,
    moduleOpen,
    activeModule,
    currentModule,
    navItems,
    pathname,
    modules,
    setCollapsed,
    setModuleOpen,
  } = usePlatformSidebar();

  return (
    <>
      <SidebarMobileOverlay mobileOpen={mobileOpen} onCloseMobile={onCloseMobile} />
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-l bg-sidebar transition-transform duration-300",
          collapsed ? "w-16" : "w-64",
          "fixed right-0 top-0 z-50 h-full md:relative md:z-auto",
          mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        <SidebarBrand
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onCloseMobile={onCloseMobile}
        />
        <SidebarModuleSwitcher
          collapsed={collapsed}
          moduleOpen={moduleOpen}
          currentModule={currentModule}
          modules={modules}
          activeModule={activeModule}
          onToggle={() => setModuleOpen(!moduleOpen)}
        />
        <SidebarOrganizationContext collapsed={collapsed} />
        <SidebarNavigation
          collapsed={collapsed}
          navItems={navItems}
          pathname={pathname}
          onCloseMobile={onCloseMobile}
        />
        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
}
