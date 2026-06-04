"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  Cable,
  ExternalLink,
  RefreshCcw,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import {
  listCrmConnections,
  createCrmConnection,
  updateCrmConnection,
  deleteCrmConnection,
  testCrmConnection,
  toggleSync,
  triggerSync,
  getCrmConnection,
  listSyncLogs,
} from "@/lib/sales/crm/actions";

// ─── Arabic Labels ───

const AR = {
  pageTitle: "إعدادات CRM",
  pageDesc: "إدارة الاتصالات بأنظمة CRM الخارجية والمزامنة",
  noConnections: "لا توجد اتصالات CRM بعد",
  noConnectionsDesc: "أضف اتصالاً بالزر أعلاه لبدء مزامنة البيانات",
  addConnection: "إضافة اتصال CRM",
  editConnection: "تعديل اتصال CRM",
  connectionDetail: "تفاصيل الاتصال",
  connectionLabel: "اسم الاتصال",
  provider: "النظام",
  apiEndpoint: "رابط API",
  accessToken: "رمز الوصول",
  refreshToken: "رمز التحديث",
  apiKey: "مفتاح API",
  apiVersion: "إصدار API",
  syncInterval: "فترة المزامنة (دقائق)",
  conflictPolicy: "سياسة التعارض",
  crmWins: "CRM هو الأساس",
  localWins: "النظام المحلي هو الأساس",
  manual: "يدوي",
  save: "حفظ",
  cancel: "إلغاء",
  edit: "تعديل",
  delete: "حذف",
  testConnection: "اختبار الاتصال",
  testing: "جارٍ الاختبار...",
  syncNow: "مزامنة الآن",
  syncing: "جارٍ المزامنة...",
  autoSync: "المزامنة التلقائية",
  enable: "تفعيل",
  disable: "إيقاف",
  lastSync: "آخر مزامنة",
  never: "لم يتم",
  status: "الحالة",
  connected: "متصل",
  error: "خطأ",
  disabled: "معطل",
  testingStatus: "اختبار",
  lastSyncStatus: "آخر مزامنة",
  syncHistory: "سجل المزامنة",
  date: "التاريخ",
  recordsCreated: "تم الإنشاء",
  recordsUpdated: "تم التحديث",
  recordsFailed: "فشل",
  recordsTotal: "الإجمالي",
  resourceType: "النوع",
  direction: "الاتجاه",
  import: "استيراد",
  export: "تصدير",
  success: "ناجح",
  partial: "جزئي",
  failed: "فشل",
  running: "قيد التشغيل",
  confirmDelete: "هل أنت متأكد من حذف هذا الاتصال؟",
  confirmDeleteDesc: "سيؤدي الحذف إلى إزالة الاتصال وجميع سجلات المزامنة المرتبطة به",
  createdSuccess: "تم إنشاء الاتصال بنجاح",
  updatedSuccess: "تم تحديث الاتصال بنجاح",
  deletedSuccess: "تم حذف الاتصال بنجاح",
  syncTriggered: "تم بدء المزامنة",
  testSuccess: "تم اختبار الاتصال بنجاح",
  testFailed: "فشل اختبار الاتصال",
  toggleFailed: "فشل تغيير حالة المزامنة",
  errorOccurred: "حدث خطأ",
  retry: "إعادة المحاولة",
  loadError: "تعذر تحميل الاتصالات",
  allTypes: "الكل",
  showHistory: "سجل المزامنة",
  noSyncLogs: "لا توجد سجلات مزامنة",
  details: "التفاصيل",
  providerHubspot: "HubSpot",
  providerSalesforce: "Salesforce",
  providerApollo: "Apollo",
  providerCustom: "مخصص",
  syncEnabled: "المزامنة مفعلة",
  syncDisabled: "المزامنة معطلة",
  conflictPolicyLabel: "سياسة التعارض",
};

type ProviderType = "hubspot" | "salesforce" | "apollo" | "custom";

interface ConnectionCard {
  id: string;
  provider: string;
  label: string;
  syncEnabled: boolean;
  syncIntervalMin: number | null;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  conflictPolicy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SyncLogEntry {
  id: string;
  resourceType: string;
  direction: string;
  status: string;
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  errorDetails: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

// ─── Helpers ───

function getProviderLabel(p: string): string {
  const map: Record<string, string> = {
    hubspot: AR.providerHubspot,
    salesforce: AR.providerSalesforce,
    apollo: AR.providerApollo,
    custom: AR.providerCustom,
  };
  return map[p] ?? p;
}

function getStatusBadgeVariant(status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (status === "success" || status === "connected") return "default";
  if (status === "testing" || status === "running") return "secondary";
  if (status === "error" || status === "failed") return "destructive";
  return "outline";
}

function getStatusLabel(status: string | null | undefined): string {
  if (status === "success" || status === "connected") return AR.connected;
  if (status === "testing") return AR.testingStatus;
  if (status === "error" || status === "failed") return AR.error;
  if (status === "disabled") return AR.disabled;
  if (status === "running") return AR.running;
  if (status === "partial") return AR.partial;
  return status ?? AR.disabled;
}

function getProviderColor(p: string): string {
  const map: Record<string, string> = {
    hubspot: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-800",
    salesforce: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
    apollo: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800",
    custom: "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-950 dark:border-gray-800",
  };
  return map[p] ?? map.custom;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ─── Notification Banner ───

interface Notification {
  type: "success" | "error";
  message: string;
}

function NotificationBar({ notification, onDismiss }: { notification: Notification | null; onDismiss: () => void }) {
  if (!notification) return null;
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
        notification.type === "success"
          ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      }`}
      role="alert"
    >
      <span>{notification.message}</span>
      <button onClick={onDismiss} className="mr-2 opacity-70 hover:opacity-100" aria-label="إغلاق">
        ✕
      </button>
    </div>
  );
}

// ─── Loading Skeleton ───

function LoadingSkeleton() {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <Card key={i} className="rounded-[20px]">
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ───

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="rounded-[20px]" dir="rtl">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Cable className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="mb-1 text-lg font-semibold">{AR.noConnections}</p>
        <p className="mb-6 text-sm text-muted-foreground">{AR.noConnectionsDesc}</p>
        <Button onClick={onAdd}>
          <Plus className="ml-2 h-4 w-4" />
          {AR.addConnection}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Connection Form ───

interface ConnectionFormData {
  provider: ProviderType;
  label: string;
  apiEndpoint: string;
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  apiVersion: string;
  syncIntervalMin: number;
  conflictPolicy: string;
}

const EMPTY_FORM: ConnectionFormData = {
  provider: "hubspot",
  label: "",
  apiEndpoint: "",
  accessToken: "",
  refreshToken: "",
  apiKey: "",
  apiVersion: "",
  syncIntervalMin: 60,
  conflictPolicy: "crm_wins",
};

function ConnectionFormDialogContent({
  editingId,
  onSaved,
  organizationId,
  onClose,
}: {
  editingId: string | null;
  onSaved: () => void;
  organizationId: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ConnectionFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingId;

  useEffect(() => {
    if (editingId) {
      getCrmConnection(organizationId, editingId).then((c) => {
        setForm({
          provider: (c.provider as ProviderType) ?? "hubspot",
          label: c.label ?? "",
          apiEndpoint: c.apiEndpoint ?? "",
          accessToken: "",
          refreshToken: "",
          apiKey: "",
          apiVersion: c.apiVersion ?? "",
          syncIntervalMin: c.syncIntervalMin ?? 60,
          conflictPolicy: c.conflictPolicy ?? "crm_wins",
        });
      }).catch(() => {});
    }
  }, [editingId, organizationId]);

  function set<K extends keyof ConnectionFormData>(k: K, v: ConnectionFormData[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await updateCrmConnection(organizationId, editingId, {
          label: form.label || undefined,
          apiEndpoint: form.apiEndpoint || undefined,
          accessToken: form.accessToken || undefined,
          refreshToken: form.refreshToken || undefined,
          apiKey: form.apiKey || undefined,
          apiVersion: form.apiVersion || undefined,
          syncIntervalMin: form.syncIntervalMin,
          conflictPolicy: form.conflictPolicy,
        });
      } else {
        await createCrmConnection(organizationId, {
          provider: form.provider,
          label: form.label,
          apiEndpoint: form.apiEndpoint || undefined,
          accessToken: form.accessToken || undefined,
          refreshToken: form.refreshToken || undefined,
          apiKey: form.apiKey || undefined,
          apiVersion: form.apiVersion || undefined,
          syncIntervalMin: form.syncIntervalMin,
          conflictPolicy: form.conflictPolicy,
        });
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!editingId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testCrmConnection(organizationId, editingId);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : String(err) });
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <DialogContent className="sm:max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? AR.editConnection : AR.addConnection}</DialogTitle>
          <DialogDescription>
            {isEditing ? "قم بتعديل إعدادات اتصال CRM" : "أدخل بيانات اتصال CRM للمزامنة"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isEditing && (
            <div className="grid gap-2">
              <Label>{AR.provider}</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => set("provider", v as ProviderType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={AR.provider} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hubspot">{AR.providerHubspot}</SelectItem>
                  <SelectItem value="salesforce">{AR.providerSalesforce}</SelectItem>
                  <SelectItem value="apollo">{AR.providerApollo}</SelectItem>
                  <SelectItem value="custom">{AR.providerCustom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>{AR.connectionLabel}</Label>
            <Input
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder={AR.connectionLabel}
            />
          </div>

          {form.provider === "salesforce" || form.provider === "custom" ? (
            <div className="grid gap-2">
              <Label>{AR.apiEndpoint}</Label>
              <Input
                value={form.apiEndpoint}
                onChange={(e) => set("apiEndpoint", e.target.value)}
                placeholder="https://example.salesforce.com"
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>{AR.accessToken}</Label>
            <Input
              type="password"
              value={form.accessToken}
              onChange={(e) => set("accessToken", e.target.value)}
              placeholder={isEditing ? "اتركه فارغاً إذا لم يتغير" : "رمز الوصول"}
            />
          </div>

          {form.provider === "salesforce" ? (
            <div className="grid gap-2">
              <Label>{AR.refreshToken}</Label>
              <Input
                type="password"
                value={form.refreshToken}
                onChange={(e) => set("refreshToken", e.target.value)}
                placeholder="رمز التحديث"
              />
            </div>
          ) : form.provider === "hubspot" || form.provider === "apollo" ? (
            <div className="grid gap-2">
              <Label>{AR.apiKey}</Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) => set("apiKey", e.target.value)}
                placeholder={isEditing ? "اتركه فارغاً إذا لم يتغير" : AR.apiKey}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>{AR.apiVersion}</Label>
            <Input
              value={form.apiVersion}
              onChange={(e) => set("apiVersion", e.target.value)}
              placeholder="v1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{AR.syncInterval}</Label>
              <Input
                type="number"
                min={5}
                value={form.syncIntervalMin}
                onChange={(e) => set("syncIntervalMin", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>{AR.conflictPolicy}</Label>
              <Select
                value={form.conflictPolicy}
                onValueChange={(v) => set("conflictPolicy", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm_wins">{AR.crmWins}</SelectItem>
                  <SelectItem value="local_wins">{AR.localWins}</SelectItem>
                  <SelectItem value="manual">{AR.manual}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {testResult ? (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                testResult.success
                  ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {testResult.message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {isEditing ? (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  {AR.testing}
                </>
              ) : (
                <>
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                  {AR.testConnection}
                </>
              )}
            </Button>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{AR.cancel}</Button>
          <Button onClick={handleSave} disabled={saving || !form.label.trim()}>
            {saving ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                {AR.save}
              </>
            ) : (
              AR.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  );
}

// ─── Connection Form Dialog Wrapper ───

function ConnectionFormDialog({
  open,
  onOpenChange,
  editingId,
  onSaved,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  onSaved: () => void;
  organizationId: string;
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <ConnectionFormDialogContent
        key={editingId ?? "new"}
        editingId={editingId}
        onSaved={onSaved}
        organizationId={organizationId}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

// ─── Sync History Dialog ───

function SyncHistoryDialogContent({
  connectionId,
  organizationId,
  onClose,
}: {
  connectionId: string;
  organizationId: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listSyncLogs(organizationId, connectionId, 50)
      .then((data) => setLogs(data as unknown as SyncLogEntry[]))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [connectionId, organizationId]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{AR.syncHistory}</DialogTitle>
          <DialogDescription>{AR.details}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{AR.noSyncLogs}</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{AR.date}</TableHead>
                  <TableHead>{AR.resourceType}</TableHead>
                  <TableHead>{AR.status}</TableHead>
                  <TableHead>{AR.recordsTotal}</TableHead>
                  <TableHead>{AR.recordsCreated}</TableHead>
                  <TableHead>{AR.recordsUpdated}</TableHead>
                  <TableHead>{AR.recordsFailed}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <>
                    <TableRow
                      key={log.id}
                      className="cursor-pointer"
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    >
                      <TableCell className="text-xs">{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="text-xs">{log.resourceType}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className="text-xs">
                          {getStatusLabel(log.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{log.totalRecords}</TableCell>
                      <TableCell className="text-xs text-green-600">{log.createdRecords}</TableCell>
                      <TableCell className="text-xs text-blue-600">{log.updatedRecords}</TableCell>
                      <TableCell className="text-xs text-red-600">{log.failedRecords}</TableCell>
                    </TableRow>
                    {expanded === log.id && log.errorDetails ? (
                      <TableRow key={`${log.id}-error`}>
                        <TableCell colSpan={7} className="bg-muted/30 py-2">
                          <div className="rounded bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
                            {log.errorDetails}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {expanded === log.id && !log.errorDetails ? (
                      <TableRow key={`${log.id}-empty`}>
                        <TableCell colSpan={7} className="bg-muted/30 py-2 text-center text-xs text-muted-foreground">
                          {AR.syncTriggered}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{AR.cancel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sync History Dialog Wrapper ───

function SyncHistoryDialog({
  open,
  onOpenChange,
  connectionId,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  connectionId: string;
  organizationId: string;
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <SyncHistoryDialogContent
        key={connectionId}
        connectionId={connectionId}
        organizationId={organizationId}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

// ─── Confirm Delete Dialog ───

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{AR.confirmDelete}</DialogTitle>
          <DialogDescription>{AR.confirmDeleteDesc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              {AR.cancel}
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                {AR.delete}
              </>
            ) : (
              AR.delete
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page Component ───

export default function CrmSettingsPage() {
  const [connections, setConnections] = useState<ConnectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyConnectionId, setHistoryConnectionId] = useState<string | null>(null);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [orgId, setOrgId] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listCrmConnections(orgId);
      setConnections(data as unknown as ConnectionCard[]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((s) => {
          if (s?.user?.organizationId) {
            setOrgId(s.user.organizationId);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (orgId) load();
  }, [orgId, load]);

  function notify(type: "success" | "error", message: string) {
    setNotification({ type, message });
  }

  async function handleTest(id: string) {
    if (!orgId) return;
    setTestingId(id);
    try {
      const result = await testCrmConnection(orgId, id);
      if (result.success) {
        notify("success", AR.testSuccess);
      } else {
        notify("error", `${AR.testFailed}: ${result.message}`);
      }
    } catch (err) {
      notify("error", `${AR.testFailed}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingId(null);
    }
  }

  async function handleSync(id: string) {
    if (!orgId) return;
    setSyncingId(id);
    try {
      await triggerSync(orgId, id);
      notify("success", AR.syncTriggered);
      load();
    } catch (err) {
      notify("error", `${AR.errorOccurred}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncingId(null);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    if (!orgId) return;
    setTogglingId(id);
    try {
      await toggleSync(orgId, id, enabled);
      notify("success", enabled ? AR.syncEnabled : AR.syncDisabled);
      load();
    } catch {
      notify("error", AR.toggleFailed);
    } finally {
      setTogglingId(null);
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingId || !orgId) return;
    setDeleting(true);
    try {
      await deleteCrmConnection(orgId, deletingId);
      notify("success", AR.deletedSuccess);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      load();
    } catch (err) {
      notify("error", `${AR.errorOccurred}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setEditDialogOpen(true);
  }

  function handleShowHistory(id: string) {
    setHistoryConnectionId(id);
    setHistoryDialogOpen(true);
  }

  // ─── Loading State ───
  if (loading) return <LoadingSkeleton />;

  // ─── Error State (load) ───
  if (loadError) {
    return (
      <div className="space-y-4" dir="rtl">
        <NotificationBar notification={{ type: "error", message: `${AR.loadError}: ${loadError}` }} onDismiss={() => setLoadError(null)} />
        <Button onClick={load} variant="outline">
          <RefreshCcw className="ml-2 h-4 w-4" />
          {AR.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Notification */}
      <NotificationBar notification={notification} onDismiss={() => setNotification(null)} />

      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">{AR.pageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{AR.pageDesc}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setAddDialogOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          {AR.addConnection}
        </Button>
      </div>

      {/* Connection list */}
      {connections.length === 0 ? (
        <EmptyState onAdd={() => { setEditingId(null); setAddDialogOpen(true); }} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((conn) => (
            <Card key={conn.id} className="rounded-[20px] transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-xs font-semibold ${getProviderColor(conn.provider)}`}
                    >
                      {getProviderLabel(conn.provider)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(conn.lastSyncStatus)} className="text-xs">
                      {getStatusLabel(conn.lastSyncStatus)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="mt-2 text-base">{conn.label}</CardTitle>
                <CardDescription className="text-xs">
                  {conn.syncEnabled ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <PlayCircle className="h-3 w-3" />
                      {AR.syncEnabled}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <PauseCircle className="h-3 w-3" />
                      {AR.syncDisabled}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{AR.lastSync}</span>
                    <span>{conn.lastSyncAt ? formatDate(conn.lastSyncAt) : AR.never}</span>
                  </div>
                  {conn.conflictPolicy ? (
                    <div className="flex justify-between">
                      <span>{AR.conflictPolicyLabel}</span>
                      <span>
                        {conn.conflictPolicy === "crm_wins"
                          ? AR.crmWins
                          : conn.conflictPolicy === "local_wins"
                            ? AR.localWins
                            : AR.manual}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSync(conn.id)}
                    disabled={syncingId === conn.id}
                  >
                    {syncingId === conn.id ? (
                      <RefreshCw className="ml-1 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="ml-1 h-3 w-3" />
                    )}
                    {AR.syncNow}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(conn.id)}
                    disabled={testingId === conn.id}
                  >
                    <CheckCircle2 className="ml-1 h-3 w-3" />
                    {AR.testConnection}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(conn.id, !conn.syncEnabled)}
                    disabled={togglingId === conn.id}
                  >
                    {conn.syncEnabled ? (
                      <PauseCircle className="ml-1 h-3 w-3" />
                    ) : (
                      <PlayCircle className="ml-1 h-3 w-3" />
                    )}
                    {conn.syncEnabled ? AR.disable : AR.enable}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowHistory(conn.id)}
                  >
                    <ExternalLink className="ml-1 h-3 w-3" />
                    {AR.showHistory}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(conn.id)}
                  >
                    <Edit3 className="ml-1 h-3 w-3" />
                    {AR.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(conn.id)}
                  >
                    <Trash2 className="ml-1 h-3 w-3" />
                    {AR.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      {orgId ? (
        <>
          <ConnectionFormDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            editingId={null}
            onSaved={() => {
              notify("success", AR.createdSuccess);
              load();
            }}
            organizationId={orgId}
          />

          {/* Edit Dialog */}
          <ConnectionFormDialog
            open={editDialogOpen}
            onOpenChange={(v) => {
              setEditDialogOpen(v);
              if (!v) setEditingId(null);
            }}
            editingId={editingId}
            onSaved={() => {
              notify("success", AR.updatedSuccess);
              load();
            }}
            organizationId={orgId}
          />

          {/* Sync History Dialog */}
          {historyConnectionId ? (
            <SyncHistoryDialog
              open={historyDialogOpen}
              onOpenChange={(v) => {
                setHistoryDialogOpen(v);
                if (!v) setHistoryConnectionId(null);
              }}
              connectionId={historyConnectionId}
              organizationId={orgId}
            />
          ) : null}

          {/* Delete Confirm Dialog */}
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={(v) => {
              setDeleteDialogOpen(v);
              if (!v) setDeletingId(null);
            }}
            onConfirm={handleDeleteConfirm}
            deleting={deleting}
          />
        </>
      ) : null}
    </div>
  );
}
