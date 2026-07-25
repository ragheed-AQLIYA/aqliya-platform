import { Building2, CheckCircle2, XCircle } from "lucide-react";
import type { ClientItem } from "./use-workflow-client-list";

export function WorkflowClientCard({
  client,
  onSelectClient,
  onToggleStatus,
}: {
  client: ClientItem;
  onSelectClient: (clientId: string) => void;
  onToggleStatus: (client: ClientItem) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors">
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
        onClick={() => onToggleStatus(client)}
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
  );
}
