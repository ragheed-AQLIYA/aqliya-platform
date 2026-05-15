"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllModules } from "@/lib/decision/decision-type-config";

export function DecisionTabs({
  decisionId,
  decisionType,
}: {
  decisionId: string;
  decisionType?: string;
}) {
  const pathname = usePathname();

  const modules = decisionType
    ? getAllModules(decisionType as Parameters<typeof getAllModules>[0])
    : [];

  const tabs =
    modules.length > 0
      ? [
          { name: "نظرة عامة", href: "" },
          ...modules.map((m) => ({ name: m.label, href: m.href })),
        ]
      : [];

  const currentTab =
    tabs.find((tab) => {
      if (tab.href === "") {
        return pathname === `/decisions/${decisionId}`;
      }
      return pathname === `/decisions/${decisionId}${tab.href}`;
    })?.name || "نظرة عامة";

  const gridCols =
    tabs.length <= 8
      ? "md:grid-cols-8"
      : tabs.length <= 12
        ? "md:grid-cols-6 lg:grid-cols-12"
        : "md:grid-cols-5 lg:grid-cols-16";

  return (
    <Tabs value={currentTab} className="mb-6">
      <TabsList
        className={`grid h-auto w-full grid-cols-2 gap-1 p-1 ${gridCols}`}
      >
        {tabs.map((tab) => (
          <Link key={tab.name} href={`/decisions/${decisionId}${tab.href}`}>
            <TabsTrigger
              value={tab.name}
              className="h-auto w-full px-3 py-2 text-xs sm:text-sm"
            >
              {tab.name}
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
