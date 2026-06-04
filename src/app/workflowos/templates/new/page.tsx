import { requireUserContext } from "@/lib/auth";
import { createWorkflowTemplate } from "@/actions/workflowos-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewWorkflowTemplatePage() {
  await requireUserContext();

  async function handleSubmit(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const stepsRaw = formData.get("steps") as string;

    let steps: unknown[];
    try {
      steps = stepsRaw ? JSON.parse(stepsRaw) : [];
    } catch {
      steps = [];
    }

    const result = await createWorkflowTemplate({ name, description, category, steps });
    if (result.success && result.data) {
      redirect(`/workflowos/templates/${result.data.id}`);
    }
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">إنشاء قالب جديد</h1>
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل القالب</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">التصنيف</Label>
              <select
                id="category"
                name="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="general">عام</option>
                <option value="approval">موافقة</option>
                <option value="review">مراجعة</option>
                <option value="inspection">تدقيق</option>
                <option value="custom">مخصص</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="steps">الخطوات (JSON)</Label>
              <Textarea
                id="steps"
                name="steps"
                rows={6}
                placeholder='[{"name":"الخطوة الأولى","assignee":"reviewer"},{"name":"الخطوة الثانية","assignee":"approver"}]'
              />
              <p className="text-xs text-muted-foreground">
                أدخل مصفوفة JSON تحتوي على تعريفات الخطوات
              </p>
            </div>
            <Button type="submit">إنشاء القالب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
