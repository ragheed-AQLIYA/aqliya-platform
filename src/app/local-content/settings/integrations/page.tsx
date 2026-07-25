"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Plus, Wifi, WifiOff, Eye, Trash2, Loader2 } from "lucide-react";

import { ConnectionFormDialog } from "./components/connection-form-dialog";
import { ConnectionDetailPanel } from "./components/connection-detail-panel";
import { useErpIntegrations } from "./components/use-erp-integrations";
import {
  cn,
  formatDate,
  PROVIDER_LABELS,
  PROVIDER_ICONS,
} from "./components/utils";

export default function ErpIntegrationsPage() {
  const { state, actions } = useErpIntegrations();

  return (
    <div dir="rtl" className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">تكاملات ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة اتصالات أنظمة تخطيط موارد المؤسسة واستيراد بيانات الإنفاق</p>
        </div>
        <Button onClick={() => actions.setShowAddDialog(true)}>
          <Plus className="ml-1 h-4 w-4" />
          إضافة اتصال ERP
        </Button>
      </div>
      {state.notif && (
        <div
          className={cn(
            "mb-4 rounded-lg border p-3 text-sm",
            state.notif.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
          )}
        >
          {state.notif.message}
          <button
            className="mr-2 text-xs underline"
            onClick={() => actions.setNotif(null)}
          >
            إخفاء
          </button>
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
          <Button
            variant="ghost"
            size="xs"
            className="mr-2"
            onClick={actions.loadConnections}
          >
            إعادة المحاولة
          </Button>
        </div>
      )}
      {state.loading ? (
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
      ) : !state.detailConnection && state.connections.length === 0 ? (
        <div className="py-20 text-center">
          <Database className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-base font-semibold">لا توجد تكاملات ERP بعد</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            قم بإضافة اتصال بنظام تخطيط موارد المؤسسة لبدء استيراد بيانات الإنفاق والموردين تلقائياً.
          </p>
          <Button
            className="mt-4"
            onClick={() => actions.setShowAddDialog(true)}
          >
            <Plus className="ml-1 h-4 w-4" />
            إضافة اتصال ERP
          </Button>
        </div>
      ) : state.detailConnection ? (
        <ConnectionDetailPanel
          connection={state.detailConnection}
          onClose={() => actions.setDetailConnection(null)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.connections.map((conn) => {
            const ProviderIcon = PROVIDER_ICONS[conn.provider] ?? Database;
            return (
              <Card
                key={conn.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-sm">{conn.label}</CardTitle>
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
                    onClick={() => actions.setDetailConnection(conn)}
                  >
                    <Eye className="ml-1 h-3 w-3" />
                    التفاصيل
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => actions.setEditingConnection(conn)}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant={conn.syncEnabled ? "secondary" : "outline"}
                    size="xs"
                    onClick={() =>
                      actions.handleToggleSync(conn.id, !conn.syncEnabled)
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
                    disabled={state.deletingId === conn.id}
                    onClick={() => {
                      if (
                        window.confirm(
                          `هل أنت متأكد من حذف اتصال "${conn.label}"؟`,
                        )
                      ) {
                        actions.handleDelete(conn.id);
                      }
                    }}
                  >
                    {state.deletingId === conn.id ? (
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
        open={state.showAddDialog}
        onOpenChange={actions.setShowAddDialog}
        onSave={actions.handleCreate}
      />
      {state.editingConnection && (
        <ConnectionFormDialog
          open={!!state.editingConnection}
          onOpenChange={(v) => {
            if (!v) actions.setEditingConnection(null);
          }}
          initial={state.editingConnection}
          onSave={async (data) => {
            await actions.handleUpdate(state.editingConnection!.id, data);
          }}
        />
      )}
    </div>
  );
}
