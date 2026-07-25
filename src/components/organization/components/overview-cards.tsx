"use client";

import { Users, ShieldCheck } from "lucide-react";

interface OverviewCardsProps {
  total: number;
  admin: number;
  operator: number;
  viewer: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export function OverviewCards({
  total,
  admin,
  operator,
  viewer,
}: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={Users} label="إجمالي المستخدمين" value={total} />
      <StatCard icon={ShieldCheck} label="مشرفين" value={admin} />
      <StatCard icon={Users} label="مشغلين" value={operator} />
      <StatCard icon={Users} label="مراجعين" value={viewer} />
    </div>
  );
}
