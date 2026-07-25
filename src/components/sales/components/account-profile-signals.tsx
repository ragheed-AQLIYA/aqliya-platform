"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

export function AccountProfileSignals({
  signals,
}: {
  signals: IntelligenceSignal[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>إشارات</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-1 text-sm">
          {signals.map((s) => (
            <li key={s.id}>
              {s.label}: {s.value}% (ثقة {Math.round(s.confidence * 100)}%)
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
