"use client";

import { Button } from "@/components/ui/button";
import { Clock, Database, Shield } from "lucide-react";

type Tab = "policies" | "holds" | "history";

type TabDef = {
  id: Tab;
  label: string;
  icon: typeof Database;
  count?: number;
};

type Props = {
  activeTab: Tab;
  holdsCount: number;
  onTabChange: (tab: Tab) => void;
};

export function TabNavigation({ activeTab, holdsCount, onTabChange }: Props) {
  const tabs: TabDef[] = [
    { id: "policies", label: "السياسات", icon: Database },
    { id: "holds", label: "التعليقات", icon: Shield, count: holdsCount },
    { id: "history", label: "سجل التشغيل", icon: Clock },
  ];

  return (
    <div className="flex gap-2 mb-6" role="tablist">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <Button
          key={id}
          variant={activeTab === id ? "default" : "outline"}
          size="sm"
          onClick={() => onTabChange(id)}
          role="tab"
          aria-selected={activeTab === id}
        >
          <Icon className="h-4 w-4 ml-1" />
          {label}
          {count !== undefined && ` (${count})`}
        </Button>
      ))}
    </div>
  );
}
