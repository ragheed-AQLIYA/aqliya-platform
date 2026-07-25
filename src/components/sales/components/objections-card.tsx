"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { SalesObjectionSignal } from "@/lib/sales/types";

export interface ObjectionsCardProps {
  topObjections: SalesObjectionSignal[];
}

export function ObjectionsCard({ topObjections }: ObjectionsCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">أبرز الاعتراضات</p>
          <Link
            href="/sales/intelligence"
            className="text-xs text-primary hover:underline"
          >
            الذاكرة التجارية
          </Link>
        </div>
        {topObjections.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا اعتراضات مسجّلة</p>
        ) : (
          <ul className="space-y-2">
            {topObjections.map((o) => (
              <li
                key={o.id}
                className="flex justify-between text-sm rounded border px-2 py-1"
              >
                <span>{o.labelAr}</span>
                <span className="text-muted-foreground">{o.count}</span>
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
