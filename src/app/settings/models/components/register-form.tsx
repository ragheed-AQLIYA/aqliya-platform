"use client"

import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FormState } from "./use-model-governance"

interface RegisterFormProps {
  form: FormState
  showForm: boolean
  onFormChange: (form: FormState) => void
  onRegister: () => void
  onToggle: () => void
}

export function RegisterForm({ form, showForm, onFormChange, onRegister, onToggle }: RegisterFormProps) {
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={onToggle} size="sm">
          <Plus className="ms-1 h-4 w-4" />
          {showForm ? "إلغاء" : "تسجيل نموذج جديد"}
        </Button>
      </div>

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
                  onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                  placeholder="Claude Opus 4"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المزود *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.provider}
                  onChange={(e) => onFormChange({ ...form, provider: e.target.value })}
                  placeholder="Anthropic"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الإصدار *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.version}
                  onChange={(e) => onFormChange({ ...form, version: e.target.value })}
                  placeholder="2026-07-01"
                  dir="auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">النوع</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.modelType}
                  onChange={(e) => onFormChange({ ...form, modelType: e.target.value })}
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
                  onChange={(e) => onFormChange({ ...form, riskLevel: e.target.value })}
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
                    onChange={(e) => onFormChange({ ...form, requiresReview: e.target.checked })}
                  />
                  يتطلب مراجعة
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.requiresApproval}
                    onChange={(e) => onFormChange({ ...form, requiresApproval: e.target.checked })}
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
                onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                rows={2}
                dir="auto"
              />
            </div>
            <Button className="mt-3" size="sm" onClick={onRegister}>
              <Upload className="ms-1 h-4 w-4" />
              تسجيل
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}
