import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenderMatchReport } from "@/lib/local-content/tender-matching";

const FIT_LABELS: Record<TenderMatchReport["fitLevel"], string> = {
  pass: "مطابقة",
  partial: "مطابقة جزئية",
  fail: "غير مطابق",
};

const FIT_VARIANT: Record<
  TenderMatchReport["fitLevel"],
  "default" | "secondary" | "destructive"
> = {
  pass: "default",
  partial: "secondary",
  fail: "destructive",
};

export function TenderMatchView({ report }: { report: TenderMatchReport }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">مطابقة المناقصة</h1>
        <Badge variant={FIT_VARIANT[report.fitLevel]}>
          {FIT_LABELS[report.fitLevel]}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        LC-02 — مطابقة حتمية بين متطلبات المناقصة (metadata.tender) وبيانات
        المشروع. لا قرار آلي نهائي.
      </p>
      {report.tender.titleAr ? (
        <p className="text-sm">{report.tender.titleAr}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="نسبة محلي" value={`${report.localContentPct}%`} />
        <Stat
          label="إجمالي الإنفاق"
          value={`${report.totalSpend.toLocaleString("ar-SA")} ر.س`}
        />
        <Stat
          label="موردون محليون"
          value={String(report.supplierCounts.local)}
        />
      </div>

      {report.gaps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>فجوات</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
              {report.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {report.categoryMatches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>فئات الإنفاق</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {report.categoryMatches.map((c) => (
                <li
                  key={c.category}
                  className="flex justify-between gap-2 rounded border px-2 py-1"
                >
                  <span>{c.category}</span>
                  <span className="text-muted-foreground">
                    {c.met ? "✓" : "✗"} · {c.spendAmount.toLocaleString("ar-SA")}{" "}
                    ر.س
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {report.recommendationsAr.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>توصيات (مساعدة)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
              {report.recommendationsAr.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
