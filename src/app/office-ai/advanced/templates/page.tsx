"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LayoutList,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  GripVertical,
  Layers,
} from "lucide-react"
import type { OfficeAiWorkflowTemplate, WorkflowTemplateStep } from "@/lib/platform/office-ai-adv"
import { getAdvTemplates, createAdvTemplateAction, type ActionState } from "../actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const EMPTY_STEP: WorkflowTemplateStep = {
  stepOrder: 0,
  title: "",
  description: "",
  taskType: "general",
  defaultPriority: "medium",
  assignedRoleSlug: "",
  estimatedHours: 1,
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "critical", label: "حرجة" },
]

const TASK_TYPE_OPTIONS = [
  { value: "general", label: "عام" },
  { value: "review", label: "مراجعة" },
  { value: "analysis", label: "تحليل" },
  { value: "extraction", label: "استخراج" },
  { value: "generation", label: "توليد" },
  { value: "classification", label: "تصنيف" },
  { value: "summarization", label: "تلخيص" },
]

type FormStep = WorkflowTemplateStep

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<OfficeAiWorkflowTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form fields
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formSteps, setFormSteps] = useState<FormStep[]>([{ ...EMPTY_STEP }])
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getAdvTemplates()
      setTemplates(data)
    } catch {
      setError("فشل في تحميل القوالب")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  function addStep() {
    setFormSteps((prev) => [
      ...prev,
      { ...EMPTY_STEP, stepOrder: prev.length },
    ])
  }

  function removeStep(index: number) {
    setFormSteps((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((s, i) => ({ ...s, stepOrder: i }))
    })
  }

  function updateStep(index: number, field: keyof FormStep, value: string | number) {
    setFormSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    )
  }

  async function handleCreate(formData: FormData) {
    setFormError(null)
    if (!formName.trim()) {
      setFormError("اسم القالب مطلوب")
      return
    }
    if (formSteps.length === 0) {
      setFormError("يجب إضافة خطوة واحدة على الأقل")
      return
    }
    for (const step of formSteps) {
      if (!step.title.trim()) {
        setFormError("عنوان الخطوة مطلوب")
        return
      }
    }

    setFormSubmitting(true)
    formData.set("name", formName)
    formData.set("description", formDescription)
    formData.set("steps", JSON.stringify(formSteps))

    const result = await createAdvTemplateAction(
      { status: "idle" },
      formData,
    )
    setFormSubmitting(false)

    if (result.status === "success") {
      setShowForm(false)
      setFormName("")
      setFormDescription("")
      setFormSteps([{ ...EMPTY_STEP }])
      await fetchTemplates()
    } else if (result.status === "error") {
      setFormError(result.error)
    }
  }

  if (loading) {
    return (
      <main className="p-8 max-w-5xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/office-ai/advanced">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <LayoutList className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">قوالب سير العمل</h1>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 ml-1" />
          {showForm ? "إلغاء" : "قالب جديد"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">إنشاء قالب سير عمل جديد</CardTitle>
            <CardDescription>
              أضف خطوات سير العمل المتسلسلة مع الأدوار والأولويات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم القالب</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: مراجعة تقرير مالي"
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="وصف القالب"
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>خطوات سير العمل</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة خطوة
                  </Button>
                </div>
                {formSteps.map((step, index) => (
                  <div
                    key={index}
                    className="rounded-md border p-4 space-y-3 relative"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">الخطوة {index + 1}</Badge>
                      {formSteps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mr-auto"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">العنوان</Label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(index, "title", e.target.value)}
                          placeholder="عنوان الخطوة"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">الوصف</Label>
                        <Input
                          value={step.description}
                          onChange={(e) => updateStep(index, "description", e.target.value)}
                          placeholder="وصف الخطوة"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">نوع المهمة</Label>
                        <Select
                          value={step.taskType}
                          onValueChange={(v) => updateStep(index, "taskType", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">الأولوية</Label>
                        <Select
                          value={step.defaultPriority}
                          onValueChange={(v) => updateStep(index, "defaultPriority", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">الدور</Label>
                        <Input
                          value={step.assignedRoleSlug}
                          onChange={(e) => updateStep(index, "assignedRoleSlug", e.target.value)}
                          placeholder="مثال: reviewer"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">الوقت المقدر (ساعات)</Label>
                        <Input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={step.estimatedHours}
                          onChange={(e) => updateStep(index, "estimatedHours", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? (
                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                ) : null}
                حفظ القالب
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">القوالب</CardTitle>
          <CardDescription>
            {templates.length} قالب سير عمل
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              لا توجد قوالب. أنشئ أول قالب بالضغط على "قالب جديد".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الخطوات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {t.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.steps.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? "default" : "outline"}>
                        {t.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
