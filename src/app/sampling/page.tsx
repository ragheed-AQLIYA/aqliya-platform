"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SamplingMethod } from "@/lib/platform/sampling";
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
import { Plus, FileText, Layers, Beaker } from "lucide-react";

interface SamplingPlan {
  id: string;
  title: string;
  method: string;
  populationSize: number;
  sampleSize: number | null;
  confidenceLevel: number;
  materialityPct: number;
  status: string;
  createdAt: Date;
}

const METHOD_LABELS: Record<string, string> = {
  RANDOM: "عشوائي بسيط",
  STRATIFIED: "طبقي",
  SYSTEMATIC: "منتظم",
  JUDGMENTAL: "حكمي",
};

const METHOD_LABELS_EN: Record<string, string> = {
  RANDOM: "Random",
  STRATIFIED: "Stratified",
  SYSTEMATIC: "Systematic",
  JUDGMENTAL: "Judgmental",
};

const METHOD_VALUES = ["RANDOM", "STRATIFIED", "SYSTEMATIC", "JUDGMENTAL"];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

export default function SamplingPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SamplingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formMethod, setFormMethod] = useState("RANDOM");
  const [formPopulation, setFormPopulation] = useState("1000");
  const [formConfidence, setFormConfidence] = useState("0.95");
  const [formMateriality, setFormMateriality] = useState("5");
  const [saving, setSaving] = useState(false);

  async function loadPlans() {
    setLoading(true);
    try {
      const { getSamplingPlans } = await import("./actions");
      const result = await getSamplingPlans();
      if (result.success) {
        setPlans(result.data);
      } else {
        setError(result.error ?? "فشل تحميل خطط العينات");
      }
    } catch {
      setError("فشل تحميل خطط العينات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleCreate() {
    setSaving(true);
    try {
      const { createPlanAction } = await import("./actions");
      const result = await createPlanAction({
        title: formTitle,
        method: formMethod as SamplingMethod,
        populationSize: parseInt(formPopulation, 10),
        confidenceLevel: parseFloat(formConfidence),
        materialityPct: parseFloat(formMateriality),
      });

      if (!result.success) {
        setError(result.error ?? "فشل إنشاء خطة العينة");
        return;
      }

      setDialogOpen(false);
      setFormTitle("");
      await loadPlans();
    } catch {
      setError("فشل إنشاء خطة العينة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">عينات التدقيق</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إنشاء وتنفيذ خطط أخذ العينات الإحصائية
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-1" />
              خطة عينة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>خطة عينة جديدة</DialogTitle>
              <DialogDescription>
                أدخل معلمات خطة أخذ العينات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الخطة</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: عينة الحسابات المدينة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">طريقة أخذ العينات</Label>
                <Select value={formMethod} onValueChange={setFormMethod}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_VALUES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {METHOD_LABELS[m]} ({METHOD_LABELS_EN[m]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="population">حجم المجتمع</Label>
                <Input
                  id="population"
                  type="number"
                  min={1}
                  value={formPopulation}
                  onChange={(e) => setFormPopulation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidence">مستوى الثقة</Label>
                <Select value={formConfidence} onValueChange={setFormConfidence}>
                  <SelectTrigger id="confidence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.90">90%</SelectItem>
                    <SelectItem value="0.95">95%</SelectItem>
                    <SelectItem value="0.99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="materiality">نسبة الأهمية النسبية (%)</Label>
                <Input
                  id="materiality"
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={formMateriality}
                  onChange={(e) => setFormMateriality(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={saving || !formTitle}>
                {saving ? "جاري الإنشاء..." : "إنشاء الخطة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              إجمالي الخطط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Beaker className="h-4 w-4 text-primary" />
              المنفذة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {plans.filter((p) => p.status === "EXECUTED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              المسودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {plans.filter((p) => p.status === "DRAFT").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          جاري التحميل...
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-base font-semibold">لا توجد خطط عينات</h3>
              <p className="text-sm text-muted-foreground mt-1">
                أنشئ خطة العينة الأولى للبدء
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/sampling/${plan.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <Badge variant={getStatusBadge(plan.status)}>
                    {getStatusLabel(plan.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {METHOD_LABELS[plan.method] ?? plan.method}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">المجتمع:</span>
                    <span className="mr-1 font-medium">{plan.populationSize}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">حجم العينة:</span>
                    <span className="mr-1 font-medium">
                      {plan.sampleSize ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الثقة:</span>
                    <span className="mr-1 font-medium">
                      {Math.round(plan.confidenceLevel * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الأهمية:</span>
                    <span className="mr-1 font-medium">{plan.materialityPct}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {formatDate(plan.createdAt)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
