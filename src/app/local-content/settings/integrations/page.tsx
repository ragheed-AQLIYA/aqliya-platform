"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Database,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Server,
  Globe,
  HardDrive,
  Cable,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

import {
  listErpConnectionsAction,
  createErpConnectionAction,
  updateErpConnectionAction,
  deleteErpConnectionAction,
  testErpConnectionAction,
  toggleSyncAction,
  triggerImportAction,
  listImportBatchesAction,
  approveImportBatchAction,
  rejectImportBatchAction,
  listSyncLogsAction,
} from "@/actions/erp-actions";

import type { ErpConnection as PrismaErpConnection, ErpImportBatch as PrismaErpImportBatch, ErpSyncLog as PrismaErpSyncLog } from "@prisma/client";

type ErpConnection = PrismaErpConnection;
type ErpImportBatch = PrismaErpImportBatch;
type ErpSyncLog = PrismaErpSyncLog;

interface Notification {
  type: "success" | "error";
  message: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  sap: "SAP ERP",
  oracle: "Oracle EBS",
  "microsoft-dynamics": "Microsoft Dynamics",
  odoo: "Odoo ERP",
  "csv-upload": "رفع ملف CSV",
  custom: "مخصص",
};

const PROVIDER_ICONS: Record<string, typeof Database> = {
  sap: Server,
  oracle: Globe,
  "microsoft-dynamics": Database,
  odoo: Cable,
  "csv-upload": FileSpreadsheet,
  custom: HardDrive,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  validated: "تم التحقق",
  needs_review: "بحاجة مراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  imported: "تم الاستيراد",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  validated: "secondary",
  needs_review: "destructive",
  approved: "default",
  rejected: "outline",
  imported: "default",
};

const SYNC_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  running: "secondary",
  success: "default",
  partial: "outline",
  failed: "destructive",
};

const SYNC_STATUS_LABELS: Record<string, string> = {
  running: "قيد التشغيل",
  success: "نجاح",
  partial: "جزئي",
  failed: "فشل",
};

// ─── Helpers ───

function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

// ─── Connection Form ───

function ConnectionFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ErpConnection | null;
  onSave: (
    data: Parameters<typeof createErpConnectionAction>[0],
  ) => Promise<void>;
}) {
  const [provider, setProvider] = useState(initial?.provider ?? "sap");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [connectionType, setConnectionType] = useState(
    initial?.connectionType ?? "api",
  );
  const [apiEndpoint, setApiEndpoint] = useState(
    initial?.apiEndpoint ?? "",
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [sftpHost, setSftpHost] = useState("");
  const [sftpPort, setSftpPort] = useState(22);
  const [sftpUsername, setSftpUsername] = useState("");
  const [sftpKey, setSftpKey] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState(
    initial?.defaultCurrency ?? "SAR",
  );
  const [syncIntervalMin, setSyncIntervalMin] = useState(
    initial?.syncIntervalMin ?? 1440,
  );
  const [sourceSystem, setSourceSystem] = useState(
    initial?.sourceSystem ?? "",
  );
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Parameters<typeof createErpConnectionAction>[0] = {
        provider,
        label,
        connectionType,
        defaultCurrency,
        syncIntervalMin,
        sourceSystem: sourceSystem || undefined,
        fieldMapping: undefined,
      };
      if (connectionType === "api" || connectionType === "custom") {
        data.apiEndpoint = apiEndpoint || undefined;
        if (apiKey) data.apiKey = apiKey;
        if (apiSecret) data.apiSecret = apiSecret;
      }
      if (connectionType === "sftp") {
        data.sftpHost = sftpHost || undefined;
        data.sftpPort = sftpPort;
        data.sftpUsername = sftpUsername || undefined;
        if (sftpKey) data.sftpKey = sftpKey;
      }
      await onSave(data);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل اتصال ERP" : "إضافة اتصال ERP جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "تعديل إعدادات اتصال نظام التخطيط"
              : "إعداد اتصال جديد لنظام تخطيط موارد المؤسسة"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>نوع الموفر</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموفر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sap">SAP ERP</SelectItem>
                  <SelectItem value="oracle">Oracle EBS</SelectItem>
                  <SelectItem value="microsoft-dynamics">
                    Microsoft Dynamics
                  </SelectItem>
                  <SelectItem value="odoo">Odoo ERP</SelectItem>
                  <SelectItem value="csv-upload">رفع ملف CSV</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>اسم الاتصال</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="مثال: ERP السعودية"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>نوع الاتصال</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="file_drop">رفع ملفات</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>العملة الافتراضية</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(connectionType === "api" || connectionType === "custom") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>رابط API</Label>
                <Input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://erp.example.com/api/"
                />
              </div>
              <div className="space-y-1.5">
                <Label>مفتاح API</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل المفتاح"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>الرمز السري</Label>
                <Input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل الرمز السري"}
                />
              </div>
            </div>
          )}

          {connectionType === "sftp" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>المضيف</Label>
                <Input
                  value={sftpHost}
                  onChange={(e) => setSftpHost(e.target.value)}
                  placeholder="sftp.example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>المنفذ</Label>
                <Input
                  type="number"
                  value={sftpPort}
                  onChange={(e) => setSftpPort(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>اسم المستخدم</Label>
                <Input
                  value={sftpUsername}
                  onChange={(e) => setSftpUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label>مفتاح SFTP</Label>
                <Input
                  type="password"
                  value={sftpKey}
                  onChange={(e) => setSftpKey(e.target.value)}
                  placeholder={isEdit ? "••••••••" : "أدخل المفتاح"}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>النظام المصدر</Label>
              <Input
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                placeholder="SAP ERP / Oracle Fusion"
              />
            </div>
            <div className="space-y-1.5">
              <Label>فترة المزامنة (دقائق)</Label>
              <Input
                type="number"
                value={syncIntervalMin}
                onChange={(e) => setSyncIntervalMin(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : isEdit ? (
                "حفظ التغييرات"
              ) : (
                "إضافة الاتصال"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Import Review ───

function ImportReviewPanel({
  batch,
  onApprove,
  onReject,
}: {
  batch: ErpImportBatch;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}) {
  const metadata = batch.metadata as
    | { issues?: Array<{ rowNumber: number; field: string; issue: string; severity: string }>; recordCount?: number; supplierCount?: number }
    | null;
  const issues = metadata?.issues ?? [];
  const [reviewNote, setReviewNote] = useState(batch.reviewNotes ?? "");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await onReject(reviewNote || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const errorIssues = issues.filter((i) => i.severity === "error");
  const warningIssues = issues.filter((i) => i.severity === "warning");

  return (
    <div className="border rounded-lg p-4 mt-2 bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">
            مراجعة الدفعة — {batch.totalLines} سجل
          </span>
        </div>
        <div className="flex items-center gap-2">
          {batch.status === "needs_review" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={submitting}
              >
                <XCircle className="ml-1 h-3 w-3" />
                رفض الكل
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={submitting}
              >
                <CheckCircle2 className="ml-1 h-3 w-3" />
                اعتماد الكل
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
        <span>الإجمالي: {batch.totalLines}</span>
        <span>الصحيح: {batch.validLines}</span>
        <span>الأخطاء: {batch.errorLines}</span>
      </div>

      {errorIssues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-1">
            أخطاء التحقق ({errorIssues.length})
          </p>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {errorIssues.slice(0, 20).map((iss, idx) => (
              <div
                key={idx}
                className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded"
              >
                سطر {iss.rowNumber}: {iss.field} — {iss.issue}
              </div>
            ))}
            {errorIssues.length > 20 && (
              <p className="text-xs text-muted-foreground">
                ... و {errorIssues.length - 20} خطأ آخر
              </p>
            )}
          </div>
        </div>
      )}

      {warningIssues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-amber-600 mb-1">
            تحذيرات ({warningIssues.length})
          </p>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {warningIssues.slice(0, 10).map((iss, idx) => (
              <div
                key={idx}
                className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded"
              >
                سطر {iss.rowNumber}: {iss.field} — {iss.issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {batch.status === "needs_review" && (
        <div className="space-y-1.5">
          <Label className="text-xs">ملاحظات المراجعة</Label>
          <Textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="أدخل ملاحظات المراجعة..."
            className="min-h-[60px]"
          />
        </div>
      )}
    </div>
  );
}

// ─── Connection Detail Panel ───

function ConnectionDetailPanel({
  connection,
  onClose,
}: {
  connection: ErpConnection;
  onClose: () => void;
}) {
  const [batches, setBatches] = useState<ErpImportBatch[]>([]);
  const [syncLogs, setSyncLogs] = useState<ErpSyncLog[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [notif, setNotif] = useState<Notification | null>(null);
  const [testing, setTesting] = useState(false);
  const [running, setRunning] = useState(false);

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    const res = await listImportBatchesAction(
      connection.id,
      filterStatus ?? undefined,
    );
    if (res.ok) setBatches(res.data as ErpImportBatch[]);
    setBatchesLoading(false);
  }, [connection.id, filterStatus]);

  const loadSyncLogs = useCallback(async () => {
    setSyncLoading(true);
    const res = await listSyncLogsAction(connection.id);
    if (res.ok) setSyncLogs(res.data as ErpSyncLog[]);
    setSyncLoading(false);
  }, [connection.id]);

  useEffect(() => {
    loadBatches();
    loadSyncLogs();
  }, [loadBatches, loadSyncLogs]);

  const handleTest = async () => {
    setTesting(true);
    const res = await testErpConnectionAction(connection.id);
    if (res.ok) {
      setNotif({
        type: res.data.success ? "success" : "error",
        message: res.data.message,
      });
    } else {
      setNotif({ type: "error", message: res.error ?? "فشل الاختبار" });
    }
    setTesting(false);
  };

  const handleImport = async () => {
    setRunning(true);
    const res = await triggerImportAction(connection.id);
    if (res.ok) {
      setNotif({ type: "success", message: "تم تشغيل الاستيراد بنجاح" });
      loadBatches();
      loadSyncLogs();
    } else {
      setNotif({ type: "error", message: res.error ?? "فشل الاستيراد" });
    }
    setRunning(false);
  };

  const handleApprove = async (batchId: string) => {
    const res = await approveImportBatchAction(batchId);
    if (res.ok) {
      setNotif({ type: "success", message: "تم اعتماد الدفعة" });
      loadBatches();
    } else {
      setNotif({ type: "error", message: res.error ?? "فشل الاعتماد" });
    }
  };

  const handleReject = async (batchId: string, reason?: string) => {
    const res = await rejectImportBatchAction(batchId, reason);
    if (res.ok) {
      setNotif({ type: "success", message: "تم رفض الدفعة" });
      loadBatches();
    } else {
      setNotif({ type: "error", message: res.error ?? "فشل الرفض" });
    }
  };

  return (
    <div className="space-y-6">
      {notif && (
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            notif.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
          )}
        >
          {notif.message}
          <button
            className="mr-2 text-xs underline"
            onClick={() => setNotif(null)}
          >
            إخفاء
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{connection.label}</h3>
          <p className="text-sm text-muted-foreground">
            {PROVIDER_LABELS[connection.provider] ?? connection.provider} —{" "}
            {connection.connectionType}
            {connection.defaultCurrency
              ? ` — ${connection.defaultCurrency}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <Cable className="ml-1 h-3 w-3" />
            )}
            اختبار
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={running}
          >
            {running ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="ml-1 h-3 w-3" />
            )}
            استيراد الآن
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>

      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">دفعات الاستيراد</TabsTrigger>
          <TabsTrigger value="sync-logs">سجل المزامنة</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="validated">تم التحقق</SelectItem>
                <SelectItem value="needs_review">بحاجة مراجعة</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="imported">تم الاستيراد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {batchesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              لا توجد دفعات استيراد بعد. قم بتشغيل استيراد أول مرة.
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div key={batch.id}>
                  <Card
                    className={cn(
                      "cursor-pointer hover:border-primary/50 transition-colors",
                      expandedBatchId === batch.id && "border-primary",
                    )}
                  >
                    <CardContent
                      className="p-3"
                      onClick={() =>
                        setExpandedBatchId(
                          expandedBatchId === batch.id ? null : batch.id,
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              STATUS_VARIANTS[batch.status] ?? "outline"
                            }
                          >
                            {STATUS_LABELS[batch.status] ?? batch.status}
                          </Badge>
                          <div className="text-sm">
                            <span className="font-medium">
                              {batch.sourceType === "api"
                                ? "API"
                                : batch.sourceType === "csv"
                                  ? "CSV"
                                  : batch.sourceType === "excel"
                                    ? "Excel"
                                    : batch.sourceType === "sftp"
                                      ? "SFTP"
                                      : batch.sourceType}
                            </span>
                            <span className="mx-1 text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {formatDate(batch.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>الإجمالي: {batch.totalLines}</span>
                          <span className="text-green-600">
                            صحيح: {batch.validLines}
                          </span>
                          {batch.errorLines > 0 && (
                            <span className="text-red-600">
                              أخطاء: {batch.errorLines}
                            </span>
                          )}
                          {expandedBatchId === batch.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {expandedBatchId === batch.id && (
                    <ImportReviewPanel
                      batch={batch}
                      onApprove={() => handleApprove(batch.id)}
                      onReject={(reason) => handleReject(batch.id, reason)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-logs">
          {syncLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : syncLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              لا توجد سجلات مزامنة بعد.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الاتجاه</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>المستورد</TableHead>
                    <TableHead>الأخطاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.direction === "import" ? "استيراد" : "تصدير"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            SYNC_STATUS_VARIANTS[log.status] ?? "outline"
                          }
                          className="text-xs"
                        >
                          {SYNC_STATUS_LABELS[log.status] ?? log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.totalRecords}
                      </TableCell>
                      <TableCell className="text-xs text-green-600">
                        {log.importedRecords}
                      </TableCell>
                      <TableCell className="text-xs text-red-600">
                        {log.failedRecords}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ───

export default function ErpIntegrationsPage() {
  const [connections, setConnections] = useState<ErpConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<Notification | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<ErpConnection | null>(null);
  const [detailConnection, setDetailConnection] =
    useState<ErpConnection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listErpConnectionsAction();
    if (res.ok) {
      setConnections(res.data as ErpConnection[]);
    } else {
      setError(res.error ?? "فشل تحميل الاتصالات");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleCreate = async (
    data: Parameters<typeof createErpConnectionAction>[0],
  ) => {
    const res = await createErpConnectionAction(data);
    if (res.ok) {
      setNotif({ type: "success", message: "تم إنشاء اتصال ERP بنجاح" });
      loadConnections();
    } else {
      throw new Error(res.error ?? "فشل إنشاء الاتصال");
    }
  };

  const handleUpdate = async (
    connectionId: string,
    data: Parameters<typeof updateErpConnectionAction>[1],
  ) => {
    const res = await updateErpConnectionAction(connectionId, data);
    if (res.ok) {
      setNotif({ type: "success", message: "تم تحديث الاتصال بنجاح" });
      setEditingConnection(null);
      loadConnections();
    } else {
      setNotif({
        type: "error",
        message: res.error ?? "فشل تحديث الاتصال",
      });
    }
  };

  const handleDelete = async (connectionId: string) => {
    setDeletingId(connectionId);
    const res = await deleteErpConnectionAction(connectionId);
    if (res.ok) {
      setNotif({ type: "success", message: "تم حذف الاتصال" });
      loadConnections();
    } else {
      setNotif({
        type: "error",
        message: res.error ?? "فشل حذف الاتصال",
      });
    }
    setDeletingId(null);
  };

  const handleToggleSync = async (
    connectionId: string,
    enabled: boolean,
  ) => {
    const res = await toggleSyncAction(connectionId, enabled);
    if (res.ok) {
      setNotif({
        type: "success",
        message: enabled
          ? "تم تفعيل المزامنة التلقائية"
          : "تم إيقاف المزامنة التلقائية",
      });
      loadConnections();
    } else {
      setNotif({
        type: "error",
        message: res.error ?? "فشل تغيير حالة المزامنة",
      });
    }
  };

  // ── Render ──

  return (
    <div dir="rtl" className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">تكاملات ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة اتصالات أنظمة تخطيط موارد المؤسسة واستيراد بيانات الإنفاق
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="ml-1 h-4 w-4" />
          إضافة اتصال ERP
        </Button>
      </div>

      {notif && (
        <div
          className={cn(
            "mb-4 rounded-lg border p-3 text-sm",
            notif.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
          )}
        >
          {notif.message}
          <button
            className="mr-2 text-xs underline"
            onClick={() => setNotif(null)}
          >
            إخفاء
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
          <Button
            variant="ghost"
            size="xs"
            className="mr-2"
            onClick={loadConnections}
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !detailConnection && connections.length === 0 ? (
        <div className="py-20 text-center">
          <Database className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-base font-semibold">
            لا توجد تكاملات ERP بعد
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            قم بإضافة اتصال بنظام تخطيط موارد المؤسسة لبدء استيراد بيانات
            الإنفاق والموردين تلقائياً.
          </p>
          <Button
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="ml-1 h-4 w-4" />
            إضافة اتصال ERP
          </Button>
        </div>
      ) : detailConnection ? (
        <ConnectionDetailPanel
          connection={detailConnection}
          onClose={() => setDetailConnection(null)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((conn) => {
            const ProviderIcon =
              PROVIDER_ICONS[conn.provider] ?? Database;
            return (
              <Card
                key={conn.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-sm">
                        {conn.label}
                      </CardTitle>
                    </div>
                    {conn.syncEnabled ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {PROVIDER_LABELS[conn.provider] ?? conn.provider}
                    {conn.defaultCurrency
                      ? ` · ${conn.defaultCurrency}`
                      : ""}
                    {conn.lastSyncAt
                      ? ` · آخر مزامنة: ${formatDate(conn.lastSyncAt)}`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {conn.connectionType === "api"
                        ? "API"
                        : conn.connectionType === "sftp"
                          ? "SFTP"
                          : conn.connectionType === "file_drop"
                            ? "رفع ملفات"
                            : "مخصص"}
                    </Badge>
                    {conn.lastSyncStatus && (
                      <Badge
                        variant={
                          conn.lastSyncStatus === "success"
                            ? "default"
                            : conn.lastSyncStatus === "failed"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {conn.lastSyncStatus === "success"
                          ? "آخر مزامنة ناجحة"
                          : conn.lastSyncStatus === "failed"
                            ? "فشل آخر مزامنة"
                            : conn.lastSyncStatus}
                      </Badge>
                    )}
                    {conn.syncEnabled && (
                      <Badge variant="secondary" className="text-[10px]">
                        {conn.syncIntervalMin
                          ? `كل ${conn.syncIntervalMin} دقيقة`
                          : "تلقائي"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setDetailConnection(conn)}
                  >
                    <Eye className="ml-1 h-3 w-3" />
                    التفاصيل
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setEditingConnection(conn)}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant={conn.syncEnabled ? "secondary" : "outline"}
                    size="xs"
                    onClick={() =>
                      handleToggleSync(conn.id, !conn.syncEnabled)
                    }
                  >
                    {conn.syncEnabled ? (
                      <>
                        <WifiOff className="ml-1 h-3 w-3" />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Wifi className="ml-1 h-3 w-3" />
                        تفعيل
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="xs"
                    disabled={deletingId === conn.id}
                    onClick={() => {
                      if (
                        window.confirm(
                          `هل أنت متأكد من حذف اتصال "${conn.label}"؟`,
                        )
                      ) {
                        handleDelete(conn.id);
                      }
                    }}
                  >
                    {deletingId === conn.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <ConnectionFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleCreate}
      />

      {editingConnection && (
        <ConnectionFormDialog
          open={!!editingConnection}
          onOpenChange={(v) => {
            if (!v) setEditingConnection(null);
          }}
          initial={editingConnection}
          onSave={async (data) => {
            await handleUpdate(editingConnection.id, data);
          }}
        />
      )}
    </div>
  );
}
