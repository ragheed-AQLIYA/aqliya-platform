"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavItem } from "./sidebar-data";

interface SidebarNavigationProps {
  collapsed: boolean;
  navItems: NavItem[];
  pathname: string | null;
  onCloseMobile?: () => void;
}

export function SidebarNavigation({
  collapsed,
  navItems,
  pathname,
  onCloseMobile,
}: SidebarNavigationProps) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onCloseMobile?.()}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={collapsed ? item.name : undefined}
            aria-label={item.nameAr ?? item.name}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="truncate">{item.nameAr ?? item.name}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
