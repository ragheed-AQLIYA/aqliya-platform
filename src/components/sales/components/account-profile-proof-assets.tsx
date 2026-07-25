"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesEvidenceRef } from "@/lib/sales/store";

export function AccountProfileProofAssets({
  assets,
}: {
  assets: SalesEvidenceRef[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>أصول الإثبات</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا أدلة مرتبطة</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {assets.map((p) => (
              <li key={p.id}>
                {p.label} ({p.typeId})
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
