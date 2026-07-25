"use client";

import { useSsoSettings } from "./components/use-sso-settings";
import { SsoLoading } from "./components/sso-loading";
import { SsoErrorState } from "./components/sso-error-state";
import { SsoHeader } from "./components/sso-header";
import { SsoErrorBanner } from "./components/sso-error-banner";
import { SsoEmptyState } from "./components/sso-empty-state";
import { SsoProviderCard } from "./components/sso-provider-card";
import { SsoFormDialog } from "./components/sso-form-dialog";

export default function SsoSettingsPage() {
  const {
    providers, loading, error, dialogOpen, editingId, formData,
    saving, formError, testStatus, toggling, deleting, deleteConfirm,
    loadProviders, openAddDialog, openEditDialog,
    handleSave, handleDelete, handleToggle, handleTest,
    setDialogOpen, setError, setDeleteConfirm, updateFormField,
  } = useSsoSettings();

  if (loading) return <SsoLoading />;

  if (error && providers.length === 0) {
    return <SsoErrorState error={error} onRetry={loadProviders} />;
  }

  return (
    <div className="space-y-8" dir="rtl">
      <SsoHeader onAdd={openAddDialog} />

      {error && providers.length > 0 && (
        <SsoErrorBanner error={error} onDismiss={() => setError("")} />
      )}

      {providers.length === 0 ? (
        <SsoEmptyState onAdd={openAddDialog} />
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <SsoProviderCard
              key={provider.id}
              provider={provider}
              testStatus={testStatus}
              togglingId={toggling}
              deletingId={deleting}
              deleteConfirmId={deleteConfirm}
              onEdit={openEditDialog}
              onTest={handleTest}
              onToggle={handleToggle}
              onDeleteConfirm={setDeleteConfirm}
              onDeleteCancel={() => setDeleteConfirm(null)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <SsoFormDialog
        open={dialogOpen}
        editingId={editingId}
        formData={formData}
        saving={saving}
        formError={formError}
        onOpenChange={setDialogOpen}
        onFieldChange={updateFormField}
        onSave={handleSave}
      />
    </div>
  );
}
