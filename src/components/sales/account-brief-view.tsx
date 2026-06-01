import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountBriefPack } from "@/lib/sales/account-brief-pack";
import { icpBandLabelAr } from "@/lib/sales/icp-types";
import {
  signalSeverityLabelAr,
  signalTypeLabelAr,
} from "@/lib/sales/signals";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  Target,
} from "lucide-react";
import { AccountBriefExportButton } from "./account-brief-export-button";

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
};

const DEAL_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  won: "مكسوبة",
  lost: "مخسورة",
};

const RESEARCH_STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار المراجعة",
  reviewed: "تمت المراجعة",
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

function formatArDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AccountBriefView({ pack }: { pack: AccountBriefPack }) {
  const icp = pack.icpAssessment.score;
  const research = pack.research;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            href={`/sales/accounts/${pack.accountId}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الحساب
          </Link>
          <h1 className="text-xl font-bold">موجز الحساب</h1>
          <p className="text-sm text-muted-foreground">
            قراءة فقط — تجميع الحقول وICP والإشارات وبحث الحساب والصفقات والأدلة
          </p>
        </div>
        <AccountBriefExportButton accountId={pack.accountId} />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {pack.accountName}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">القطاع: </span>
            <span className="font-medium">{pack.industry ?? "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">الحالة: </span>
            <span className="font-medium">
              {ACCOUNT_STATUS_LABELS[pack.status] ?? pack.status}
            </span>
            {pack.isDemo ? (
              <span className="mr-2 text-xs text-muted-foreground">(demo)</span>
            ) : null}
          </div>
          <div>
            <span className="text-muted-foreground">تاريخ الإنشاء: </span>
            <span>{formatArDate(pack.createdAt)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">آخر تحديث: </span>
            <span>{formatArDate(pack.updatedAt)}</span>
          </div>
          <div className="sm:col-span-2 text-xs text-muted-foreground">
            توليد الموجز: {formatArDate(pack.generatedAt)}
          </div>
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            ملاءمة ICP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!pack.icpAssessment.configured || !icp ? (
            <p className="text-muted-foreground">لا يوجد تقييم ICP.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {icp.fitScore}%
                  </p>
                  <p className="text-muted-foreground">
                    {icpBandLabelAr(icp.band)}
                  </p>
                </div>
                {icp.segment ? (
                  <span className="rounded-md border px-2 py-1 text-xs font-medium">
                    {icp.segment}
                  </span>
                ) : null}
              </div>
              {icp.confidence != null ? (
                <p>
                  الثقة:{" "}
                  <span className="font-medium">{icp.confidence}%</span>
                </p>
              ) : null}
              {icp.reasoning && icp.reasoning.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {icp.reasoning.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : icp.notes ? (
                <p className="text-muted-foreground">{icp.notes}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            الإشارات ({pack.signals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pack.signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا إشارات مسجّلة.</p>
          ) : (
            <ul className="space-y-3">
              {pack.signals.map((signal) => (
                <li
                  key={signal.id}
                  className="rounded-md border p-3 text-sm print:break-inside-avoid"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{signal.title}</span>
                    <Badge variant="outline">
                      {signalTypeLabelAr(signal.type)}
                    </Badge>
                    {signal.severity ? (
                      <Badge
                        className={SEVERITY_COLORS[signal.severity] ?? ""}
                        variant="secondary"
                      >
                        {signalSeverityLabelAr(signal.severity)}
                      </Badge>
                    ) : null}
                  </div>
                  {signal.summary ? (
                    <p className="text-muted-foreground">{signal.summary}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatArDate(signal.detectedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            موجز البحث
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!research ? (
            <p className="text-muted-foreground">لا موجز بحث بعد.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {RESEARCH_STATUS_LABELS[research.status] ?? research.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  الثقة: {research.confidence}% · {research.sources.length}{" "}
                  مصدر
                </span>
              </div>
              <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                {research.brief}
              </pre>
              {research.sources.length > 0 ? (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {research.sources.map((source, index) => (
                    <li key={`${source.type}-${index}`}>
                      {source.label}
                      {source.value != null ? ` — ${source.value}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-muted-foreground">
                توليد: {research.generatedByName ?? research.generatedById} ·{" "}
                {formatArDate(research.generatedAt)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            الصفقات المرتبطة ({pack.deals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pack.deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا صفقات مرتبطة.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-muted-foreground">
                    <th className="py-2 pe-3 font-medium">العنوان</th>
                    <th className="py-2 pe-3 font-medium">الحالة</th>
                    <th className="py-2 pe-3 font-medium">المرحلة</th>
                    <th className="py-2 pe-3 font-medium">القيمة</th>
                    <th className="py-2 font-medium">آخر تحديث</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.deals.map((deal) => (
                    <tr key={deal.id} className="border-b last:border-0">
                      <td className="py-2 pe-3">
                        <Link
                          href={`/sales/deals/${deal.id}`}
                          className="font-medium text-primary hover:underline print:text-foreground print:no-underline"
                        >
                          {deal.title}
                        </Link>
                      </td>
                      <td className="py-2 pe-3">
                        {DEAL_STATUS_LABELS[deal.status] ?? deal.status}
                      </td>
                      <td className="py-2 pe-3">{deal.stageName ?? "—"}</td>
                      <td className="py-2 pe-3 tabular-nums">
                        {formatAmount(deal.amount, deal.currency)}
                      </td>
                      <td className="py-2">{formatArDate(deal.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            الأدلة ({pack.evidenceCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y- 2 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{pack.evidenceCount}</span>{" "}
            دليل مرتبط بهذا الحساب.
          </p>
          {pack.evidenceLinks.length > 0 ? (
            <ul className="space-y-1 text-muted-foreground">
              {pack.evidenceLinks.map((link) => (
                <li key={link.id}>
                  {link.title}
                  <span className="text-xs"> ({link.evidenceId})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">لا روابط أدلة.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
