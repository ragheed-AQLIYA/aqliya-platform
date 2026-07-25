"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listCrmConnections,
  deleteCrmConnection,
  testCrmConnection,
  toggleSync,
  triggerSync,
} from "@/lib/sales/crm/actions";
import { AR, type ConnectionCard, type Notification } from "./constants";

export interface CrmSettingsState {
  connections: ConnectionCard[];
  loading: boolean;
  loadError: string | null;
  notification: Notification | null;
  addDialogOpen: boolean;
  editDialogOpen: boolean;
  editingId: string | null;
  deleteDialogOpen: boolean;
  deletingId: string | null;
  historyDialogOpen: boolean;
  historyConnectionId: string | null;
  syncingId: string | null;
  testingId: string | null;
  togglingId: string | null;
  deleting: boolean;
  orgId: string;
}

export interface CrmSettingsActions {
  load: () => Promise<void>;
  notify: (type: "success" | "error", message: string) => void;
  handleTest: (id: string) => Promise<void>;
  handleSync: (id: string) => Promise<void>;
  handleToggle: (id: string, enabled: boolean) => Promise<void>;
  handleDeleteClick: (id: string) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleEdit: (id: string) => void;
  handleShowHistory: (id: string) => void;
  setAddDialogOpen: (v: boolean) => void;
  setEditDialogOpen: (v: boolean) => void;
  setDeleteDialogOpen: (v: boolean) => void;
  setHistoryDialogOpen: (v: boolean) => void;
  setEditingId: (v: string | null) => void;
  setDeletingId: (v: string | null) => void;
  setHistoryConnectionId: (v: string | null) => void;
  setNotification: (v: Notification | null) => void;
  setLoadError: (v: string | null) => void;
}

export function useCrmSettings(): [CrmSettingsState, CrmSettingsActions] {
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
  const [historyConnectionId, setHistoryConnectionId] = useState<string | null>(
    null
  );

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
      notify(
        "error",
        `${AR.testFailed}: ${err instanceof Error ? err.message : String(err)}`
      );
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
      notify(
        "error",
        `${AR.errorOccurred}: ${err instanceof Error ? err.message : String(err)}`
      );
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
      notify(
        "error",
        `${AR.errorOccurred}: ${err instanceof Error ? err.message : String(err)}`
      );
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

  const state: CrmSettingsState = {
    connections,
    loading,
    loadError,
    notification,
    addDialogOpen,
    editDialogOpen,
    editingId,
    deleteDialogOpen,
    deletingId,
    historyDialogOpen,
    historyConnectionId,
    syncingId,
    testingId,
    togglingId,
    deleting,
    orgId,
  };

  const actions: CrmSettingsActions = {
    load,
    notify,
    handleTest,
    handleSync,
    handleToggle,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEdit,
    handleShowHistory,
    setAddDialogOpen,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setHistoryDialogOpen,
    setEditingId,
    setDeletingId,
    setHistoryConnectionId,
    setNotification,
    setLoadError,
  };

  return [state, actions];
}
