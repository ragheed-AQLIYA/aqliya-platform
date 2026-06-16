"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowRight, Beaker, Download, AlertTriangle } from "lucide-react";

interface SamplingPlan {
  id: string;
  title: string;
  method: string;
  populationSize: number;
  sampleSize: number | null;
  confidenceLevel: number;
  materialityPct: number;
  status: string;
  strataField: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SamplingResult {
  id: string;
  sampleSize: number;
  sampleErrors: number;
  totalErrorAmount: number | null;
  projectedError: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  confidenceLevel: number;
  methodology: string;
  executedAt: Date;
}

const METHOD_LABELS: Record<string, string> = {
  RANDOM: "عشوائي بسيط",
  STRATIFIED: "طبقي",
  SYSTEMATIC: "منتظم",
  JUDGMENTAL: "حكمي",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusBadge(status: string) {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    DRAFT: "secondary",
    EXECUTED: "default",
    REVIEWED: "outline",
  };
  return map[status] ?? "secondary";
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "مسودة",
    EXECUTED: "منفذ",
    REVIEWED: "مراجع",
  };
  return map[status] ?? status;
}

export default function SamplingPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<SamplingPlan | null>(null);
  const [results, setResults] = useState<SamplingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [populationInput, setPopulationInput] = useState("");
  const [execDialogOpen, setExecDialogOpen] = useState(false);

  async function loadPlan() {
    setLoading(true);
    try {
      const { getSamplingPlan } = await import("../actions");
      const result = await getSamplingPlan(id);
      if (result.success) {
        setPlan(result.data.plan);
        setResults(result.data.results);
      } else {
        setError(result.error ?? "فشل تحميل خطة العينة");
      }
    } catch {
      setError("فشل تحميل خطة العينة");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, [id]);

  async function handleExecute() {
    setExecuting(true);
    try {
      let population: unknown[];
      try {
        population = JSON.parse(populationInput);
        if (!Array.isArray(population)) throw new Error();
      } catch {
        setError("يجب إدخال مصفوفة JSON صالحة");
        setExecuting(false);
        return;
      }

      const { executeSampleAction } = await import("../actions");
      const result = await executeSampleAction(id, population);
      if (result.success) {
        setExecDialogOpen(false);
        setPopulationInput("");
        await loadPlan();
      } else {
        setError(result.error ?? "فشل تنفيذ العينة");
      }
    } catch {
      setError("فشل تنفيذ العينة");
    } finally {
      setExecuting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push("/sampling")}>
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة إلى خطط العينات
        </Button>
      </div>
    );
  }

  if (!plan) return null;

  const latestResult = results[0] ?? null;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button
              onClick={() => router.push("/sampling")}
              className="hover:text-foreground transition-colors"
            >
              خطط العينات
            </button>
            <ArrowRight className="h-3 w-3" />
            <span>{plan.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {METHOD_LABELS[plan.method] ?? plan.method}
          </p>
        </div>
        <Badge variant={getStatusBadge(plan.status)} className="text-sm px-3 py-1">
          {getStatusLabel(plan.status)}
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">حجم المجتمع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.populationSize}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">حجم العينة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.sampleSize ?? "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">مستوى الثقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(plan.confidenceLevel * 100)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">الأهمية النسبية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.materialityPct}%</div>
          </CardContent>
        </Card>
      </div>

      {plan.status === "DRAFT" && (
        <Dialog open={execDialogOpen} onOpenChange={setExecDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Beaker className="h-4 w-4 ml-1" />
              تنفيذ العينة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تنفيذ العينة</DialogTitle>
              <DialogDescription>
                أدخل بيانات المجتمع بصيغة JSON للمصفوفة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="population">بيانات المجتمع (JSON)</Label>
                <textarea
                  id="population"
                  className="w-full min-h-[200px] rounded-lg border border-input bg-transparent p-3 text-sm font-mono"
                  value={populationInput}
                  onChange={(e) => setPopulationInput(e.target.value)}
                  placeholder={JSON.stringify(
                    [
                      { id: "1", value: 100, isError: false },
                      { id: "2", value: 200, isError: true },
                    ],
                    null,
                    2,
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                يجب أن تحتوي العناصر على حقل {`"isError"`} أو {`"hasError"`} للكشف عن الأخطاء،
                و {`"errorAmount"`} لحساب إجمالي الأخطاء.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleExecute} disabled={executing || !populationInput}>
                {executing ? "جاري التنفيذ..." : "تنفيذ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {latestResult && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Beaker className="h-4 w-4 text-primary" />
              نتيجة العينة
            </CardTitle>
            <CardDescription>آخر نتيجة تم تنفيذها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">الأخطاء المكتشفة</p>
                <p className="text-xl font-bold mt-1">{latestResult.sampleErrors}</p>
                <p className="text-xs text-muted-foreground">
                  من أصل {latestResult.sampleSize} عنصر
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">إسقاط الخطأ</p>
                <p className="text-xl font-bold mt-1">
                  {latestResult.projectedError?.toLocaleString() ?? "-"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">فترة الثقة</p>
                <p className="text-sm font-medium mt-1">
                  {latestResult.lowerBound?.toLocaleString() ?? "-"} –{" "}
                  {latestResult.upperBound?.toLocaleString() ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  بمستوى ثقة {Math.round(latestResult.confidenceLevel * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            نُفذت في {formatDate(latestResult.executedAt)}
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">نتائج التنفيذ</CardTitle>
          <CardDescription>
            {results.length === 0
              ? "لم يتم تنفيذ العينة بعد"
              : `تم تنفيذ العينة ${results.length} مرة`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>لم يتم تنفيذ العينة بعد</p>
              {plan.status === "DRAFT" && (
                <p className="text-xs mt-1">اضغط على "تنفيذ العينة" للبدء</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنهجية</TableHead>
                  <TableHead>حجم العينة</TableHead>
                  <TableHead>الأخطاء</TableHead>
                  <TableHead>إسقاط الخطأ</TableHead>
                  <TableHead>الحد الأدنى</TableHead>
                  <TableHead>الحد الأعلى</TableHead>
                  <TableHead>تاريخ التنفيذ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.methodology}</TableCell>
                    <TableCell>{r.sampleSize}</TableCell>
                    <TableCell>
                      <span className={r.sampleErrors > 0 ? "text-destructive font-medium" : ""}>
                        {r.sampleErrors}
                      </span>
                    </TableCell>
                    <TableCell>{r.projectedError?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>{r.lowerBound?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>{r.upperBound?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>{formatDate(r.executedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
