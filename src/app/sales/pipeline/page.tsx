import Link from "next/link";
import {
  listSalesDealsAction,
  listSalesPipelineStagesAction,
} from "@/actions/sales-actions";
import {
  SalesPageHeader,
  SalesPhaseBadge,
  SalesNavLinks,
  SalesDealStatusBadge,
  SalesInlineNotice,
  type SalesDealListItem,
} from "@/components/sales/sales-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sumDealAmounts(deals: SalesDealListItem[]): number {
  return deals.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}

function PipelineDealCard({ deal }: { deal: SalesDealListItem }) {
  return (
    <Link
      href={`/sales/deals/${deal.id}`}
      className="block rounded border p-2 text-xs hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{deal.title}</span>
        <SalesDealStatusBadge status={deal.status} />
      </div>
      <div className="text-muted-foreground mt-0.5">{deal.account.name}</div>
      <div className="text-muted-foreground mt-0.5">
        {formatAmount(deal.amount, deal.currency)}
      </div>
    </Link>
  );
}

export default async function SalesPipelinePage() {
  const [dealsRes, stagesRes] = await Promise.all([
    listSalesDealsAction(),
    listSalesPipelineStagesAction(),
  ]);

  const deals = dealsRes.ok ? dealsRes.data : [];
  const stages = stagesRes.ok ? stagesRes.data.stages : [];
  const openDeals = deals.filter((d) => d.status === "open");
  const closedDeals = deals.filter((d) => d.status === "won" || d.status === "lost");
  const activeStages = stages.filter((s) => !s.isClosed);

  const openPipelineValue = sumDealAmounts(openDeals);

  const dealsByStage = new Map<string | null, typeof openDeals>();
  for (const deal of openDeals) {
    const key = deal.stageId ?? null;
    const bucket = dealsByStage.get(key) ?? [];
    bucket.push(deal);
    dealsByStage.set(key, bucket);
  }

  const unassigned = dealsByStage.get(null) ?? [];

  return (
    <div dir="rtl">
      <SalesNavLinks active="pipeline" />
      <SalesPageHeader
        title="مسار الصفقات"
        subtitle="لوحة قراءة فقط — صفقات مفتوحة حسب المرحلة (بدون سحب وإفلات)"
      />
      <SalesPhaseBadge phase="pr4" />

      {!dealsRes.ok || !stagesRes.ok ? (
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل المسار"
          description={
            dealsRes.ok ? stagesRes.error : dealsRes.error || "تحقق من migration و seed"
          }
        />
      ) : null}

      {dealsRes.ok && stagesRes.ok ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">صفقات مفتوحة</p>
              <p className="text-2xl font-bold">{openDeals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">قيمة المسار المفتوح</p>
              <p className="text-2xl font-bold">
                {formatAmount(openPipelineValue, "SAR")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">فوز / خسارة (قراءة)</p>
              <p className="text-2xl font-bold">{closedDeals.length}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {unassigned.length > 0 ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">بدون مرحلة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unassigned.map((deal) => (
              <PipelineDealCard key={deal.id} deal={deal} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {activeStages.map((stage) => {
          const columnDeals = dealsByStage.get(stage.id) ?? [];
          const columnValue = sumDealAmounts(columnDeals);
          return (
            <Card key={stage.id} className="min-w-[240px] shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{stage.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {columnDeals.length} صفقة · {formatAmount(columnValue, "SAR")}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {columnDeals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : (
                  columnDeals.map((deal) => (
                    <PipelineDealCard key={deal.id} deal={deal} />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeStages.length === 0 && dealsRes.ok ? (
        <p className="text-sm text-muted-foreground">
          لا مراحل مسار نشطة — طبّق migration و seed.
        </p>
      ) : null}

      {closedDeals.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">صفقات مغلقة (فوز / خسارة)</CardTitle>
            <p className="text-xs text-muted-foreground">
              قراءة فقط — لا تظهر في أعمدة المسار المفتوح
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {closedDeals.map((deal) => (
              <PipelineDealCard key={deal.id} deal={deal} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
