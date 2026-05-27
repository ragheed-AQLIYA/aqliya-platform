"use client";

import { useState, useEffect, useCallback } from "react";
import {
  workflow_listClients,
  workflow_createClient,
  workflow_updateClientStatus,
} from "@/actions/workflowos-actions";
import { Loader2, Plus, Building2, CheckCircle2, XCircle } from "lucide-react";

interface ClientItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
}

export function WorkflowClientList({
  onSelectClient,
  onChange,
}: {
  onSelectClient: (clientId: string) => void;
  onChange: () => void;
}) {
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">العملاء</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          إنشاء عميل
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border bg-card p-4 space-y-3"
        >
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
              اسم العميل *
            </label>
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNewSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                );
              }}
              placeholder="مثال: شركة الأمل"
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
              الرابط المختصر *
            </label>
            <input
              value={newSlug}
              onChange={(e) =>
                setNewSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                )
              }
              placeholder="al-amal"
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono"
              required
              dir="ltr"
            />
          </div>
          {error && (
            <div className="rounded-md bg-status-error/10 p-2 text-[10px] text-status-error">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={creating || !newName.trim() || !newSlug.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "جاري..." : "إنشاء"}
            </button>
          </div>
        </form>
      )}

      {loadError ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-status-error">
          {loadError}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          لا يوجد عملاء بعد
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors"
            >
              <button
                onClick={() => onSelectClient(client.id)}
                className="flex items-center gap-3 min-w-0 text-right"
              >
                <Building2 className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{client.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${client.status === "active" ? "bg-status-success/10 text-status-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {client.status === "active" ? "نشط" : "موقوف"}
                    </span>
                  </div>
                  <div
                    className="text-[10px] text-muted-foreground mt-0.5 font-mono"
                    dir="ltr"
                  >
                    {client.slug}
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleToggleStatus(client)}
                className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title={client.status === "active" ? "إيقاف" : "تفعيل"}
              >
                {client.status === "active" ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
