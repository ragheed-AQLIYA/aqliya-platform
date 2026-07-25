"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesObjectionSignal } from "@/lib/sales/types";

export function AccountProfileObjections({
  objections,
}: {
  objections: SalesObjectionSignal[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الاعتراضات</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {objections.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا اعتراضات مستخرجة</p>
        ) : (
          <ul className="list-inside list-disc text-sm">
            {objections.map((o) => (
              <li key={o.id}>
                {o.labelAr} ({o.count}×)
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
