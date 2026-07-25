"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Users,
  Building2,
  Briefcase,
} from "lucide-react";
import { triggerSync } from "@/lib/sales/crm/actions";
import {
  AR,
  getStatusBadgeVariant,
  getStatusLabel,
  formatDate,
} from "./constants";

// ─── Arabic labels for this component ───

const UI_AR = {
  title: "حالة المزامنة",
  desc: "آخر حالة لمزامنة بيانات CRM",
  lastSync: "آخر مزامنة",
  never: "لم تتم المزامنة بعد",
  idle: "في الانتظار",
  running: "جارٍ المزامنة...",
  error: "خطأ في المزامنة",
  success: "المزامنة ناجحة",
  partial: "مزامنة جزئية",
  syncNow: "مزامنة الآن",
  syncing: "جارٍ المزامنة...",
  deals: "الصفقات المستوردة",
  contacts: "جهات الاتصال المستوردة",
  accounts: "الحسابات المستوردة",
  noConnection: "لا يوجد اتصال CRM نشط",
};

// ─── Types ───

interface SyncStatusData {
  connectionId: string;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  syncEnabled: boolean;
  counts: {
    dealsImported: number;
    contactsImported: number;
    accountsImported: number;
  };
}

// ─── SyncStatusCard ───

export function SyncStatusCard({
  organizationId,
  provider = "hubspot",
}: {
  organizationId: string;
  provider?: string;
}) {
  const [data, setData] = useState<SyncStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statusRes, countsRes] = await Promise.all([
        fetch(
          `/api/sales/crm/status?organizationId=${organizationId}&provider=${provider}`,
        ),
        fetch(
          `/api/sales/crm/counts?organizationId=${organizationId}&provider=${provider}`,
        ),
      ]);

      const status = statusRes.ok ? await statusRes.json() : null;
      const counts = countsRes.ok ? await countsRes.json() : { dealsImported: 0, contactsImported: 0, accountsImported: 0 };

      setData({
        connectionId: status?.latestLog?.id ?? "",
        lastSyncAt: status?.lastSyncAt ?? null,
        lastSyncStatus: status?.lastSyncStatus ?? null,
        syncEnabled: status?.syncEnabled ?? false,
        counts,
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, provider]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSync() {
    if (!organizationId || syncing) return;
    setSyncing(true);
    try {
      const connectionsRes = await fetch(
        `/api/sales/crm/connections?organizationId=${organizationId}&provider=${provider}`,
      );
      const connections = connectionsRes.ok ? await connectionsRes.json() : [];
      const conn = Array.isArray(connections) ? connections[0] : null;
      if (conn?.id) {
        await triggerSync(organizationId, conn.id);
        await load();
      }
    } catch {
      // Silently handle errors — user sees stale data
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>{UI_AR.title}</CardTitle>
          <CardDescription>{UI_AR.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {UI_AR.noConnection}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusIcon = data.lastSyncStatus === "success"
    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
    : data.lastSyncStatus === "partial"
      ? <AlertCircle className="h-4 w-4 text-amber-500" />
      : data.lastSyncStatus === "failed" || data.lastSyncStatus === "error"
        ? <AlertCircle className="h-4 w-4 text-red-500" />
        : <Clock className="h-4 w-4 text-muted-foreground" />;

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            {UI_AR.title}
          </CardTitle>
          <CardDescription className="text-xs">
            {UI_AR.desc}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCcw
            className={`ml-1 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? UI_AR.syncing : UI_AR.syncNow}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {statusIcon}
              <span>{AR.lastSync}</span>
            </div>
            <p className="text-sm font-medium">
              {data.lastSyncAt ? formatDate(data.lastSyncAt) : UI_AR.never}
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{AR.status}</div>
            <Badge
              variant={getStatusBadgeVariant(data.lastSyncStatus)}
              className="text-xs"
            >
              {getStatusLabel(data.lastSyncStatus)}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">{UI_AR.deals}</p>
              <p className="text-lg font-bold tabular-nums">
                {data.counts.dealsImported}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">{UI_AR.contacts}</p>
              <p className="text-lg font-bold tabular-nums">
                {data.counts.contactsImported}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">{UI_AR.accounts}</p>
              <p className="text-lg font-bold tabular-nums">
                {data.counts.accountsImported}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
