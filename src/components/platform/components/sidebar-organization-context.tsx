"use client";

import Link from "next/link";

interface SidebarOrganizationContextProps {
  collapsed: boolean;
}

export function SidebarOrganizationContext({
  collapsed,
}: SidebarOrganizationContextProps) {
  if (collapsed) return null;

  return (
    <div className="px-3 pb-1">
      <Link
        href="/organizations/sunbul"
        className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 hover:bg-muted transition-colors"
        aria-label="شركة سنبل — المؤسسة الحالية"
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
  );
}
