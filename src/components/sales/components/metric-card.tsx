"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";

export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
