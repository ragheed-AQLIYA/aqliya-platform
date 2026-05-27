"use client";

import { useState, useEffect } from "react";
import { workflow_listClients } from "@/actions/workflowos-actions";
import { cn } from "@/lib/utils";
import { Building2, ChevronDown, Loader2 } from "lucide-react";

interface WorkflowClient {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function WorkflowClientSelector({
  clientId,
  onClientChange,
  className,
}: {
  clientId: string | null;
  onClientChange: (id: string) => void;
  className?: string;
}) {
  const [clients, setClients] = useState<WorkflowClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const result = await workflow_listClients();
      if (result.success && result.data) {
        const list = result.data as WorkflowClient[];
        setClients(list);
        if (list.length > 0 && !clientId) {
          onClientChange(list[0].id);
        }
      } else {
        setError(result.error ?? "فشل تحميل العملاء");
      }
      setLoading(false);
    }
    load();
  }, []);

  const selected = clients.find((c) => c.id === clientId);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>جاري تحميل العملاء...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-status-error",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (clients.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors min-w-[200px]"
      >
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate">{selected?.name ?? "اختر عميلاً"}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 mr-auto transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 z-20 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onClientChange(client.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-right",
                  client.id === clientId
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-popover-foreground hover:bg-muted",
                )}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{client.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
