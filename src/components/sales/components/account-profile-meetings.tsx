"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesInteractionLog } from "@/lib/sales/types";

export function AccountProfileMeetings({
  meetings,
}: {
  meetings: SalesInteractionLog[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الاجتماعات والمكالمات</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا اجتماعات مسجّلة</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {meetings.map((m) => (
              <li key={m.id} className="rounded border px-2 py-1">
                {m.loggedAt.slice(0, 10)} — {m.summary}
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
