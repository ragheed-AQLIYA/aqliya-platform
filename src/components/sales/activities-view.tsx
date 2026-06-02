import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type {
  SalesAccount,
  SalesOpportunity,
  SalesInteractionLog,
} from "@/lib/sales/types";

interface ActivityRow {
  interaction: SalesInteractionLog;
  account?: SalesAccount;
  opportunity?: SalesOpportunity;
}

interface ActivitiesViewProps {
  activities: ActivityRow[];
}

const TYPE_LABELS: Record<string, string> = {
  call: "مكالمة",
  meeting: "اجتماع",
  email: "بريد",
  note: "ملاحظة",
};

export function ActivitiesView({ activities }: ActivitiesViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الأنشطة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سجل التفاعلات التجارية — ذاكرة تشغيلية
        </p>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>
            {activities.length} نشاط
          </EnterpriseCardTitle>
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
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{interaction.loggedAt.slice(0, 16)}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5">
                      {TYPE_LABELS[interaction.type] ?? interaction.type}
                    </span>
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
                  <p className="mt-1">{interaction.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
