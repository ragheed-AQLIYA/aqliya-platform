import Link from "next/link";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase, Building2, Info, AlertTriangle } from "lucide-react";

export function SalesPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function SalesPhaseBadge(_props?: { phase?: string }) {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      SalesOS v0.3 PR-2 — واجهة الصفقات P0. لا إرسال تلقائي ولا مزامنة بريد/تقويم.
    </div>
  );
}

const NOTICE_STYLES = {
  info: {
    wrapper:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
    icon: Info,
  },
  warning: {
    wrapper:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    icon: AlertTriangle,
  },
  error: {
    wrapper:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
    icon: AlertTriangle,
  },
} as const;

export function SalesInlineNotice({
  title,
  description,
  variant = "info",
}: {
  title: string;
  description: string;
  variant?: keyof typeof NOTICE_STYLES;
}) {
  const Icon = NOTICE_STYLES[variant].icon;

  return (
    <div
      className={`mb-4 rounded-lg border p-3 text-sm ${NOTICE_STYLES[variant].wrapper}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-xs/6 opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function SalesViewerReadOnlyNotice({ action }: { action: string }) {
  return (
    <SalesInlineNotice
      variant="info"
      title="عرض فقط"
      description={`دور المشاهد لا يسمح بـ: ${action}.`}
    />
  );
}

export function SalesNavLinks({
  active,
  canCreate: _canCreate,
}: {
  active?: string;
  canCreate?: boolean;
}) {
  const linkClass = (key: string) =>
    key === active
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-foreground";

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-4 text-sm">
      <Link href="/sales" className={linkClass("dashboard")}>
        لوحة SalesOS
      </Link>
      <Link href="/sales/deals" className={linkClass("deals")}>
        الصفقات
      </Link>
    </nav>
  );
}

const DEAL_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  won: "فوز",
  lost: "خسارة",
  archived: "مؤرشفة",
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  won: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  archived: "bg-muted text-muted-foreground",
};

export function SalesDealStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={DEAL_STATUS_COLORS[status] ?? ""}>
      {DEAL_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export type SalesDealListItem = {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  updatedAt: Date;
  account: { id: string; name: string };
  stage: { id: string; name: string; slug: string; sortOrder: number } | null;
};

export function SalesDealCard({ deal }: { deal: SalesDealListItem }) {
  const amountLabel =
    deal.amount != null
      ? new Intl.NumberFormat("ar-SA", {
          style: "currency",
          currency: deal.currency || "SAR",
          maximumFractionDigits: 0,
        }).format(deal.amount)
      : "—";

  return (
    <Link href={`/sales/deals/${deal.id}`}>
      <Card className="p-4 hover:border-primary transition-colors">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-base font-semibold truncate">{deal.title}</h2>
          <SalesDealStatusBadge status={deal.status} />
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {deal.account.name}
          </div>
          {deal.stage ? (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {deal.stage.name}
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span>{amountLabel}</span>
            <span>{new Date(deal.updatedAt).toLocaleDateString("ar-SA")}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SalesDealList({ deals }: { deals: SalesDealListItem[] }) {
  if (deals.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <SalesDealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}

export function SalesEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-16 text-center">
      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
