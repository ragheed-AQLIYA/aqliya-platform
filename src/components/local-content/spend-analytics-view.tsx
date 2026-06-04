import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { OrganizationSpendAnalytics } from "@/lib/local-content/spend-analytics";
import { LocalContentStatusBadge } from "./local-content-shell";

const CATEGORY_LABELS: Record<string, string> = {
  technology: "تقنية",
  goods: "سلع",
  services: "خدمات",
  construction: "إنشاءات",
  logistics: "لوجستي",
  other: "أخرى",
};

export function SpendAnalyticsView({ data }: { data: OrganizationSpendAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="إجمالي الإنفاق" value={data.totalSpend} />
        <Metric label="محلي" value={data.localSpend} />
        <Metric label="غير محلي" value={data.nonLocalSpend} />
        <Metric
          label="نسبة المحتوى المحلي"
          value={data.localContentPercentage}
          suffix="%"
        />
      </div>

      <EnterpriseCard module="local-content">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>حسب الفئة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-1 text-sm">
            {Object.entries(data.byCategory).map(([cat, amount]) => (
              <li key={cat} className="flex justify-between gap-2">
                <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                <span>{amount.toLocaleString("ar-SA")} ر.س</span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="local-content">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>المشاريع ({data.projectCount})</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا سجلات إنفاق</p>
          ) : (
            <ul className="space-y-2">
              {data.projects.map((p) => (
                <li
                  key={p.projectId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
                >
                  <Link
                    href={`/local-content/projects/${p.projectId}/spend`}
                    className="font-medium hover:underline"
                  >
                    {p.projectName}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <LocalContentStatusBadge status={p.status} />
                    <span className="text-muted-foreground">
                      {p.totalSpend.toLocaleString("ar-SA")} ر.س ·{" "}
                      {p.localContentPercentage.toFixed(0)}% محلي
                    </span>
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

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <EnterpriseCard module="local-content">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">
          {suffix
            ? `${value.toFixed(1)}${suffix}`
            : `${value.toLocaleString("ar-SA")} ر.س`}
        </p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
