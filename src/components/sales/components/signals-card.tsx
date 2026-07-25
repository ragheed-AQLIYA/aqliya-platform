"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

export interface SignalsCardProps {
  topSignals: IntelligenceSignal[];
}

export function SignalsCard({ topSignals }: SignalsCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">أبرز الإشارات</p>
          <Link
            href="/sales/intelligence"
            className="text-xs text-primary hover:underline"
          >
            الذاكرة التجارية
          </Link>
        </div>
        {topSignals.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا إشارات</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {topSignals.map((s) => (
              <li key={s.id} className="rounded border px-2 py-1">
                {s.label} — {s.value}% ({s.level})
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
