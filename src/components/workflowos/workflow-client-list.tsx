"use client";

import { Loader2 } from "lucide-react";
import { useWorkflowClientList } from "./components/use-workflow-client-list";
import { WorkflowClientListHeader } from "./components/workflow-client-list-header";
import { WorkflowClientCreateForm } from "./components/workflow-client-create-form";
import { WorkflowClientCard } from "./components/workflow-client-card";

export function WorkflowClientList({
  onSelectClient,
  onChange,
}: {
  onSelectClient: (clientId: string) => void;
  onChange: () => void;
}) {
  const {
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
  } = useWorkflowClientList({ onChange });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WorkflowClientListHeader
        onCreateClick={() => setShowCreate(!showCreate)}
      />

      {showCreate && (
        <WorkflowClientCreateForm
          newName={newName}
          newSlug={newSlug}
          creating={creating}
          error={error}
          onNameChange={setNewName}
          onSlugChange={setNewSlug}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
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
            <WorkflowClientCard
              key={client.id}
              client={client}
              onSelectClient={onSelectClient}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
