"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { RevenueRiskFlag } from "@/lib/sales/vnext/revenue-intelligence";

function severityVariant(severity: string) {
  if (severity === "high") return "blocked" as const;
  if (severity === "medium") return "under_review" as const;
  return "draft" as const;
}

export function RevenueRiskFlagsCard({ flags }: { flags: RevenueRiskFlag[] }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>علامات المخاطر</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا علامات مخاطر بارزة</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {flags.map((flag) => (
              <li
                key={flag.id}
                className="flex items-start justify-between gap-2 rounded border px-2 py-1"
              >
                <div>
                  <p>{flag.labelAr}</p>
                  {flag.opportunityName ? (
                    <Link
                      href={`/sales/opportunities/${flag.opportunityId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {flag.opportunityName}
                    </Link>
                  ) : null}
                </div>
                <StatusBadge status={severityVariant(flag.severity)} />
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
