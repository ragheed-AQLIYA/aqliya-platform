"use client";

import type { SalesInteractionView } from "@/lib/sales/interactions";
import { useDealInteractionPanel } from "./components/use-deal-interaction-panel";
import { DealInteractionFilterBar } from "./components/deal-interaction-filter-bar";
import { DealInteractionListItem } from "./components/deal-interaction-list-item";
import { DealInteractionCreateForm } from "./components/deal-interaction-create-form";

export function DealInteractionPanel({
  dealId,
  accountId,
  interactions,
}: {
  dealId: string;
  accountId: string;
  interactions: SalesInteractionView[];
}) {
  const {
    loading,
    error,
    typeFilter,
    setTypeFilter,
    editingId,
    setEditingId,
    deletingId,
    filteredInteractions,
    handleSubmit,
    handleDelete,
    handleEditSaved,
    handleEditError,
  } = useDealInteractionPanel(dealId, accountId, interactions);

  return (
    <div className="space-y-4">
      <DealInteractionFilterBar value={typeFilter} onChange={setTypeFilter} />

      {filteredInteractions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {interactions.length === 0
            ? "لا تفاعلات مسجّلة لهذه الصفقة بعد."
            : "لا تفاعلات مطابقة للتصفية."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredInteractions.map((item) => (
            <DealInteractionListItem
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              isDeleting={deletingId === item.id}
              onEdit={() => setEditingId(item.id)}
              onCancelEdit={() => setEditingId(null)}
              onSavedEdit={handleEditSaved}
              onErrorEdit={handleEditError}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </ul>
      )}

      <DealInteractionCreateForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
