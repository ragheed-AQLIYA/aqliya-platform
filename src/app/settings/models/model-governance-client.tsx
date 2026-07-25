"use client"

import { MessagesDisplay } from "./components/messages-display"
import { RegisterForm } from "./components/register-form"
import { ModelsTable } from "./components/models-table"
import { RegistryDisplay } from "./components/registry-display"
import { useModelGovernance } from "./components/use-model-governance"
import type { ModelItem, RegistryEntry } from "./components/use-model-governance"

export function ModelGovernanceClient({
  models: initialModels,
  registryEntries,
}: {
  models: ModelItem[]
  registryEntries: RegistryEntry[]
}) {
  const {
    models,
    showForm,
    error,
    success,
    form,
    setShowForm,
    setForm,
    handleRegister,
    handleSubmitForReview,
    handleApprove,
    handleReject,
    handleDeploy,
    handleDeprecate,
    setError,
    setSuccess,
  } = useModelGovernance(initialModels, registryEntries)

  return (
    <div className="space-y-6">
      <MessagesDisplay error={error} success={success} />
      <RegisterForm
        form={form}
        showForm={showForm}
        onFormChange={setForm}
        onRegister={handleRegister}
        onToggle={() => { setShowForm(!showForm); setError(""); setSuccess("") }}
      />
      <ModelsTable
        models={models}
        onSubmitForReview={handleSubmitForReview}
        onApprove={handleApprove}
        onReject={handleReject}
        onDeploy={handleDeploy}
        onDeprecate={handleDeprecate}
      />
      <RegistryDisplay entries={registryEntries} />
    </div>
  )
}
