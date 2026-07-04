"use client"

import { useState } from "react"
import { Plus, Check, X, Send, Upload, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  registerModelAction,
  listModelsAction,
  submitModelForReviewAction,
  approveModelAction,
  rejectModelAction,
  deprecateModelAction,
  deployModelAction,
} from "@/actions/model-governance-actions"

interface ModelItem {
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

interface RegistryEntry {
  id: string
  provider: string
  status: string
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  DEPRECATED: "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
}

const RISK_BADGE: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
}

export function ModelGovernanceClient({
  models: initialModels,
  registryEntries,
}: {
  models: ModelItem[]
  registryEntries: RegistryEntry[]
}) {
  const [models, setModels] = useState<ModelItem[]>(initialModels)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Registration form state
  const [form, setForm] = useState({
    name: "",
    provider: "",
    version: "",
    modelType: "LLM",
    riskLevel: "LOW",
    requiresReview: false,
    requiresApproval: false,
    description: "",
  })

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
      setForm({ name: "", provider: "", version: "", modelType: "LLM", riskLevel: "LOW", requiresReview: false, requiresApproval: false, description: "" })
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

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Register Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="ms-1 h-4 w-4" />
          {showForm ? "إلغاء" : "تسجيل نموذج جديد"}
        </Button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">تسجيل نموذج ذكاء اصطناعي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">الاسم *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Claude Opus 4"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المزود *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  placeholder="Anthropic"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الإصدار *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="2026-07-01"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">النوع</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.modelType}
                  onChange={(e) => setForm({ ...form, modelType: e.target.value })}
                >
                  <option value="LLM">LLM</option>
                  <option value="EMBEDDING">Embedding</option>
                  <option value="IMAGE">Image</option>
                  <option value="AUDIO">Audio</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">مستوى المخاطرة</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.riskLevel}
                  onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
                >
                  <option value="LOW">منخفض</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HIGH">عالٍ</option>
                  <option value="CRITICAL">حرج</option>
                </select>
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.requiresReview}
                    onChange={(e) => setForm({ ...form, requiresReview: e.target.checked })}
                  />
                  يتطلب مراجعة
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.requiresApproval}
                    onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
                  />
                  يتطلب اعتماد
                </label>
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium">الوصف</label>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                dir="auto"
              />
            </div>
            <Button className="mt-3" size="sm" onClick={handleRegister}>
              <Upload className="ms-1 h-4 w-4" />
              تسجيل
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registered Models Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">النماذج المسجلة في قاعدة البيانات</CardTitle>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              لا توجد نماذج مسجلة بعد. سجّل أول نموذج بالضغط على "تسجيل نموذج جديد".
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">الاسم</th>
                    <th className="pb-2 font-medium">المزود</th>
                    <th className="pb-2 font-medium">الإصدار</th>
                    <th className="pb-2 font-medium">النوع</th>
                    <th className="pb-2 font-medium">المخاطرة</th>
                    <th className="pb-2 font-medium">الحالة</th>
                    <th className="pb-2 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2">{m.name}</td>
                      <td className="py-2">{m.provider}</td>
                      <td className="py-2 font-mono text-xs">{m.version}</td>
                      <td className="py-2">{m.modelType}</td>
                      <td className="py-2">
                        <Badge className={RISK_BADGE[m.riskLevel] ?? ""}>{m.riskLevel}</Badge>
                      </td>
                      <td className="py-2">
                        <Badge className={STATUS_BADGE[m.status] ?? ""}>{STATUS_LABELS[m.status] ?? m.status}</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {m.status === "DRAFT" && (
                            <Button size="sm" variant="outline" onClick={() => handleSubmitForReview(m.id)} title="إرسال للمراجعة">
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          {m.status === "PENDING_REVIEW" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(m.id)} title="اعتماد">
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(m.id)} title="رفض">
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </>
                          )}
                          {m.status === "APPROVED" && (
                            <Button size="sm" variant="outline" onClick={() => handleDeploy(m.id)} title="نشر">
                              <Upload className="h-3 w-3" />
                            </Button>
                          )}
                          {(m.status === "APPROVED" || m.status === "DEPRECATED") && (
                            <Button size="sm" variant="outline" onClick={() => handleDeprecate(m.id)} title="إيقاف">
                              <StopCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File-Based Registry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">سجل النماذج (ملف)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            نماذج مسجلة في ملف model-registry.ts (قراءة فقط — تستخدم كمرجع للمزودين الافتراضيين)
          </p>
          <div className="flex flex-wrap gap-2">
            {registryEntries.map((e, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {e.provider}: {e.id} ({e.status})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "قيد المراجعة",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  DEPRECATED: "موقوف",
}
