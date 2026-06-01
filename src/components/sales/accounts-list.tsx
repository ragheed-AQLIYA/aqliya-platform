import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesAccount } from "@/lib/sales/types";

export function AccountsList({ accounts }: { accounts: SalesAccount[] }) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الحسابات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {accounts.length} حساب — ذكاء مساعد من بيانات التشغيل
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Link key={account.id} href={`/sales/accounts/${account.id}`}>
            <EnterpriseCard module="sales" className="h-full hover:border-primary/50">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>
                  {account.nameAr ?? account.name}
                </EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <StatusBadge status={account.status} size="sm" />
                {account.industry && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {account.industry}
                  </p>
                )}
                {account.icpFitScore != null && (
                  <p className="mt-1 text-xs">ICP: {account.icpFitScore}%</p>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
