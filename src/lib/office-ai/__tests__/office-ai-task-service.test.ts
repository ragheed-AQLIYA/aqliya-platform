// ─── Office AI Task Service Tests ───

import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// Stateful mock store for OfficeAiTask, OfficeAiFile, OfficeAiOutput
const taskStore: Array<Record<string, unknown>> = [];
const fileStore: Array<Record<string, unknown>> = [];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    officeAiTask: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = {
          id: `task-${taskStore.length + 1}`,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
          outputs: [],
          sourceFiles: [],
          ...data,
        };
        taskStore.push(record);
        return record;
      }),
      findUnique: jest.fn(async ({ where, include }: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
        const task = taskStore.find((t) => t.id === (where as { id: string }).id);
        if (!task) return null;
        if (include) {
          return {
            ...task,
            outputs: include.outputs ? fileStore.filter((f) => f.taskId === task.id) : [],
            sourceFiles: include.sourceFiles ? fileStore.filter((f) => f.taskId === task.id) : [],
          };
        }
        return task;
      }),
      findMany: jest.fn(async ({ where, take, orderBy }: { where: Record<string, unknown>; take?: number; orderBy?: Record<string, unknown> }) => {
        let results = [...taskStore];
        if (where.projectId) results = results.filter((t) => t.projectId === where.projectId);
        if (where.clientWorkspaceId) results = results.filter((t) => t.clientWorkspaceId === where.clientWorkspaceId);
        if (where.status) results = results.filter((t) => t.status === where.status);
        return results.slice(0, take ?? results.length);
      }),
    },
    officeAiFile: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: `file-${fileStore.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        fileStore.push(record);
        return record;
      }),
    },
  },
}));

// Mock audit logger
jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({
    record: jest.fn(),
  })),
  Product: { OFFICE_AI_ASSISTANT: "office-ai-assistant" },
}));

import {
  createOfficeAiTask,
  getOfficeAiTaskById,
  listOfficeAiTasksByProject,
  listOfficeAiTasksByWorkspace,
  addOfficeAiFile,
} from "../office-ai-task-service";

beforeEach(() => {
  taskStore.length = 0;
  fileStore.length = 0;
});

// ─── createOfficeAiTask ───

describe("createOfficeAiTask", () => {
  it("creates a task with valid input", async () => {
    const result = await createOfficeAiTask({
      platformOrganizationId: "org-1",
      taskType: "document_summary",
      language: "ar",
      title: "Test Summary",
      createdById: "user-1",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.taskType).toBe("document_summary");
    expect(result.data.language).toBe("ar");
    expect(result.data.status).toBe("draft");
  });

  it("rejects invalid task type", async () => {
    await expect(createOfficeAiTask({
      platformOrganizationId: "org-1",
      taskType: "invalid_type",
    })).rejects.toThrow("OfficeAiTask validation: taskType must be one of");
  });

  it("rejects missing platformOrganizationId", async () => {
    await expect(createOfficeAiTask({
      platformOrganizationId: "",
      taskType: "document_summary",
    })).rejects.toThrow("OfficeAiTask validation: platformOrganizationId is required");
  });

  it("rejects invalid language", async () => {
    await expect(createOfficeAiTask({
      platformOrganizationId: "org-1",
      taskType: "document_summary",
      language: "fr",
    })).rejects.toThrow("OfficeAiTask validation: language must be one of");
  });

  it("defaults language to ar when not specified", async () => {
    const result = await createOfficeAiTask({
      platformOrganizationId: "org-1",
      taskType: "report_draft",
    });
    expect(result.data.language).toBe("ar");
  });
});

// ─── getOfficeAiTaskById ───

describe("getOfficeAiTaskById", () => {
  it("returns task when found", async () => {
    await createOfficeAiTask({
      platformOrganizationId: "org-1",
      taskType: "executive_summary",
      title: "My Task",
    });

    const tasks = taskStore;
    const taskId = tasks[0].id as string;
    const result = await getOfficeAiTaskById(taskId);
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("My Task");
  });

  it("returns error when task not found", async () => {
    const result = await getOfficeAiTaskById("nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toBe("OfficeAiTask not found");
  });
});

// ─── listOfficeAiTasksByProject ───

describe("listOfficeAiTasksByProject", () => {
  it("returns tasks for a project", async () => {
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "document_summary", projectId: "proj-1" });
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "report_draft", projectId: "proj-1" });
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "meeting_notes", projectId: "proj-2" });

    const result = await listOfficeAiTasksByProject("proj-1");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("filters by status when provided", async () => {
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "document_summary", projectId: "proj-1" });

    // Manually set status for second task
    const task2 = await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "report_draft", projectId: "proj-1" });
    const taskStoreEntry = taskStore.find((t) => t.id === task2.data.id);
    if (taskStoreEntry) taskStoreEntry.status = "generated";

    const result = await listOfficeAiTasksByProject("proj-1", { status: "draft" });
    expect(result.data).toHaveLength(1);
  });
});

// ─── listOfficeAiTasksByWorkspace ───

describe("listOfficeAiTasksByWorkspace", () => {
  it("returns tasks for a workspace", async () => {
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "document_summary", clientWorkspaceId: "ws-1" });
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "report_draft", clientWorkspaceId: "ws-1" });
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "meeting_notes", clientWorkspaceId: "ws-2" });

    const result = await listOfficeAiTasksByWorkspace("ws-1");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });
});

// ─── addOfficeAiFile ───

describe("addOfficeAiFile", () => {
  it("adds a file to an existing task", async () => {
    await createOfficeAiTask({ platformOrganizationId: "org-1", taskType: "document_summary" });
    const taskId = taskStore[0].id as string;

    const result = await addOfficeAiFile(taskId, {
      filename: "report.pdf",
      fileType: "application/pdf",
      sizeBytes: 1024,
    });
    expect(result.success).toBe(true);
    expect(result.data.filename).toBe("report.pdf");
  });

  it("rejects file with empty filename", async () => {
    await expect(addOfficeAiFile("task-1", {
      filename: "",
      fileType: "pdf",
    })).rejects.toThrow("OfficeAiTask validation: filename is required");
  });
});
