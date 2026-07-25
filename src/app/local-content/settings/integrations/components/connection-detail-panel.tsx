"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RefreshCw,
  Cable,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  testErpConnectionAction,
  triggerImportAction,
  listImportBatchesAction,
  approveImportBatchAction,
  rejectImportBatchAction,
  listSyncLogsAction,
} from "@/actions/erp-actions";

import type {
  ErpConnection as PrismaErpConnection,
  ErpImportBatch as PrismaErpImportBatch,
  ErpSyncLog as PrismaErpSyncLog,
} from "@prisma/client";

import { ImportReviewPanel } from "./import-review-panel";
import {
  cn,
  formatDate,
  PROVIDER_LABELS,
  STATUS_LABELS,
  STATUS_VARIANTS,
  SYNC_STATUS_VARIANTS,
  SYNC_STATUS_LABELS,
} from "./utils";
import type { Notification } from "./utils";

type ErpConnection = PrismaErpConnection;
type ErpImportBatch = PrismaErpImportBatch;
type ErpSyncLog = PrismaErpSyncLog;

interface ConnectionDetailPanelProps {
  connection: ErpConnection;
  onClose: () => void;
}

export function ConnectionDetailPanel({
  connection,
  onClose,
}: ConnectionDetailPanelProps) {
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
                            <span className="mx-1 text-muted-foreground">
                              ·
                            </span>
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
