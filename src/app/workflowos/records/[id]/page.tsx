import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  workflow_getRecordById,
  updateWorkflowRecordStatus,
} from "@/actions/workflowos-actions";
import {
  requestWorkflowExport,
  approveWorkflowExport,
  rejectWorkflowExport,
  downloadWorkflowExport,
} from "@/actions/workflowos-export-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { notFound, redirect } from "next/navigation";
import {
  FileText,
  History,
  Upload,
  Shield,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

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

  // ─── Export Actions ───

  async function handleRequestExport() {
    "use server";
    await requestWorkflowExport(id);
    redirect(`/workflowos/records/${id}`);
  }

  async function handleApproveExport() {
    "use server";
    await approveWorkflowExport(id);
    redirect(`/workflowos/records/${id}`);
  }

  async function handleRejectExport(formData: FormData) {
    "use server";
    const reason = formData.get("reason") as string;
    await rejectWorkflowExport(id, reason);
    redirect(`/workflowos/records/${id}`);
  }

  async function handleDownloadExportAction() {
    "use server";
    const result = await downloadWorkflowExport(id);
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error ?? "Download failed");
  }

  async function uploadEvidenceAction(formData: FormData) {
    "use server";
    const { uploadWorkflowEvidence } = await import("@/actions/workflowos-actions");
    const filename = formData.get("filename") as string;
    const fileType = formData.get("fileType") as string;
    const description = formData.get("description") as string;
    const stepIndexStr = formData.get("stepIndex") as string;

    await uploadWorkflowEvidence({
      recordId: id,
      filename,
      fileType,
      description: description || undefined,
      stepIndex: stepIndexStr ? parseInt(stepIndexStr) : undefined,
    });
    redirect(`/workflowos/records/${id}`);
  }

  const evidence = await prisma.workflowEvidence.findMany({
    where: { organizationId: record.organizationId, recordId: id },
    orderBy: { createdAt: "desc" },
  });

  const auditEvents = await prisma.workflowAuditEvent.findMany({
    where: { organizationId: record.organizationId, recordId: id },
    orderBy: { createdAt: "desc" },
  });

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

      {/* Export Section */}
      {record.status === "completed" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              تصدير السجل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">حالة التصدير:</span>
              {record.exportStatus === "none" && (
                <Badge variant="outline">لم يُطلب بعد</Badge>
              )}
              {record.exportStatus === "requested" && (
                <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  قيد المراجعة
                </Badge>
              )}
              {record.exportStatus === "approved" && (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  معتمد
                </Badge>
              )}
              {record.exportStatus === "rejected" && (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  مرفوض
                </Badge>
              )}
              {record.escalatedAt && (
                <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  تم التصعيد
                </Badge>
              )}
            </div>

            {record.exportRejectedReason && record.exportStatus === "rejected" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">سبب الرفض</p>
                <p className="text-sm text-red-600 mt-1">
                  {record.exportRejectedReason}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {record.exportStatus === "none" && (
                <form action={handleRequestExport}>
                  <Button type="submit" size="sm" variant="outline">
                    <Download className="ml-1 h-4 w-4" />
                    طلب تصدير
                  </Button>
                </form>
              )}

              {record.exportStatus === "requested" && (
                <>
                  <form action={handleApproveExport}>
                    <Button type="submit" size="sm">
                      <CheckCircle2 className="ml-1 h-4 w-4" />
                      اعتماد التصدير
                    </Button>
                  </form>
                  <form action={handleRejectExport} className="flex gap-2">
                    <Input
                      name="reason"
                      placeholder="سبب الرفض"
                      className="w-48 h-9 text-sm"
                      required
                    />
                    <Button type="submit" size="sm" variant="destructive">
                      <XCircle className="ml-1 h-4 w-4" />
                      رفض
                    </Button>
                  </form>
                </>
              )}

              {record.exportStatus === "approved" && (
                <a
                  href={`/api/workflowos/records/${id}/download`}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  تنزيل التصدير
                </a>
              )}

              {(record.exportStatus === "rejected") && (
                <form action={handleRequestExport}>
                  <Button type="submit" size="sm" variant="outline">
                    <Download className="ml-1 h-4 w-4" />
                    إعادة طلب
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
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

      {/* Evidence Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            الأدلة والملفات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="border rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
              رفع دليل جديد
            </summary>
            <form action={uploadEvidenceAction} className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium">اسم الملف</label>
                <Input name="filename" required placeholder="اسم الملف" />
              </div>
              <div>
                <label className="text-sm font-medium">نوع الملف</label>
                <Input name="fileType" required placeholder="pdf, docx, xlsx..." />
              </div>
              <div>
                <label className="text-sm font-medium">رقم الخطوة (اختياري)</label>
                <Input name="stepIndex" type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">وصف</label>
                <Textarea name="description" placeholder="وصف الملف" />
              </div>
              <Button type="submit" size="sm">
                <Upload className="ml-1 h-4 w-4" />
                رفع
              </Button>
            </form>
          </details>

          {evidence.length === 0 ? (
            <p className="text-muted-foreground text-sm">لا توجد أدلة مرفوعة</p>
          ) : (
            <div className="space-y-2">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{e.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.fileType}
                        {e.stepIndex !== null && ` • خطوة ${e.stepIndex}`}
                        {e.sizeBytes && ` • ${(e.sizeBytes / 1024).toFixed(1)} KB`}
                      </p>
                      {e.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(e.createdAt).toLocaleDateString("ar-SA")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل التدقيق
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">لا توجد أحداث مسجلة</p>
          ) : (
            <div className="space-y-2">
              {auditEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 border-b last:border-b-0 text-sm"
                >
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.action}
                      </Badge>
                      {event.actorName && (
                        <span className="text-muted-foreground">
                          {event.actorName}
                        </span>
                      )}
                    </div>
                    {event.fromStatus && event.toStatus && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.fromStatus} → {event.toStatus}
                      </p>
                    )}
                    {event.comment && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.comment}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleString("ar-SA")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
