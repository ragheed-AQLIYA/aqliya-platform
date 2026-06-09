"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createDecision } from "@/actions/decisions"
import { getAvailableTemplates, createDecisionFromTemplate } from "@/actions/decision-templates"
import type { DecisionTemplate } from "@/lib/decision/decision-templates"

const DECISION_TYPES = [
  { value: "TENDER", label: "منافسة" },
  { value: "INVESTMENT", label: "استثمار" },
  { value: "EXPANSION", label: "توسعة" },
  { value: "PROCUREMENT", label: "مشتريات" },
  { value: "HIRING", label: "توظيف" },
  { value: "PARTNERSHIP", label: "شراكة" },
  { value: "PRICING", label: "تسعير" },
  { value: "STRATEGIC", label: "استراتيجي" },
  { value: "OPERATIONS", label: "عمليات" },
  { value: "CUSTOM", label: "مخصّص" },
]

export default function NewDecisionPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    type: "TENDER",
    description: "",
    priority: "MEDIUM",
    targetDate: "",
  })
  const [mode, setMode] = useState<"manual" | "template">("manual")
  const [templates, setTemplates] = useState<DecisionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (mode === "template") {
      setLoadingTemplates(true)
      getAvailableTemplates().then((result) => {
        if (result.success && result.data) {
          setTemplates(result.data)
        }
        setLoadingTemplates(false)
      })
    }
  }, [mode])

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  function handleTemplateSelect(template: DecisionTemplate) {
    setSelectedTemplate(template)
    setFormData((prev) => ({
      ...prev,
      type: template.type,
      priority: template.priority,
      title: prev.title || template.titlePattern,
      description: prev.description || template.descriptionPrompt,
    }))
    setShowPreview(true)
  }

  async function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!formData.title.trim()) {
      setError("عنوان القرار مطلوب")
      setSubmitting(false)
      return
    }

    const result = await createDecision({
      title: formData.title,
      type: formData.type,
      description: formData.description,
      priority: formData.priority,
      targetDate: formData.targetDate || undefined,
    })

    if (result.success && result.data) {
      router.push(`/decisions/${result.data.id}`)
      router.refresh()
    } else {
      setError(result.error || "فشل في إنشاء القرار")
      setSubmitting(false)
    }
  }

  async function handleTemplateSubmit() {
    if (!selectedTemplate) return
    setSubmitting(true)
    setError(null)

    if (!formData.title.trim()) {
      setError("عنوان القرار مطلوب")
      setSubmitting(false)
      return
    }

    const result = await createDecisionFromTemplate({
      templateId: selectedTemplate.id,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      targetDate: formData.targetDate || undefined,
    })

    if (result.success && result.data) {
      router.push(`/decisions/${result.data.decision.id}`)
      router.refresh()
    } else {
      setError(result.error || "فشل في إنشاء القرار من القالب")
      setSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">إنشاء قرار جديد</h1>
      <p className="text-sm text-muted-foreground mb-6">ابدأ من الصفر أو استخدم قالباً جاهزاً بأهداف ومقترحات وإرشادات.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => { setMode("manual"); setShowPreview(false); setSelectedTemplate(null) }}
        >
          ابدأ من الصفر
        </Button>
        <Button
          variant={mode === "template" ? "default" : "outline"}
          onClick={() => setMode("template")}
        >
          ابدأ من قالب
        </Button>
      </div>

      {mode === "template" && !showPreview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {loadingTemplates ? (
            <p className="text-muted-foreground">جارٍ تحميل القوالب...</p>
          ) : (
            templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{template.label}</h3>
                  <Badge variant={template.priority === "HIGH" || template.priority === "CRITICAL" ? "destructive" : "secondary"}>
                    {template.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="text-xs text-muted-foreground">
                  <p>{template.suggestedObjectives.length} هدفاً مقترحاً</p>
                  <p>{template.scenarioSuggestions.length} سيناريو</p>
                  <p>{template.commonRisks.length} خطراً شائعاً</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showPreview && selectedTemplate && (
        <Card className="p-4 mb-6 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">قالب {selectedTemplate.label}</h3>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setShowPreview(false); setSelectedTemplate(null) }}>
              تغيير القالب
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
                <h4 className="font-medium mb-1">الأهداف المقترحة</h4>
              <ul className="list-disc pl-4 text-muted-foreground">
                {selectedTemplate.suggestedObjectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
                <h4 className="font-medium mb-1">السيناريوهات المقترحة</h4>
              <ul className="list-disc pl-4 text-muted-foreground">
                {selectedTemplate.scenarioSuggestions.map((s, i) => (
                  <li key={i}><strong>{s.name}:</strong> {s.description}</li>
                ))}
              </ul>
            </div>
            <div>
                <h4 className="font-medium mb-1">المخاطر الشائعة</h4>
              <ul className="list-disc pl-4 text-muted-foreground">
                {selectedTemplate.commonRisks.slice(0, 3).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {selectedTemplate.commonRisks.length > 3 && (
                  <li className="text-muted-foreground">+{selectedTemplate.commonRisks.length - 3} more</li>
                )}
              </ul>
            </div>
            <div>
                <h4 className="font-medium mb-1">الخطوة التالية الموصى بها</h4>
              <p className="text-muted-foreground">{selectedTemplate.recommendedNextStep}</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={mode === "template" ? (e) => { e.preventDefault(); handleTemplateSubmit() } : handleManualSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">عنوان القرار *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={selectedTemplate ? selectedTemplate.titlePattern : "أدخل عنوان القرار"}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">نوع القرار</Label>
          <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECISION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={selectedTemplate ? selectedTemplate.descriptionPrompt : "وصف مختصر لسياق القرار"}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">الأولوية</Label>
            <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">منخفضة</SelectItem>
                <SelectItem value="MEDIUM">متوسطة</SelectItem>
                <SelectItem value="HIGH">عالية</SelectItem>
                <SelectItem value="CRITICAL">حرجة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetDate">التاريخ المستهدف</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleChange("targetDate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "جارٍ الإنشاء..." : mode === "template" ? "إنشاء من قالب" : "إنشاء قرار"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            إلغاء
          </Button>
        </div>
      </form>
    </main>
  )
}
