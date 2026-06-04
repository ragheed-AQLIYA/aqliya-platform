import { requireUserContext } from "@/lib/auth";
import { getWorkflowTemplate, startWorkflowFromTemplate } from "@/actions/workflowos-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkflowTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUserContext();

  const result = await getWorkflowTemplate(id);
  if (!result.success || !result.data) {
    notFound();
  }

  const template = result.data;
  const steps = (template.steps as unknown[] | null) ?? [];

  async function handleStart() {
    "use server";
    const user = await requireUserContext();
    const recordResult = await startWorkflowFromTemplate(
      id,
      `سجل: ${template.name} - ${new Date().toLocaleDateString("ar-SA")}`,
    );
    if (recordResult.success && recordResult.data) {
      redirect(`/workflowos/records/${recordResult.data.id}`);
    }
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <Badge variant="outline" className="mt-1">{template.category}</Badge>
        </div>
        <form action={handleStart}>
          <Button type="submit">بدء سير عمل جديد</Button>
        </form>
      </div>

      {template.description && (
        <p className="text-muted-foreground mb-6">{template.description}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">عدد الخطوات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{steps.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">السجلات المنشأة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{template._count.records}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الخطوات</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <p className="text-muted-foreground">لا توجد خطوات محددة</p>
          ) : (
            <ol className="space-y-3">
              {steps.map((step: unknown, index: number) => {
                const s = step as { name?: string; assignee?: string };
                return (
                  <li key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{s.name ?? `خطوة ${index + 1}`}</p>
                      {s.assignee && (
                        <p className="text-sm text-muted-foreground">المسؤول: {s.assignee}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
