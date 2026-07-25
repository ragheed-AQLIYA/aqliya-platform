"use client";

import { useCallback, useEffect, useState } from "react";

import {
  listErpConnectionsAction,
  createErpConnectionAction,
  updateErpConnectionAction,
  deleteErpConnectionAction,
  toggleSyncAction,
} from "@/actions/erp-actions";

import type { ErpConnection as PrismaErpConnection } from "@prisma/client";
import type { Notification } from "./utils";

type ErpConnection = PrismaErpConnection;

export function useErpIntegrations() {
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

  return {
    state: {
      connections,
      loading,
      error,
      notif,
      showAddDialog,
      editingConnection,
      detailConnection,
      deletingId,
    },
    actions: {
      setNotif,
      setShowAddDialog,
      setEditingConnection,
      setDetailConnection,
      loadConnections,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleToggleSync,
    },
  };
}
