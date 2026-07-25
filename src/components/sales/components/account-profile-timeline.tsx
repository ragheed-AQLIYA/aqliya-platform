"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { InteractionTimelineEntry } from "@/lib/sales/intelligence/account-health";

export function AccountProfileTimeline({
  entries,
}: {
  entries: InteractionTimelineEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>خط زمني للنشاط</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-2 text-sm">
          {entries.map((t) => (
            <li key={t.id} className="rounded border px-2 py-1">
              <span className="text-xs text-muted-foreground">
                {t.loggedAt.slice(0, 10)} · {t.type}
              </span>
              <p>{t.labelAr}</p>
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
