import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { ArrowRight, BarChart3, Calculator } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listForecastsAction } from "../actions";
import { ForecastCreateDialog } from "./forecast-create-dialog";
import { ForecastCalculateButton } from "./forecast-calculate-button";

export const dynamic = "force-dynamic";

const FORECAST_STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  FINALIZED: "نهائي",
  ARCHIVED: "مؤرشف",
};

const FORECAST_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"> = {
  DRAFT: "outline",
  FINALIZED: "default",
  ARCHIVED: "ghost",
};

export default async function ForecastsPage() {
  noStore();
  const res = await listForecastsAction();
  const forecasts = res.ok ? res.data : [];

  return (
    <div dir="rtl" className="space-y-6">
      <Link
        href="/sales/intelligence"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى لوحة التحكم
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">التنبؤات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة التنبؤات الشهرية والربعية والسنوية
          </p>
        </div>
        <ForecastCreateDialog />
      </div>

      {!res.ok ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          تعذر تحميل التنبؤات: {res.error}
        </div>
      ) : null}

      {res.ok && forecasts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium mb-1">لا توجد تنبؤات</h3>
          <p className="text-sm text-muted-foreground mb-4">
            أنشئ توقعًا جديدًا لبدء التنبؤ بالمبيعات
          </p>
          <ForecastCreateDialog />
        </div>
      ) : null}

      {res.ok && forecasts.length > 0 ? (
        <div className="space-y-4">
          {forecasts.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{f.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          FORECAST_STATUS_VARIANTS[f.status] ?? "outline"
                        }
                      >
                        {FORECAST_STATUS_LABELS[f.status] ?? f.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {f.period === "MONTHLY"
                          ? "شهري"
                          : f.period === "QUARTERLY"
                            ? "ربعي"
                            : "سنوي"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ForecastCalculateButton forecastId={f.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      الإيرادات المتوقعة
                    </p>
                    <p className="text-lg font-bold">
                      {(f.expectedRevenue / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      الإيرادات المرجحة
                    </p>
                    <p className="text-lg font-bold">
                      {f.weightedRevenue !== null
                        ? `${(f.weightedRevenue / 1000).toFixed(1)}K`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      نسبة الثقة
                    </p>
                    <p className="text-lg font-bold">
                      {f.confidencePct !== null ? `${f.confidencePct}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الفترة</p>
                    <p className="text-sm font-medium">
                      {new Date(f.periodStart).toLocaleDateString("ar-SA")} —{" "}
                      {new Date(f.periodEnd).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
                {f.notes ? (
                  <p className="text-xs text-muted-foreground mt-3">
                    {f.notes}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
