"use client"

import { useState } from "react"
import {
  registerModelAction,
  listModelsAction,
  submitModelForReviewAction,
  approveModelAction,
  rejectModelAction,
  deprecateModelAction,
  deployModelAction,
} from "@/actions/model-governance-actions"

export interface ModelItem {
  id: string
  name: string
  provider: string
  version: string
  modelType: string
  riskLevel: string
  status: string
  requiresReview: boolean
  requiresApproval: boolean
  createdAt: string
}

export interface RegistryEntry {
  id: string
  provider: string
  status: string
}

export interface FormState {
  name: string
  provider: string
  version: string
  modelType: string
  riskLevel: string
  requiresReview: boolean
  requiresApproval: boolean
  description: string
}

const INITIAL_FORM: FormState = {
  name: "",
  provider: "",
  version: "",
  modelType: "LLM",
  riskLevel: "LOW",
  requiresReview: false,
  requiresApproval: false,
  description: "",
}

export function useModelGovernance(
  initialModels: ModelItem[],
  _registryEntries: RegistryEntry[],
) {
  const [models, setModels] = useState<ModelItem[]>(initialModels)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  async function refreshModels() {
    const res = await listModelsAction()
    if (res.ok && res.data) {
      const d = res.data as { models: Record<string, unknown>[] }
      setModels(
        d.models.map((m) => ({
          id: m.id as string,
          name: m.name as string,
          provider: m.provider as string,
          version: m.version as string,
          modelType: m.modelType as string,
          riskLevel: m.riskLevel as string,
          status: m.status as string,
          requiresReview: m.requiresReview as boolean,
          requiresApproval: m.requiresApproval as boolean,
          createdAt: (m.createdAt as Date).toISOString(),
        })),
      )
    }
  }

  async function handleRegister() {
    setError("")
    setSuccess("")
    if (!form.name || !form.provider || !form.version) {
      setError("الاسم والمزود والإصدار مطلوبة")
      return
    }
    const res = await registerModelAction({
      name: form.name,
      provider: form.provider,
      version: form.version,
      modelType: form.modelType,
      riskLevel: form.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      requiresReview: form.requiresReview,
      requiresApproval: form.requiresApproval,
      description: form.description || undefined,
    })
    if (res.ok) {
      setSuccess("تم تسجيل النموذج بنجاح")
      setShowForm(false)
      setForm(INITIAL_FORM)
      await refreshModels()
    } else {
      setError(res.error ?? "فشل التسجيل")
    }
  }

  async function handleSubmitForReview(id: string) {
    const res = await submitModelForReviewAction(id)
    if (res.ok) {
      setSuccess("تم إرسال النموذج للمراجعة")
      await refreshModels()
    } else {
      setError(res.error ?? "فشل")
    }
  }

  async function handleApprove(id: string) {
    const res = await approveModelAction(id)
    if (res.ok) {
      setSuccess("تم اعتماد النموذج")
      await refreshModels()
    } else {
      setError(res.error ?? "فشل الاعتماد")
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("سبب الرفض:")
    if (!reason) return
    const res = await rejectModelAction(id, reason)
    if (res.ok) {
      setSuccess("تم رفض النموذج")
      await refreshModels()
    } else {
      setError(res.error ?? "فشل الرفض")
    }
  }

  async function handleDeploy(id: string) {
    const env = prompt("البيئة (staging/production):", "staging")
    if (!env) return
    const res = await deployModelAction(id, { environment: env })
    if (res.ok) {
      setSuccess("تم نشر النموذج")
      await refreshModels()
    } else {
      setError(res.error ?? "فشل النشر")
    }
  }

  async function handleDeprecate(id: string) {
    if (!confirm("تأكيد إيقاف النموذج؟")) return
    const res = await deprecateModelAction(id)
    if (res.ok) {
      setSuccess("تم إيقاف النموذج")
      await refreshModels()
    } else {
      setError(res.error ?? "فشل الإيقاف")
    }
  }

  return {
    models,
    showForm,
    error,
    success,
    form,
    setShowForm,
    setForm,
    refreshModels,
    handleRegister,
    handleSubmitForReview,
    handleApprove,
    handleReject,
    handleDeploy,
    handleDeprecate,
    setError,
    setSuccess,
  }
}
