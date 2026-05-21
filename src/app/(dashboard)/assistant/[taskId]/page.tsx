import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  submitOfficeAiTaskForReviewAction,
  approveOfficeAiTaskAction,
  rejectOfficeAiTaskAction,
  generateOfficeAiOutputAction,
  addOfficeAiFileAction,
  removeOfficeAiFileAction,
  updateOfficeAiTaskAction,
  updateOfficeAiOutputAction,
  archiveOfficeAiTaskAction,
  reExtractFileAction,
} from "@/actions/office-ai-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Bot,
  Shield,
  AlertTriangle,
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  Upload,
  Circle,
  Edit3,
  Download,
  Printer,
  Copy,
  Archive,
  RefreshCw,
  Info,
} from "lucide-react";
import { OutputActions } from "@/components/office-ai/output-actions";

const STATUS_STEPS = ["draft", "generated", "needs_review", "approved"];
const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  draft: { ar: "مسودة", en: "Draft" },
  generated: { ar: "تم التوليد", en: "Generated" },
  needs_review: { ar: "بانتظار المراجعة", en: "Needs Review" },
  reviewed: { ar: "تمت المراجعة", en: "Reviewed" },
  approved: { ar: "معتمد", en: "Approved" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  archived: { ar: "مؤرشف", en: "Archived" },
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const user = await getCurrentUser();

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    include: { outputs: { orderBy: { createdAt: "desc" } }, sourceFiles: true },
  });

  if (!task) notFound();
  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  )
    notFound();

  let workspaceName: string | null = null;
  let projectName: string | null = null;
  if (task.clientWorkspaceId) {
    const ws = await prisma.clientWorkspace.findUnique({
      where: { id: task.clientWorkspaceId },
      select: { name: true },
    });
    workspaceName = ws?.name ?? null;
  }
  if (task.projectId) {
    const proj = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { name: true },
    });
    projectName = proj?.name ?? null;
  }

  const currentStepIndex = STATUS_STEPS.indexOf(task.status);
  const canGenerate =
    task.status === "draft" ||
    task.status === "generated" ||
    task.status === "rejected";
  const canReview =
    task.status === "generated" || task.status === "needs_review";
  const hasFiles = task.sourceFiles.length > 0;
  const isArchived = task.status === "archived";
  const isTerminal =
    task.status === "approved" ||
    task.status === "rejected" ||
    task.status === "archived";

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <Link
        href="/assistant"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assistant
      </Link>

      {/* Header + Edit */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{task.title || task.taskType}</h1>
          <Badge variant="outline" className="text-[10px]">
            {task.taskType}
          </Badge>
        </div>
        {!isArchived && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </summary>
            <form
              action={updateOfficeAiTaskAction.bind(null, task.id)}
              className="mt-3 p-3 rounded-md border bg-muted/30 space-y-3 w-80"
            >
              <div>
                <Label htmlFor="edit-title" className="text-[10px]">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={task.title || ""}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <Label htmlFor="edit-instructions" className="text-[10px]">
                  Instructions
                </Label>
                <textarea
                  id="edit-instructions"
                  name="instructions"
                  rows={2}
                  defaultValue={task.instructions || ""}
                  className="flex w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background"
                />
              </div>
              <div>
                <Label htmlFor="edit-language" className="text-[10px]">
                  Language
                </Label>
                <select
                  id="edit-language"
                  name="language"
                  defaultValue={task.language}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Button type="submit" size="sm" className="text-xs w-full">
                Save Changes
              </Button>
            </form>
          </details>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {task.language === "ar" ? "Arabic" : "English"}
        {task.createdByName && ` — by ${task.createdByName}`}
        {` — ${new Date(task.createdAt).toLocaleDateString("en-SA")}`}
        {workspaceName && ` — ${workspaceName}`}
        {projectName && ` / ${projectName}`}
        {isArchived && <span className="mr-2 text-gray-500">— Archived</span>}
      </p>

      {/* Status stepper */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-2">
            {STATUS_STEPS.map((step, i) => {
              const isActive = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div
                    className={`flex items-center gap-1.5 ${isDone ? "text-green-600" : isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[10px] hidden sm:inline">
                      {STATUS_LABELS[step]?.en || step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px ${isDone ? "bg-green-400" : "bg-muted"}`}
                    />
                  )}
                </div>
              );
            })}
            {task.status === "rejected" && (
              <>
                <div className="h-px flex-1 bg-red-400" />
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Rejected</span>
                </div>
              </>
            )}
            {task.status === "archived" && (
              <>
                <div className="h-px flex-1 bg-gray-400" />
                <div className="flex items-center gap-1 text-gray-500">
                  <Archive className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Archived</span>
                </div>
              </>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground text-center">
            {STATUS_LABELS[task.status]?.ar || task.status}
          </div>
        </CardContent>
      </Card>

      {/* Task info */}
      {task.instructions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Instructions / التعليمات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm p-3 rounded-md bg-muted whitespace-pre-wrap">
              {task.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Source Files */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Source Files / الملفات المصدر
          </CardTitle>
          <CardDescription>
            Attached files for content extraction and reference
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasFiles ? (
            <div className="space-y-2 mb-4">
              {task.sourceFiles.map((f) => (
                <div key={f.id} className="p-3 rounded-md border">
                  <div className="flex items-center gap-3 text-xs">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{f.filename}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {f.fileType}
                    </Badge>
                    {f.sizeBytes && (
                      <span className="text-muted-foreground">
                        {(f.sizeBytes / 1024).toFixed(0)}KB
                      </span>
                    )}
                    <span
                      className={`text-[10px] ${f.extractionStatus === "completed" ? "text-green-600" : f.extractionStatus === "failed" ? "text-red-500" : f.extractionStatus === "skipped" ? "text-yellow-500" : "text-muted-foreground"}`}
                    >
                      {f.extractionStatus === "completed"
                        ? "✅ Extracted"
                        : f.extractionStatus === "failed"
                          ? "⚠ Failed"
                          : f.extractionStatus === "skipped"
                            ? "⏭ Skipped"
                            : "🔲 Pending"}
                    </span>
                    {!isArchived && (
                      <form
                        action={removeOfficeAiFileAction.bind(null, f.id)}
                        className="mr-auto"
                      >
                        <button
                          type="submit"
                          className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Extraction details */}
                  {f.extractionStatus && (
                    <div className="mt-2 px-2 py-1.5 rounded bg-muted/30">
                      {f.extractionStatus === "completed" &&
                        f.extractedContent && (
                          <details className="text-[10px]">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Show extracted content preview (
                              {f.extractedContent.length} chars)
                            </summary>
                            <pre className="mt-1 p-2 rounded bg-background text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                              {f.extractedContent.slice(0, 2000)}
                              {f.extractedContent.length > 2000 ? "..." : ""}
                            </pre>
                          </details>
                        )}
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                        {f.extractedAt && (
                          <span>
                            Extracted:{" "}
                            {new Date(f.extractedAt).toLocaleString("en-SA")}
                          </span>
                        )}
                        {f.extractionStatus === "failed" &&
                          f.extractionMeta && (
                            <span>
                              Reason:{" "}
                              {String(
                                (f.extractionMeta as Record<string, unknown>)
                                  ?.error || "Unknown",
                              )}
                            </span>
                          )}
                        {f.extractionStatus === "skipped" && (
                          <span>Unsupported format for extraction</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Storage metadata (collapsed) */}
                  {(f.storageKey || f.fileHash) && (
                    <details className="mt-1 text-[9px] text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Technical metadata
                      </summary>
                      <div className="mt-1 p-1.5 rounded bg-background">
                        {f.storageKey && (
                          <div>
                            Storage key:{" "}
                            <code className="text-[8px]">{f.storageKey}</code>
                          </div>
                        )}
                        {f.fileHash && (
                          <div>
                            SHA-256:{" "}
                            <code className="text-[8px]">{f.fileHash}</code>
                          </div>
                        )}
                        {f.mimeType && <div>MIME: {f.mimeType}</div>}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-4">
              No files attached yet.
            </p>
          )}

          {!hasFiles && canGenerate && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                يمكن توليد مسودة بدون ملف، لكن الأفضل إرفاق مصدر أولًا.
                <br />A draft can be generated without files, but attaching a
                source first is recommended.
              </p>
            </div>
          )}

          {!isArchived && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                Attach a file / إرفاق ملف
              </summary>
              <p className="text-[10px] text-muted-foreground mb-2">
                Accepted: PDF, Word, Excel, CSV, TXT — Max 10 MB.
              </p>
              <form
                action={addOfficeAiFileAction.bind(null, task.id)}
                className="space-y-3 p-3 rounded-md border bg-muted/30"
              >
                <div>
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="filename">Filename</Label>
                    <Input
                      id="filename"
                      name="filename"
                      placeholder="report.pdf"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileType">Type</Label>
                    <select
                      id="fileType"
                      name="fileType"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Select...</option>
                      <option value="pdf">PDF</option>
                      <option value="docx">Word</option>
                      <option value="xlsx">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="txt">Text</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" /> Attach
                </Button>
              </form>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Outputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Output / المخرجات</CardTitle>
          <CardDescription>AI-generated content for this task</CardDescription>
        </CardHeader>
        <CardContent>
          {task.outputs.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No output yet. Generate a draft to begin.
              </p>
              {canGenerate && !isArchived && (
                <form action={generateOfficeAiOutputAction.bind(null, task.id)}>
                  <Button type="submit" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Generate Draft / توليد
                    مسودة
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {task.outputs.map((output) => (
                <div key={output.id} className="p-4 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {output.format}
                      </Badge>
                      <StatusBadge status={output.status} />
                      {output.status === "draft" &&
                        output.metadata &&
                        !!(output.metadata as Record<string, unknown>)
                          ?.editedAt && (
                          <Badge
                            variant="outline"
                            className="text-[9px] text-amber-600 border-amber-300"
                          >
                            Edited
                          </Badge>
                        )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {output.aiProvider} v{output.aiPromptVersion || "?"}
                    </span>
                  </div>

                  {/* Output content display + edit */}
                  <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap mb-2 font-mono leading-relaxed max-h-96 overflow-y-auto">
                    {output.content}
                  </div>

                  {/* Output actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {canGenerate && !isArchived && (
                      <form
                        action={generateOfficeAiOutputAction.bind(
                          null,
                          task.id,
                        )}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Regenerate
                        </Button>
                      </form>
                    )}

                    {!isArchived && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                          <Edit3 className="h-3.5 w-3.5" /> Edit output
                        </summary>
                        <form
                          action={updateOfficeAiOutputAction.bind(
                            null,
                            output.id,
                          )}
                          className="mt-2 space-y-2"
                        >
                          <textarea
                            name="content"
                            rows={8}
                            defaultValue={output.content}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background"
                          />
                          <Button type="submit" size="sm" className="text-xs">
                            Save Revised Output
                          </Button>
                        </form>
                      </details>
                    )}

                    <OutputActions
                      outputId={output.id}
                      content={output.content}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Actions */}
      {!isArchived && (
        <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" /> Review & Governance / المراجعة
              والحوكمة
            </CardTitle>
            <CardDescription>
              All outputs must be reviewed before final use
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canReview ? (
              <div className="flex flex-wrap gap-3">
                <form
                  action={submitOfficeAiTaskForReviewAction.bind(null, task.id)}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Submit for Review
                  </Button>
                </form>
                <form action={approveOfficeAiTaskAction.bind(null, task.id)}>
                  <Button type="submit" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Approve / اعتماد
                  </Button>
                </form>
                <form action={rejectOfficeAiTaskAction.bind(null, task.id)}>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject / رفض
                  </Button>
                </form>
              </div>
            ) : task.status === "approved" ? (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>Task approved. Output can be used as reference.</span>
              </div>
            ) : task.status === "rejected" ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                <XCircle className="h-5 w-5" />
                <span>Task rejected. Review feedback and regenerate.</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Review actions not available in current status.
              </p>
            )}

            {/* Archive action */}
            {task.status !== "archived" && task.status !== "approved" && (
              <div className="mt-3">
                <form action={archiveOfficeAiTaskAction.bind(null, task.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive Task
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-0.5">
                    Governance Notice / إشعار الحوكمة
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Outputs are DRAFT until reviewed and approved</li>
                    <li>Do not use as final output without human approval</li>
                    <li>All actions are logged to the platform audit trail</li>
                    <li>AI suggests — humans decide</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Re-extract files section */}
      {hasFiles && !isArchived && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5" /> File Extraction
            </CardTitle>
            <CardDescription>
              Re-extract file content if extraction failed or file was updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {task.sourceFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded border text-xs"
                >
                  <span>
                    {f.filename} —{" "}
                    <span
                      className={`${f.extractionStatus === "completed" ? "text-green-600" : f.extractionStatus === "failed" ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      {f.extractionStatus || "pending"}
                    </span>
                  </span>
                  <form action={reExtractFileAction.bind(null, f.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-[10px] flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Re-extract
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    generated: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    needs_review:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    reviewed:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    approved:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status] || ""}`}
    >
      {STATUS_LABELS[status]?.en || status}
    </span>
  );
}
