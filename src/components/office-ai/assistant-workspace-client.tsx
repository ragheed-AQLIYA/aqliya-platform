"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Bot, FileText, Table, FileSpreadsheet, Presentation, ListChecks, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createOfficeAiTaskAction } from "@/actions/office-ai-actions";

const TASK_TYPE_OPTIONS = [
  { value: "document_summary", label: "تلخيص مستند", icon: FileText },
  { value: "excel_analysis", label: "تحليل جداول بيانات", icon: Table },
  { value: "report_draft", label: "مسودة تقرير", icon: FileSpreadsheet },
  { value: "presentation_outline", label: "هيكل عرض تقديمي", icon: Presentation },
  { value: "executive_summary", label: "ملخص تنفيذي", icon: ListChecks },
  { value: "meeting_notes", label: "محضر اجتماع", icon: ClipboardList },
];

interface AssistantWorkspaceClientProps {
  taskTypes: readonly string[];
}

export function AssistantWorkspaceClient({ taskTypes: _taskTypes }: AssistantWorkspaceClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      await createOfficeAiTaskAction(formData);
      setOpen(false);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء المهمة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 ml-1.5" />
            إنشاء مهمة جديدة
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              إنشاء مهمة جديدة
            </DialogTitle>
            <DialogDescription>
              اختر نوع المهمة وأدخل التفاصيل. الذكاء الاصطناعي يساعد — الإنسان يقرر.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">نوع المهمة</Label>
              <Select name="taskType" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المهمة..." />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4 text-muted-foreground" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                name="title"
                placeholder="أدخل عنوان المهمة..."
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">التعليمات</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="أدخل التعليمات أو الملاحظات..."
                className="min-h-[100px]"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">اللغة</Label>
              <Select name="language" defaultValue="ar">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 ml-1.5 animate-spin" />}
                {loading ? "جارٍ الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-1.5 mr-2">
        {TASK_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border hover:bg-muted/50 transition-colors"
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
