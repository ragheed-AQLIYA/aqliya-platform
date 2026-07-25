import { useState, useEffect, useCallback } from "react";
import {
  workflow_listRecords,
  workflow_getUserRole,
} from "@/actions/workflowos-actions";
import { getCurrentUserPendingExportCount } from "@/actions/workflowos-export-actions";

export interface DashboardStats {
  total: number;
  draft: number;
  underReview: number;
  approved: number;
  pendingExports: number;
  escalated: number;
}

export function useWorkflowDashboard() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    draft: 0,
    underReview: 0,
    approved: 0,
    pendingExports: 0,
    escalated: 0,
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const onCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!clientId) {
      Promise.resolve().then(() => setUserRole(null));
      return;
    }
    workflow_getUserRole(clientId!).then((r) => {
      if (r.success) setUserRole(r.data as string | null);
    });
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    workflow_listRecords(clientId!).then((result) => {
      if (result.success && result.data) {
        const records = result.data as Array<{ status: string }>;
        setStats({
          total: records.length,
          draft: records.filter((r) => r.status === "Draft").length,
          underReview: records.filter((r) => r.status === "UnderReview").length,
          approved: records.filter((r) => r.status === "Approved").length,
          pendingExports: 0,
          escalated: 0,
        });
      }
      if (!result.success) {
        if (result.error?.includes("Access denied")) {
          setNoAccess(true);
        } else if (result.error?.includes("Unauthenticated")) {
          setNoAccess(true);
        }
      }
    });
    getCurrentUserPendingExportCount().then((result) => {
      if (result.success && result.data) {
        setStats((prev) => ({
          ...prev,
          pendingExports: result.data.pending,
          escalated: result.data.escalated,
        }));
      }
    });
  }, [clientId, refreshKey]);

  return {
    clientId,
    setClientId,
    noAccess,
    stats,
    userRole,
    refreshKey,
    onCreated,
  };
}
