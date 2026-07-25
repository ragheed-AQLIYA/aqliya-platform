"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module } from "./sidebar-data";

interface SidebarModuleSwitcherProps {
  collapsed: boolean;
  moduleOpen: boolean;
  currentModule: Module;
  modules: Module[];
  activeModule: string;
  onToggle: () => void;
}

export function SidebarModuleSwitcher({
  collapsed,
  moduleOpen,
  currentModule,
  modules,
  activeModule,
  onToggle,
}: SidebarModuleSwitcherProps) {
  if (collapsed) return null;

  return (
    <div className="px-3 pt-3 pb-2">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          currentModule.bgActive,
          currentModule.color,
        )}
        aria-label={`تبديل النظام — ${currentModule.nameAr}`}
      >
        <currentModule.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{currentModule.nameAr}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 mr-auto transition-transform",
            moduleOpen && "rotate-180",
          )}
        />
      </button>

      {moduleOpen && (
        <div className="mt-1 space-y-0.5 rounded-md border bg-background p-1">
          {modules.map((module) => {
            const isActive = module.id === activeModule;
            return (
              <Link
                key={module.id}
                href={module.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? cn(module.bgActive, module.color, "font-medium")
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <module.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{module.nameAr}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
