import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSalesAccountDetail } from "@/lib/sales/service";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";

export default async function SalesAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const detail = getSalesAccountDetail(user, id);
  if (!detail) notFound();

  const { account, contacts, opportunities } = detail;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link href="/sales" className="text-sm text-muted-foreground hover:underline">
          ← العودة إلى SalesOS
        </Link>
        <h1 className="mt-2 text-h2 font-black">
          {account.nameAr ?? account.name}
        </h1>
        <StatusBadge status={account.status} size="sm" />
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>جهات الاتصال</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا جهات اتصال</p>
          ) : (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.id} className="text-sm">
                  {c.name} — {c.title}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>الفرص</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2">
            {opportunities.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/sales/opportunities/${o.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {o.name} — {o.stage}
                </Link>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
