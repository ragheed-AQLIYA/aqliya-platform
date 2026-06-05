"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createTemplate } from "@/actions/workflowos-template-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  type: "review" | "approval" | "evidence_upload" | "notification" | "escalation";
  assignee?: string;
  slaMinutes?: number;
  requiredFields?: string[];
}

const STEP_TYPES = [
  { value: "review", label: "مراجعة" },
  { value: "approval", label: "اعتماد" },
  { value: "evidence_upload", label: "رفع دليل" },
  { value: "notification", label: "إشعار" },
  { value: "escalation", label: "تصعيد" },
] as const;

function SortableStep({
  step,
  index,
  onUpdate,
  onRemove,
}: {
  step: WorkflowStep;
  index: number;
  onUpdate: (index: number, data: Partial<WorkflowStep>) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <Input
            value={step.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="اسم الخطوة"
            className="flex-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">النوع</Label>
            <select
              value={step.type}
              onChange={(e) =>
                onUpdate(index, { type: e.target.value as WorkflowStep["type"] })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {STEP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">المسؤول</Label>
            <Input
              value={step.assignee ?? ""}
              onChange={(e) => onUpdate(index, { assignee: e.target.value })}
              placeholder="المسؤول عن الخطوة"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">مهلة SLA (دقائق)</Label>
            <Input
              type="number"
              min={0}
              value={step.slaMinutes ?? ""}
              onChange={(e) =>
                onUpdate(index, {
                  slaMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="مدة الإنجاز المتوقعة"
            />
          </div>
          <div>
            <Label className="text-xs">الحقول المطلوبة</Label>
            <Input
              value={step.requiredFields?.join(", ") ?? ""}
              onChange={(e) =>
                onUpdate(index, {
                  requiredFields: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : [],
                })
              }
              placeholder="حقل1, حقل2"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-2 text-destructive hover:text-destructive/80"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NewWorkflowTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addStep = useCallback(() => {
    setSteps((prev) => [
      ...prev,
      {
        id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: "",
        type: "review",
      },
    ]);
  }, []);

  const updateStep = useCallback(
    (index: number, data: Partial<WorkflowStep>) => {
      setSteps((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...data } : s)),
      );
    },
    [],
  );

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  async function handleSave(status: string) {
    setSaving(true);
    setError(null);
    try {
      const result = await createTemplate({
        name,
        description,
        category,
        steps: steps.map(({ id, ...step }) => ({
          ...step,
          slaConfig: step.slaMinutes
            ? { timeLimitMinutes: step.slaMinutes, warnAtPercent: 80 }
            : undefined,
        })),
        status,
      });
      if (result.success && result.data) {
        router.push(`/workflowos/templates/${result.data.id}`);
      } else {
        setError(result.error ?? "فشل إنشاء القالب");
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إنشاء قالب سير عمل</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ كمسودة
          </Button>
          <Button
            onClick={() => handleSave("active")}
            disabled={saving || !name.trim() || steps.length === 0}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            نشر القالب
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تفاصيل القالب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم القالب"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف القالب والغرض منه"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">التصنيف</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="general">عام</option>
              <option value="approval">موافقة</option>
              <option value="review">مراجعة</option>
              <option value="inspection">تدقيق</option>
              <option value="custom">مخصص</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>خطوات سير العمل</CardTitle>
          <Button variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 ml-1" />
            إضافة خطوة
          </Button>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لم يتم إضافة خطوات بعد</p>
              <p className="text-sm mt-1">أضف خطوة لبدء بناء سير العمل</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      index={index}
                      onUpdate={updateStep}
                      onRemove={removeStep}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
