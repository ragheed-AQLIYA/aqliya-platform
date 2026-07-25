"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesAIBriefDraft } from "@/lib/sales/types";

export function AccountProfileAIBrief({
  brief,
}: {
  brief: SalesAIBriefDraft;
}) {
  return (
    <EnterpriseCard module="sales" className="border-amber-300 dark:border-amber-800">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle className="flex items-center gap-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            DRAFT
          </span>
          ملخص ذكاء اصطناعي
        </EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{brief.disclaimerAr}</p>
        {brief.sections.map((s) => (
          <div key={s.titleAr}>
            <p className="font-medium">{s.titleAr}</p>
            <p className="text-muted-foreground">{s.bodyAr}</p>
          </div>
        ))}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
