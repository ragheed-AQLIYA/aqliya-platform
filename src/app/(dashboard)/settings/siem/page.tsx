"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
} from "lucide-react";
import type { SiemExportJob, SiemFormat } from "@/lib/platform/siem/types";

// ─── Types ───

interface SiemPageState {
  jobs: SiemExportJob[];
  loading: boolean;
  exporting: boolean;
  error: string | null;
  format: SiemFormat;
  destinationUrl: string;
  destinationToken: string;
  schedule: string;
  configSaving: boolean;
  configMessage: string | null;
}

// ─── Status Badge ───

function JobStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: string }> = {
    pending: { label: "قيد الانتظار", variant: "bg-yellow-100 text-yellow-800" },
    in_progress: {
      label: "قيد التنفيذ",
      variant: "bg-blue-100 text-blue-800",
    },
    completed: {
      label: "مكتمل",
      variant: "bg-green-100 text-green-800",
    },
    failed: { label: "فشل", variant: "bg-red-100 text-red-800" },
  };
  const c = config[status] ?? {
    label: status,
    variant: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.variant}`}
    >
      {status === "completed" && <CheckCircle2 className="h-3 w-3" />}
      {status === "failed" && <XCircle className="h-3 w-3" />}
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "in_progress" && <Loader2 className="h-3 w-3 animate-spin" />}
      {c.label}
    </span>
  );
}

// ─── Main Page ───

export default function SiemSettingsPage() {
  const [state, setState] = useState<SiemPageState>({
    jobs: [],
    loading: true,
    exporting: false,
    error: null,
    format: "json",
    destinationUrl: "",
    destinationToken: "",
    schedule: "manual",
    configSaving: false,
    configMessage: null,
  });

  const fetchJobs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/platform/siem");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to fetch export jobs");
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        jobs: data.jobs ?? [],
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ─── Manual export ───

  const handleManualExport = useCallback(async () => {
    setState((prev) => ({ ...prev, exporting: true, error: null }));
    try {
      const res = await fetch("/api/platform/siem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "export", format: state.format }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Export failed");
      }
      await fetchJobs();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Export failed",
      }));
    } finally {
      setState((prev) => ({ ...prev, exporting: false }));
    }
  }, [state.format, fetchJobs]);

  // ─── Save config ───

  const handleSaveConfig = useCallback(async () => {
    setState((prev) => ({ ...prev, configSaving: true, configMessage: null }));
    try {
      const res = await fetch("/api/platform/siem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "config",
          format: state.format,
          label: "SIEM Export",
          schedule: state.schedule,
          enabled: true,
          destination: state.destinationUrl
            ? {
                id: "manual",
                organizationId: "",
                label: "SIEM Destination",
                type: "http",
                url: state.destinationUrl,
                ...(state.destinationToken
                  ? { token: state.destinationToken }
                  : {}),
                format: state.format,
                enabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save config");
      }
      setState((prev) => ({
        ...prev,
        configMessage: "تم حفظ الإعدادات بنجاح",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        configMessage: err instanceof Error ? err.message : "فشل الحفظ",
      }));
    } finally {
      setState((prev) => ({ ...prev, configSaving: false }));
    }
  }, [state.format, state.schedule, state.destinationUrl, state.destinationToken]);

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">تصدير سجلات التدقيق (SIEM)</h1>
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Config Message */}
      {state.configMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{state.configMessage}</span>
        </div>
      )}

      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            إعدادات التصدير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">صيغة التصدير</Label>
              <Select
                value={state.format}
                onValueChange={(v) =>
                  setState((prev) => ({ ...prev, format: v as SiemFormat }))
                }
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="syslog">Syslog (RFC 5424)</SelectItem>
                  <SelectItem value="cef">CEF (ArcSight)</SelectItem>
                  <SelectItem value="splunk-hec">Splunk HEC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">الجدولة</Label>
              <Select
                value={state.schedule}
                onValueChange={(v) =>
                  setState((prev) => ({ ...prev, schedule: v }))
                }
              >
                <SelectTrigger id="schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">يدوي</SelectItem>
                  <SelectItem value="hourly">كل ساعة</SelectItem>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destUrl">رابط الوجهة (اختياري)</Label>
            <Input
              id="destUrl"
              type="url"
              dir="ltr"
              placeholder="https://siem.example.com/endpoint"
              value={state.destinationUrl}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  destinationUrl: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destToken">رمز التوثيق (اختياري)</Label>
            <Input
              id="destToken"
              type="password"
              dir="ltr"
              placeholder="Splunk HEC token or API key"
              value={state.destinationToken}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  destinationToken: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveConfig}
              disabled={state.configSaving}
            >
              {state.configSaving && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              حفظ الإعدادات
            </Button>

            <Button
              variant="default"
              onClick={handleManualExport}
              disabled={state.exporting}
            >
              {state.exporting ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 ml-2" />
              )}
              تصدير يدوي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل التصدير</CardTitle>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : state.error && state.jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">تعذر تحميل سجل التصدير</p>
            </div>
          ) : state.jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mb-2" />
              <p className="text-sm">لا توجد عمليات تصدير سابقة</p>
              <p className="text-xs">استخدم زر "تصدير يدوي" لبدء تصدير جديد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-right py-2 px-2">التاريخ</th>
                    <th className="text-right py-2 px-2">الصيغة</th>
                    <th className="text-right py-2 px-2">الأحداث</th>
                    <th className="text-right py-2 px-2">الحالة</th>
                    <th className="text-right py-2 px-2">الخطأ</th>
                  </tr>
                </thead>
                <tbody>
                  {state.jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 text-xs font-mono">
                        {new Date(job.exportedAt).toLocaleString("ar-SA")}
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[10px]">
                          {job.format}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">{job.totalEvents}</td>
                      <td className="py-2 px-2">
                        <JobStatusBadge status={job.status} />
                      </td>
                      <td className="py-2 px-2 text-xs text-red-600 max-w-[200px] truncate">
                        {job.error ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
