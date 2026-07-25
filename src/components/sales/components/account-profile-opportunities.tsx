"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesOpportunity } from "@/lib/sales/types";

export function AccountProfileOpportunities({
  opportunities,
  accountId,
}: {
  opportunities: SalesOpportunity[];
  accountId: string;
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الفرص</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <form
          action={async (formData) => {
            "use server";
            const { createOpportunityFromAccountAction } = await import(
              "@/actions/sales-actions"
            );
            await createOpportunityFromAccountAction(accountId, formData);
          }}
          className="mb-4 flex flex-wrap gap-2"
        >
          <input
            name="name"
            placeholder="اسم الفرصة"
            className="rounded-md border px-2 py-1 text-sm"
            required
          />
          <input
            name="valueEstimate"
            placeholder="القيمة التقديرية"
            className="w-28 rounded-md border px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
          >
            إنشاء فرصة
          </button>
        </form>
        <ul className="space-y-2">
          {opportunities.map((o) => (
            <li key={o.id}>
              <Link
                href={`/sales/opportunities/${o.id}`}
                className="text-sm text-primary hover:underline"
              >
                {o.name} — {o.stage}
                {o.valueEstimate != null &&
                  ` · ${o.valueEstimate.toLocaleString("ar-SA")} ر.س`}
              </Link>
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
