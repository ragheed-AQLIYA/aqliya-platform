"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";

export interface StageDistributionCardProps {
  byStage: Record<string, number>;
}

export function StageDistributionCard({ byStage }: StageDistributionCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="mb-3 text-sm font-semibold">توزيع المراحل</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byStage).map(([stage, count]) => (
            <span key={stage} className="rounded-full bg-muted px-3 py-1 text-xs">
              {stage}: {count}
            </span>
          ))}
        </div>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
