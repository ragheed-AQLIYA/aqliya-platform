"use client";

import { Users, ShieldCheck } from "lucide-react";

interface EmployeesSummaryProps {
  admin: number;
  operator: number;
  viewer: number;
  sunbulMembershipCount: number;
  sunbulClientCount: number;
}

export function EmployeesSummary({
  admin,
  operator,
  viewer,
  sunbulMembershipCount,
  sunbulClientCount,
}: EmployeesSummaryProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">الموظفون والصلاحيات</h2>
      <div className="rounded-lg border bg-card divide-y">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-module-audit" />
            <span>مشرف المنصة (Platform Admin)</span>
          </div>
          <span className="text-sm font-semibold" dir="ltr">
            {admin}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-module-decision" />
            <span>مشغل (Operator)</span>
          </div>
          <span className="text-sm font-semibold" dir="ltr">
            {operator}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>مراجع (Reviewer)</span>
          </div>
          <span className="text-sm font-semibold" dir="ltr">
            {viewer}
          </span>
        </div>
      </div>
      {sunbulMembershipCount > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {sunbulMembershipCount} عضوية في سنبل عبر {sunbulClientCount} عميل
        </p>
      )}
    </section>
  );
}
