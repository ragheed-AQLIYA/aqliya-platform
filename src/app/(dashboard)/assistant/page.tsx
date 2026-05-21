import type { OfficeAiTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOfficeAiTaskAction } from "@/actions/office-ai-actions";
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
  FileText,
  BarChart3,
  FileEdit,
  Presentation,
  ListTodo,
  MessageSquare,
  Search,
  Archive,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const TASK_TYPE_INFO: Record<
  string,
  { en: string; ar: string; icon: React.ReactNode }
> = {
  document_summary: {
    en: "Summarize PDFs, Word docs, or reports into key points.",
    ar: "تلخيص ملفات PDF أو Word أو التقارير في نقاط رئيسية.",
    icon: <FileText className="h-5 w-5" />,
  },
  excel_analysis: {
    en: "Analyze Excel sheets for trends, totals, and insights.",
    ar: "تحليل جداول Excel للاتجاهات والمجاميع والرؤى.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  report_draft: {
    en: "Draft structured reports from instructions and files.",
    ar: "صياغة تقارير منظمة من التعليمات والملفات.",
    icon: <FileEdit className="h-5 w-5" />,
  },
  presentation_outline: {
    en: "Generate slide-by-slide presentation outlines.",
    ar: "توليد هياكل عرض تقديمي شريحة بشريحة.",
    icon: <Presentation className="h-5 w-5" />,
  },
  executive_summary: {
    en: "Synthesize multiple inputs into an executive summary.",
    ar: "تجميع مدخلات متعددة في ملخص تنفيذي.",
    icon: <ListTodo className="h-5 w-5" />,
  },
  meeting_notes: {
    en: "Structure meeting notes into topics, decisions, and actions.",
    ar: "تنظيم ملاحظات الاجتماع إلى موضوعات وقرارات وإجراءات.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
};

const WORKFLOW_STEPS = [
  { ar: "اختر العميل والمشروع", en: "Choose client & project" },
  { ar: "أنشئ المهمة", en: "Create task" },
  { ar: "أرفق الملفات", en: "Attach files" },
  { ar: "ولّد المسودة", en: "Generate draft" },
  { ar: "راجع واعتمد", en: "Review & approve" },
];

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> =
  {
    draft: {
      ar: "مسودة",
      en: "Draft",
      color: "bg-muted text-muted-foreground",
    },
    generated: {
      ar: "تم التوليد",
      en: "Generated",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    },
    needs_review: {
      ar: "بانتظار المراجعة",
      en: "Needs Review",
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    },
    reviewed: {
      ar: "تمت المراجعة",
      en: "Reviewed",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    },
    approved: {
      ar: "معتمد",
      en: "Approved",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    },
    rejected: {
      ar: "مرفوض",
      en: "Rejected",
      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    },
    archived: {
      ar: "مؤرشف",
      en: "Archived",
      color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    },
  };

export default async function AssistantPage(props: {
  searchParams?: Promise<{
    status?: string;
    search?: string;
    workspaceId?: string;
    projectId?: string;
    taskType?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  const platformOrgId = user.platformOrganizationId;

  const activeStatus = searchParams?.status || "";
  const searchQuery = searchParams?.search || "";
  const workspaceFilter = searchParams?.workspaceId || "";
  const projectFilter = searchParams?.projectId || "";
  const taskTypeFilter = searchParams?.taskType || "";

  let workspaces: { id: string; name: string }[] = [];
  let projects: { id: string; name: string; workspaceId: string }[] = [];
  let recentTasks: (OfficeAiTask & {
    _count?: { outputs: number; sourceFiles: number };
  })[] = [];
  let taskCounts: { status: string; _count: number }[] = [];
  let recentActivity: {
    id: string;
    title: string | null;
    taskType: string;
    status: string;
    createdAt: Date;
  }[] = [];

  if (platformOrgId) {
    workspaces = await prisma.clientWorkspace.findMany({
      where: { platformOrganizationId: platformOrgId, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    projects = await prisma.project.findMany({
      where: { status: "active" },
      select: { id: true, name: true, workspaceId: true },
      orderBy: { name: "asc" },
      take: 50,
    });

    // Build filter
    const where: Record<string, unknown> = { createdById: user.id };
    if (activeStatus) where.status = activeStatus;
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { instructions: { contains: searchQuery, mode: "insensitive" } },
      ];
    }
    if (workspaceFilter) where.clientWorkspaceId = workspaceFilter;
    if (projectFilter) where.projectId = projectFilter;
    if (taskTypeFilter) where.taskType = taskTypeFilter;

    recentTasks = await prisma.officeAiTask.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: { select: { outputs: true, sourceFiles: true } },
      },
    });

    // Status counts
    const counts = await prisma.officeAiTask.groupBy({
      by: ["status"],
      where: { createdById: user.id },
      _count: true,
    });
    taskCounts = counts.map((c) => ({ status: c.status, _count: c._count }));

    // Recent activity (last 5 updated tasks)
    recentActivity = await prisma.officeAiTask.findMany({
      where: { createdById: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        taskType: true,
        status: true,
        createdAt: true,
      },
    });
  }

  const totalTasks = taskCounts.reduce((sum, c) => sum + c._count, 0);
  const getCount = (status: string) =>
    taskCounts.find((c) => c.status === status)?._count || 0;

  return (
    <main className="p-8 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Office AI Assistant</h1>
        <span className="text-lg text-muted-foreground">
          / مساعد العمل الذكي
        </span>
      </div>

      {/* Governance notice */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Governed work assistant — not a chatbot. All outputs are draft until
          human-reviewed. Source files must be referenced before final use. No
          autonomous decisions.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        <Link
          href="/assistant"
          className={`p-2 rounded-md border text-center transition-colors ${!activeStatus ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
        >
          <div className="text-lg font-bold">{totalTasks}</div>
          <div className="text-[9px] text-muted-foreground">All</div>
        </Link>
        {[
          "draft",
          "generated",
          "needs_review",
          "approved",
          "rejected",
          "archived",
        ].map((s) => {
          const label = STATUS_LABELS[s];
          const count = getCount(s);
          return (
            <Link
              key={s}
              href={`/assistant?status=${s}`}
              className={`p-2 rounded-md border text-center transition-colors ${activeStatus === s ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
            >
              <div className="text-lg font-bold">{count}</div>
              <div className="text-[9px] text-muted-foreground truncate">
                {label?.en || s}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create + Filters */}
        <div className="space-y-6 lg:col-span-2">
          {/* Create card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">New Task / مهمة جديدة</CardTitle>
              <CardDescription>
                Create a new AI-assisted office task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createOfficeAiTaskAction} className="space-y-4">
                <div>
                  <Label htmlFor="taskType">Task Type / نوع المهمة</Label>
                  <select
                    id="taskType"
                    name="taskType"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select...</option>
                    <option value="document_summary">
                      Document Summary / تلخيص
                    </option>
                    <option value="excel_analysis">
                      Excel Analysis / تحليل
                    </option>
                    <option value="report_draft">Report Draft / تقرير</option>
                    <option value="presentation_outline">
                      Presentation Outline / عرض
                    </option>
                    <option value="executive_summary">
                      Executive Summary / تنفيذي
                    </option>
                    <option value="meeting_notes">
                      Meeting Notes / اجتماع
                    </option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Language / اللغة</Label>
                  <select
                    id="language"
                    name="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="ar">Arabic / العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="clientWorkspaceId">
                    Workspace / مساحة العمل
                  </Label>
                  <select
                    id="clientWorkspaceId"
                    name="clientWorkspaceId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">None / بدون</option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="projectId">Project / المشروع</Label>
                  <select
                    id="projectId"
                    name="projectId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">None / بدون</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Title / العنوان</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Summarize Q3 report"
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions / التعليمات</Label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    placeholder="Context, key points, or instructions for the AI..."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Task / إنشاء مهمة
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Task type info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(TASK_TYPE_INFO).map(([key, info]) => (
              <div
                key={key}
                className="p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-primary">{info.icon}</span>
                  <span className="text-xs font-medium">
                    {key.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{info.ar}</p>
                <p className="text-[10px] text-muted-foreground">{info.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Filters + Task list */}
        <div className="space-y-4">
          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((a) => (
                    <Link
                      key={a.id}
                      href={`/assistant/${a.id}`}
                      className="block text-xs hover:bg-muted/50 p-1.5 rounded"
                    >
                      <span className="font-medium truncate">
                        {a.title || a.taskType}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StatusBadge status={a.status} />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString("en-SA")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <form method="GET" action="/assistant" className="space-y-3">
                <Input
                  name="search"
                  placeholder="Search tasks..."
                  defaultValue={searchQuery}
                  className="text-xs h-8"
                />
                <select
                  name="workspaceId"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">All Workspaces</option>
                  {workspaces.map((ws) => (
                    <option
                      key={ws.id}
                      value={ws.id}
                      selected={workspaceFilter === ws.id}
                    >
                      {ws.name}
                    </option>
                  ))}
                </select>
                <select
                  name="projectId"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      selected={projectFilter === p.id}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  name="taskType"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">All Types</option>
                  <option
                    value="document_summary"
                    selected={taskTypeFilter === "document_summary"}
                  >
                    Document Summary
                  </option>
                  <option
                    value="excel_analysis"
                    selected={taskTypeFilter === "excel_analysis"}
                  >
                    Excel Analysis
                  </option>
                  <option
                    value="report_draft"
                    selected={taskTypeFilter === "report_draft"}
                  >
                    Report Draft
                  </option>
                  <option
                    value="presentation_outline"
                    selected={taskTypeFilter === "presentation_outline"}
                  >
                    Presentation Outline
                  </option>
                  <option
                    value="executive_summary"
                    selected={taskTypeFilter === "executive_summary"}
                  >
                    Executive Summary
                  </option>
                  <option
                    value="meeting_notes"
                    selected={taskTypeFilter === "meeting_notes"}
                  >
                    Meeting Notes
                  </option>
                </select>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 text-xs h-8"
                  >
                    Apply
                  </Button>
                  <Link
                    href="/assistant"
                    className="text-xs text-muted-foreground hover:text-foreground self-center"
                  >
                    Clear
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Task list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Tasks ({recentTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No tasks found.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/assistant/${task.id}`}
                      className="block p-2.5 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {task.title || task.taskType}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{task.taskType}</span>
                        <span>
                          {task.language === "ar" ? "Arabic" : "English"}
                        </span>
                        {task._count && (
                          <span>{task._count.sourceFiles} files</span>
                        )}
                        <span>
                          {new Date(task.createdAt).toLocaleDateString("en-SA")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow steps */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">
            كيفية الاستخدام / How to use:
          </p>
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-xs"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {i + 1}
                </span>
                <span>{step.ar}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{step.en}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
    archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status] || ""}`}
    >
      {STATUS_LABELS[status]?.en || status}
    </span>
  );
}
