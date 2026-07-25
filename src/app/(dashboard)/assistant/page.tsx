import { getCurrentUser } from "@/lib/auth";
import { getUserTaskList } from "@/actions/office-ai-workspace-actions";
import { AssistantHeader } from "./components/header";
import { StatusStats } from "./components/status-stats";
import { CreateTaskForm } from "./components/create-task-form";
import { TaskTypeInfo } from "./components/task-type-info";
import { RecentActivity } from "./components/recent-activity";
import { FiltersPanel } from "./components/filters-panel";
import { TaskList } from "./components/task-list";
import { WorkflowSteps } from "./components/workflow-steps";

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

  const activeStatus = searchParams?.status || "";
  const searchQuery = searchParams?.search || "";
  const workspaceFilter = searchParams?.workspaceId || "";
  const projectFilter = searchParams?.projectId || "";
  const taskTypeFilter = searchParams?.taskType || "";

  const data = await getUserTaskList(user.id, {
    status: activeStatus || undefined,
    search: searchQuery || undefined,
    workspaceId: workspaceFilter || undefined,
    projectId: projectFilter || undefined,
    taskType: taskTypeFilter || undefined,
  });

  const { workspaces, projects, tasks: recentTasks, taskCounts, recentActivity } = data;
  const totalTasks = taskCounts.reduce((sum: number, c: { status: string; _count: number }) => sum + c._count, 0);
  const getCount = (status: string) =>
    taskCounts.find((c: { status: string; _count: number }) => c.status === status)?._count || 0;

  return (
    <main className="p-8 max-w-6xl mx-auto" dir="rtl">
      <AssistantHeader />
      <StatusStats totalTasks={totalTasks} activeStatus={activeStatus} getCount={getCount} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <CreateTaskForm workspaces={workspaces} projects={projects} />
          <TaskTypeInfo />
        </div>
        <div className="space-y-4">
          <RecentActivity recentActivity={recentActivity} />
          <FiltersPanel
            workspaces={workspaces}
            projects={projects}
            searchQuery={searchQuery}
            workspaceFilter={workspaceFilter}
            projectFilter={projectFilter}
            taskTypeFilter={taskTypeFilter}
          />
          <TaskList recentTasks={recentTasks} />
        </div>
      </div>
      <WorkflowSteps />
    </main>
  );
}
