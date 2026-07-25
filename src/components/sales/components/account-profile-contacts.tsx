"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesContact } from "@/lib/sales/types";

export function AccountProfileContacts({
  contacts,
}: {
  contacts: SalesContact[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>جهات الاتصال</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا جهات اتصال</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {contacts.map((c) => (
              <li key={c.id}>
                {c.name} — {c.title}
                {c.email && (
                  <span className="text-muted-foreground"> · {c.email}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
