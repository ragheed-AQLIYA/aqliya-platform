"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";

import { useCrmSettings } from "./components/use-crm-settings";
import { AR } from "./components/constants";
import { NotificationBar } from "./components/notification-bar";
import { LoadingSkeleton } from "./components/loading-skeleton";
import { EmptyState } from "./components/empty-state";
import { ConnectionCardItem } from "./components/connection-card";
import { ConnectionFormDialog } from "./components/connection-form-dialog";
import { SyncHistoryDialog } from "./components/sync-history-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { IntelConnectorsPanel } from "@/components/sales/intel-connectors-panel";
import { ApiKeyManager } from "@/components/sales/api-key-manager";
import { LinkedInConnectButton } from "@/components/sales/linkedin-connect-button";

export default function CrmSettingsPage() {
  const [state, actions] = useCrmSettings();

  if (state.loading) return <LoadingSkeleton />;

  if (state.loadError) {
    return (
      <div className="space-y-4" dir="rtl">
        <NotificationBar
          notification={{
            type: "error",
            message: `${AR.loadError}: ${state.loadError}`,
          }}
          onDismiss={() => actions.setLoadError(null)}
        />
        <Button onClick={actions.load} variant="outline">
          <RefreshCcw className="ml-2 h-4 w-4" />
          {AR.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <NotificationBar
        notification={state.notification}
        onDismiss={() => actions.setNotification(null)}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">
            {AR.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{AR.pageDesc}</p>
        </div>
        <Button
          onClick={() => {
            actions.setEditingId(null);
            actions.setAddDialogOpen(true);
          }}
        >
          <Plus className="ml-2 h-4 w-4" />
          {AR.addConnection}
        </Button>
      </div>

      {state.connections.length === 0 ? (
        <EmptyState
          onAdd={() => {
            actions.setEditingId(null);
            actions.setAddDialogOpen(true);
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.connections.map((conn) => (
            <ConnectionCardItem
              key={conn.id}
              conn={conn}
              syncingId={state.syncingId}
              testingId={state.testingId}
              togglingId={state.togglingId}
              onSync={actions.handleSync}
              onTest={actions.handleTest}
              onToggle={actions.handleToggle}
              onShowHistory={actions.handleShowHistory}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDeleteClick}
            />
          ))}
        </div>
      )}

      {state.orgId ? (
        <>
          <ConnectionFormDialog
            open={state.addDialogOpen}
            onOpenChange={actions.setAddDialogOpen}
            editingId={null}
            onSaved={() => {
              actions.notify("success", AR.createdSuccess);
              actions.load();
            }}
            organizationId={state.orgId}
          />
          <ConnectionFormDialog
            open={state.editDialogOpen}
            onOpenChange={(v) => {
              actions.setEditDialogOpen(v);
              if (!v) actions.setEditingId(null);
            }}
            editingId={state.editingId}
            onSaved={() => {
              actions.notify("success", AR.updatedSuccess);
              actions.load();
            }}
            organizationId={state.orgId}
          />
          {state.historyConnectionId ? (
            <SyncHistoryDialog
              open={state.historyDialogOpen}
              onOpenChange={(v) => {
                actions.setHistoryDialogOpen(v);
                if (!v) actions.setHistoryConnectionId(null);
              }}
              connectionId={state.historyConnectionId}
              organizationId={state.orgId}
            />
          ) : null}
          <DeleteConfirmDialog
            open={state.deleteDialogOpen}
            onOpenChange={(v) => {
              actions.setDeleteDialogOpen(v);
              if (!v) actions.setDeletingId(null);
            }}
            onConfirm={actions.handleDeleteConfirm}
            deleting={state.deleting}
          />
        </>
      ) : null}

      <div className="mt-8 border-t pt-6">
        <ApiKeyManager />
      </div>

      <div className="mt-6 flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
        <LinkedInConnectButton />
      </div>

      <div className="mt-8 border-t pt-6">
        <IntelConnectorsPanel />
      </div>
    </div>
  );
}
