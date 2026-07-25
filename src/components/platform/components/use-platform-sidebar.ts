"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { modules, getActiveModule, getModuleNav } from "./sidebar-data";

export function usePlatformSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);

  const activeModule = getActiveModule(pathname);
  const currentModule =
    modules.find((m) => m.id === activeModule) || modules[0];
  const navItems = getModuleNav(activeModule);

  return {
    pathname,
    collapsed,
    moduleOpen,
    activeModule,
    currentModule,
    navItems,
    modules,
    setCollapsed,
    setModuleOpen,
  };
}
