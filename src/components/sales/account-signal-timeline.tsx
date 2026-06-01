"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSalesSignalAction } from "@/actions/sales-actions";
import {
  signalSeverityLabelAr,
  signalTypeLabelAr,
  type SalesSignalView,
} from "@/lib/sales/signals";
import { Activity, RefreshCw } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "intent", label: "نية شراء" },
  { value: "engagement", label: "تفاعل" },
  { value: "risk", label: "مخاطر" },
  { value: "news", label: "أخبار" },
  { value: "other", label: "أخرى" },
] as const;

const SEVERITY_OPTIONS = [
  { value: "", label: "—" },
  { value: "low", label: "منخفض" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "مرتفع" },
] as const;

const ALL_TYPES_VALUE = "all";

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تسجيل الإشارة";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تسجيل الإشارة";
}

export function AccountSignalTimeline({
  accountId,
  signals,
  allowCreate = true,
}: {
  accountId: string;
  signals: SalesSignalView[];
  allowCreate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES_VALUE);

  const filteredSignals = useMemo(() => {
    if (typeFilter === ALL_TYPES_VALUE) return signals;
    return signals.filter((item) => item.type === typeFilter);
  }, [signals, typeFilter]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("accountId", accountId);

    try {
      const res = await createSalesSignalAction(formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل الإشارة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">تصفية حسب النوع</p>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm"
          aria-label="تصفية الإشارات"
        >
          <option value={ALL_TYPES_VALUE}>الكل</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filteredSignals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {signals.length === 0
            ? "لا إشارات مسجّلة لهذا الحساب بعد."
            : "لا إشارات مطابقة للتصفية."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredSignals.map((item) => (
            <li key={item.id} className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium flex items-center gap-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  {item.title}
                </p>
                {item.severity ? (
                  <Badge
                    variant="outline"
                    className={SEVERITY_COLORS[item.severity] ?? ""}
                  >
                    {signalSeverityLabelAr(item.severity)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {signalTypeLabelAr(item.type)}
                {item.source ? ` · ${item.source}` : ""} ·{" "}
                {new Date(item.detectedAt).toLocaleString("ar-SA")}
              </p>
              {item.summary ? (
                <p className="text-muted-foreground mt-1">{item.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {allowCreate ? (
        <form action={handleSubmit} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">تسجيل إشارة على الحساب</p>
          <div>
            <Label htmlFor="acct-signal-type">النوع</Label>
            <select
              id="acct-signal-type"
              name="type"
              required
              defaultValue="intent"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="acct-signal-title">العنوان</Label>
            <Input id="acct-signal-title" name="title" required />
          </div>
          <div>
            <Label htmlFor="acct-signal-summary">ملخص</Label>
            <Input id="acct-signal-summary" name="summary" />
          </div>
          <div>
            <Label htmlFor="acct-signal-severity">الأولوية</Label>
            <select
              id="acct-signal-severity"
              name="severity"
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {SEVERITY_OPTIONS.map((o) => (
                <option key={o.value || "none"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="acct-signal-source">المصدر</Label>
            <Input
              id="acct-signal-source"
              name="source"
              placeholder="manual / demo / stub"
            />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            {loading ? "جارٍ الحفظ..." : "تسجيل"}
          </Button>
        </form>
      ) : null}

      <p className="text-xs text-muted-foreground">
        <Link href="/sales/signals" className="text-primary hover:underline">
          عرض كل إشارات المؤسسة
        </Link>
      </p>
    </div>
  );
}
