import { requireUserContext } from "@/lib/auth";
import {
  workflow_getRecordById,
  updateWorkflowRecordStatus,
} from "@/actions/workflowos-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function WorkflowRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUserContext();

  const result = await workflow_getRecordById(id);
  if (!result.success || !result.data) {
    notFound();
  }

  const record = result.data;
  const steps = (record.steps as unknown[] | null) ?? [];
  const stepResults = (record.stepResults as Record<string, unknown> | null) ?? {};
  const currentStep = record.currentStep;

  async function handleAdvance() {
    "use server";
    const nextStep = currentStep + 1;
    const status = nextStep >= steps.length ? "completed" : "in_progress";
    await updateWorkflowRecordStatus(id, status);
    redirect(`/workflowos/records/${id}`);
  }

  async function handleComplete() {
    "use server";
    await updateWorkflowRecordStatus(id, "completed");
    redirect(`/workflowos/records/${id}`);
  }

  async function handleReject() {
    "use server";
    await updateWorkflowRecordStatus(id, "rejected");
    redirect(`/workflowos/records/${id}`);
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{record.title}</h1>
          <div className="flex gap-2 mt-1">
            <Badge className={STATUS_COLORS[record.status] ?? ""}>
              {STATUS_LABELS[record.status] ?? record.status}
            </Badge>
            {record.template && (
              <Badge variant="outline">{record.template.name}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">التقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentStep}/{steps.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">الأولوية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{record.priority}</p>
          </CardContent>
        </Card>
        {record.assignedToId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">مسند إلى</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium truncate">{record.assignedToId}</p>
            </CardContent>
          </Card>
        )}
        {record.dueDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">تاريخ الاستحقاق</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {new Date(record.dueDate).toLocaleDateString("ar-SA")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الخطوات</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <p className="text-muted-foreground">لا توجد خطوات</p>
          ) : (
            <ol className="space-y-3">
              {steps.map((step: unknown, index: number) => {
                const s = step as { name?: string; assignee?: string };
                const stepKey = `step_${index}`;
                const stepResult = stepResults[stepKey] as
                  | { status?: string; notes?: string; updatedAt?: string }
                  | undefined;
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;

                return (
                  <li
                    key={index}
                    className={`flex items-start gap-3 p-3 border rounded-lg ${
                      isCurrent ? "border-primary bg-primary/5" : ""
                    } ${isComplete ? "border-green-300 bg-green-50" : ""}`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isComplete ? "✓" : index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {s.name ?? `خطوة ${index + 1}`}
                      </p>
                      {s.assignee && (
                        <p className="text-sm text-muted-foreground">
                          المسؤول: {s.assignee}
                        </p>
                      )}
                      {stepResult && (
                        <div className="mt-2 text-sm bg-white p-2 rounded border">
                          {stepResult.status && (
                            <p>الحالة: {stepResult.status}</p>
                          )}
                          {stepResult.notes && (
                            <p>ملاحظات: {stepResult.notes}</p>
                          )}
                          {stepResult.updatedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              آخر تحديث:{" "}
                              {new Date(stepResult.updatedAt).toLocaleString("ar-SA")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {isComplete && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        مكتملة
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="flex-shrink-0">الحالية</Badge>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      {record.status !== "completed" && record.status !== "rejected" && record.status !== "cancelled" && (
        <div className="flex gap-3 justify-end">
          {currentStep < steps.length - 1 && (
            <form action={handleAdvance}>
              <Button type="submit">تقدم إلى الخطوة التالية</Button>
            </form>
          )}
          {currentStep >= steps.length - 1 && (
            <form action={handleComplete}>
              <Button type="submit">إكمال سير العمل</Button>
            </form>
          )}
          <form action={handleReject}>
            <Button type="submit" variant="destructive">
              رفض
            </Button>
          </form>
        </div>
      )}

      {record.metadata && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">بيانات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
              {JSON.stringify(record.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
