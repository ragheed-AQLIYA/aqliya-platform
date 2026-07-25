"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export function SidebarBrand({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}: SidebarBrandProps) {
  return (
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
      {collapsed ? (
        <button
          onClick={onToggleCollapse}
          className="mx-auto p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          aria-label="توسيع القائمة"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="mr-auto flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            aria-label="طي القائمة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            aria-label="إغلاق القائمة"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
