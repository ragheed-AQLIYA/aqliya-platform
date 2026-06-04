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
          <EnterpriseCardTitle>
            اتجاه نسبة المحتوى المحلي (LC-07)
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {data.localizationTrends.points.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا توجد فترات إنفاق كافية لعرض الاتجاه.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                الاتجاه:{" "}
                {data.localizationTrends.trendDirection === "up"
                  ? "صعود"
                  : data.localizationTrends.trendDirection === "down"
                    ? "هبوط"
                    : data.localizationTrends.trendDirection === "flat"
                      ? "ثابت"
                      : "بيانات غير كافية"}
              </p>
              <ul className="space-y-2 text-sm">
                {data.localizationTrends.points.map((pt) => (
                  <li
                    key={pt.periodKey}
                    className="flex flex-wrap justify-between gap-2 rounded border px-3 py-2"
                  >
                    <span className="font-medium">{pt.labelAr}</span>
                    <span className="text-muted-foreground">
                      {pt.localContentPercentage.toFixed(1)}% محلي
                      {pt.deltaVsPriorPct != null &&
                        ` (${pt.deltaVsPriorPct >= 0 ? "+" : ""}${pt.deltaVsPriorPct}%)`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-muted-foreground mt-3">
                {data.localizationTrends.disclaimerAr}
              </p>
            </>
          )}
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
