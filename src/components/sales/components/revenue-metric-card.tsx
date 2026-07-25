"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";

export function RevenueMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
