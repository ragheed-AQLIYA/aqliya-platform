import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesAccount } from "@/lib/sales/types";

interface AccountsListViewProps {
  accounts: SalesAccount[];
  opportunityCountByAccount?: Record<string, number>;
  pipelineValueByAccount?: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  prospect: "محتمل",
  qualified: "مؤهل",
  active: "نشط",
  dormant: "خامل",
  archived: "مؤرشف",
};

export function AccountsListView({
  accounts,
  opportunityCountByAccount = {},
  pipelineValueByAccount = {},
}: AccountsListViewProps) {
  const totalPipeline = Object.values(pipelineValueByAccount).reduce(
    (s, v) => s + v,
    0,
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الحسابات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {accounts.length} حساب · مسار نشط{" "}
          {totalPipeline.toLocaleString("ar-SA")} ر.س
        </p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const { createAccountAction } = await import("@/actions/sales-actions");
          await createAccountAction(formData);
        }}
        className="flex flex-wrap gap-2 rounded-xl border p-4"
      >
        <input
          name="name"
          placeholder="اسم الحساب (EN)"
          className="rounded-md border px-2 py-1 text-sm"
          required
        />
        <input
          name="nameAr"
          placeholder="الاسم (AR)"
          className="rounded-md border px-2 py-1 text-sm"
        />
        <input
          name="industry"
          placeholder="القطاع"
          className="rounded-md border px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
        >
          إنشاء حساب
        </button>
      </form>

      {accounts.length === 0 ? (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="py-8 text-center text-sm text-muted-foreground">
            لا حسابات بعد — أنشئ حساباً للبدء.
          </EnterpriseCardContent>
        </EnterpriseCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const oppCount = opportunityCountByAccount[account.id] ?? 0;
            const pipelineValue = pipelineValueByAccount[account.id] ?? 0;

            return (
              <Link key={account.id} href={`/sales/accounts/${account.id}`}>
                <EnterpriseCard module="sales" className="hover:border-primary/50 h-full">
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
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{STATUS_LABELS[account.status] ?? account.status}</span>
                      <span>·</span>
                      <span>{oppCount} فرصة</span>
                      {pipelineValue > 0 && (
                        <>
                          <span>·</span>
                          <span>
                            {pipelineValue.toLocaleString("ar-SA")} ر.س
                          </span>
                        </>
                      )}
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
