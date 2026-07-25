"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesCompetitorMentionView } from "@/lib/sales/types";

export function AccountProfileCompetitors({
  competitors,
}: {
  competitors: SalesCompetitorMentionView[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>المنافسون</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-2 text-sm">
          {competitors.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — {c.contextAr}
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
