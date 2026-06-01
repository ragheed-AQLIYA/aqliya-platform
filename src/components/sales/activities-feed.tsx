import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesAccount, SalesInteractionLog, SalesOpportunity } from "@/lib/sales/types";

type ActivityRow = {
  interaction: SalesInteractionLog;
  account?: SalesAccount;
  opportunity?: SalesOpportunity;
};

export function ActivitiesFeed({ activities }: { activities: ActivityRow[] }) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الأنشطة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سجل التفاعلات والذاكرة التشغيلية — {activities.length} نشاط
        </p>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>خط زمني</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا أنشطة مسجّلة</p>
          ) : (
            <ul className="space-y-3">
              {activities.map(({ interaction, account, opportunity }) => (
                <li
                  key={interaction.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">
                      {interaction.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {interaction.loggedAt.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  <p className="mt-1">{interaction.summary}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {account && (
                      <Link
                        href={`/sales/accounts/${account.id}`}
                        className="text-primary hover:underline"
                      >
                        {account.nameAr ?? account.name}
                      </Link>
                    )}
                    {opportunity && (
                      <Link
                        href={`/sales/opportunities/${opportunity.id}`}
                        className="text-primary hover:underline"
                      >
                        {opportunity.name}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
