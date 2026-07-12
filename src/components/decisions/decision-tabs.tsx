"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllModules } from "@/lib/decision/decision-type-config";

export type TabInfo = { name: string; moduleId: string; href: string };

export function DecisionTabs({
  decisionId,
  decisionType,
  activeTab: controlledActiveTab,
  onTabChange,
}: {
  decisionId: string;
  decisionType?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const pathname = usePathname();

  const modules = decisionType
    ? getAllModules(decisionType as Parameters<typeof getAllModules>[0])
    : [];

  const tabs: TabInfo[] =
    modules.length > 0
      ? [
          { name: "نظرة عامة", moduleId: "overview", href: "" },
          ...modules.map((m) => ({ name: m.label, moduleId: m.id, href: m.href })),
        ]
      : [];

  const pathBasedTab =
    tabs.find((tab) => {
      if (tab.href === "") {
        return pathname === `/decisions/${decisionId}`;
      }
      return pathname === `/decisions/${decisionId}${tab.href}`;
    })?.moduleId || "overview";

  const isControlled = controlledActiveTab !== undefined && onTabChange;
  const activeTabValue = isControlled ? controlledActiveTab : pathBasedTab;

  const handleTabClick = (tab: TabInfo) => {
    if (isControlled) {
      onTabChange!(tab.moduleId);
    }
  };

  const gridCols =
    tabs.length <= 8
      ? "md:grid-cols-8"
      : tabs.length <= 12
        ? "md:grid-cols-6 lg:grid-cols-12"
        : "md:grid-cols-5 lg:grid-cols-16";

  return (
    <Tabs value={activeTabValue} className="mb-6">
      <TabsList
        className={`grid h-auto w-full grid-cols-2 gap-1 p-1 ${gridCols}`}
      >
        {tabs.map((tab) =>
          isControlled ? (
            <TabsTrigger
              key={tab.name}
              value={tab.moduleId}
              onClick={() => onTabChange!(tab.moduleId)}
              className="h-auto w-full px-3 py-2 text-xs sm:text-sm"
            >
              {tab.name}
            </TabsTrigger>
          ) : (
            <Link key={tab.name} href={`/decisions/${decisionId}${tab.href}`}>
              <TabsTrigger
                value={tab.moduleId}
                className="h-auto w-full px-3 py-2 text-xs sm:text-sm"
              >
                {tab.name}
              </TabsTrigger>
            </Link>
          ),
        )}
      </TabsList>
    </Tabs>
  );
}
