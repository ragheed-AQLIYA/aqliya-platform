"use client";

import { useState, useEffect, useCallback } from "react";
import {
  workflow_listClients,
  workflow_createClient,
  workflow_updateClientStatus,
} from "@/actions/workflowos-actions";

export interface ClientItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
}

export function useWorkflowClientList({ onChange }: { onChange: () => void }) {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(() => {
    workflow_listClients().then((r) => {
      if (r.success && r.data) setClients(r.data as ClientItem[]);
      else if (r.error) setLoadError(r.error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);
    setError(null);
    const r = await workflow_createClient({
      name: newName.trim(),
      slug: newSlug.trim(),
    });
    setCreating(false);
    if (r.success) {
      setNewName("");
      setNewSlug("");
      setShowCreate(false);
      load();
      onChange();
    } else {
      setError(r.error ?? "فشل إنشاء العميل");
    }
  }

  async function handleToggleStatus(client: ClientItem) {
    const newStatus = client.status === "active" ? "suspended" : "active";
    await workflow_updateClientStatus(client.id, newStatus);
    load();
  }

  return {
    clients,
    loading,
    showCreate,
    setShowCreate,
    newName,
    setNewName,
    newSlug,
    setNewSlug,
    creating,
    error,
    loadError,
    handleCreate,
    handleToggleStatus,
  };
}
