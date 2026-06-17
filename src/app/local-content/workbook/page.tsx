import { unstable_noStore as noStore } from "next/cache";
import { getWorkbookDashboardAction, listOrganizationWorkbooksAction } from "@/actions/localcontent-workbook-actions";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Percent,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  populated: "تم التعبئة",
  partial: "مكتمل جزئياً",
  complete: "مكتمل",
  exported: "تم التصدير",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  populated: "secondary",
  partial: "default",
  complete: "default",
  exported: "secondary",
};

export default async function WorkbookDashboardPage() {
  noStore();
  const [summaryRes, workbooksRes] = await Promise.all([
    getWorkbookDashboardAction(),
    listOrganizationWorkbooksAction(),
  ]);

  const summary = summaryRes.ok ? summaryRes.data : null;
  const workbooks = workbooksRes.ok ? workbooksRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workbook Engine</h1>
          <p className="text-sm text-muted-foreground">
            محرك تعبئة وجمع بيانات المحتوى المحلي
          </p>
        </div>
      </div>

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{summary?.totalWorkbooks ?? 0}</p>
            <p className="text-xs text-muted-foreground">إجمالي الدفاتر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {summary?.averageCompletion ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground">متوسط الإنجاز</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {workbooks.reduce((s, w) => s + w.autoFilledLines, 0)}
            </p>
            <p className="text-xs text-muted-foreground">حقول معبأة تلقائياً</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{summary?.totalMissing ?? 0}</p>
            <p className="text-xs text-muted-foreground">حقول ناقصة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {(() => {
                const scored = workbooks.filter((w) => w.lcScore !== null);
                return scored.length > 0
                  ? Math.round(scored.reduce((s, w) => s + w.lcScore!, 0) / scored.length)
                  : "—";
              })()}
            </p>
            <p className="text-xs text-muted-foreground">متوسط النقاط</p>
          </CardContent>
        </Card>
      </div>

      {/* Workbook list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الدفاتر / Workbooks</CardTitle>
        </CardHeader>
        <CardContent>
          {!workbooksRes.ok ? (
            <p className="text-sm text-destructive">
              خطأ: {workbooksRes.error}
            </p>
          ) : workbooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا توجد دفاتر بعد. ابدأ بإنشاء مشروع وتعبئة workbook.</p>
              <p className="text-xs mt-1">
                اذهب إلى مشاريع المحتوى المحلي وأنشئ workbook من المشروع.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workbooks.map((wb) => (
                <div
                  key={wb.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/local-content/workbook/${wb.id}`}
                        className="font-medium truncate hover:underline"
                      >
                        {wb.title}
                      </Link>
                      <Badge
                        variant={STATUS_VARIANTS[wb.status] || "outline"}
                        className="shrink-0"
                      >
                        {STATUS_LABELS[wb.status] || wb.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>الفترة: {wb.reportingPeriod}</span>
                      <span>تلقائي: {wb.autoFilledLines}</span>
                      <span>ناقص: {wb.missingLines}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={wb.completionPct} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">
                        {wb.completionPct}%
                      </span>
                    </div>
                    {wb.lcScore !== null ? (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs font-bold ${
                          wb.lcScore >= 60 ? "text-green-600"
                          : wb.lcScore >= 40 ? "text-amber-600"
                          : "text-red-600"
                        }`}>
                          {wb.lcScore}%
                        </span>
                        <span className="text-xs text-muted-foreground">نقاط</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mr-4">
                    <Link href={`/local-content/workbook/${wb.id}`}>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
