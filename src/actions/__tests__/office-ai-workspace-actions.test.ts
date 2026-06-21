// ─── Office AI Workspace Actions Tests ───

import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// Mock task store
const taskStore: Array<Record<string, unknown>> = [];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    officeAiTask: {
      findMany: jest.fn(
        async ({
          where,
          include,
          orderBy,
          take,
        }: {
          where?: Record<string, unknown>;
          include?: Record<string, unknown>;
          orderBy?: Record<string, unknown>;
          take?: number;
        }) => {
          let results = [...taskStore];
          if (where?.platformOrganizationId) {
            results = results.filter(
              (t) =>
                t.platformOrganizationId === where.platformOrganizationId,
            );
          }
          if (where?.status) {
            results = results.filter((t) => t.status === where.status);
          }
          results.sort(
            (a, b) =>
              new Date(
                (b.createdAt as Date) || new Date(),
              ).getTime() -
              new Date(
                (a.createdAt as Date) || new Date(),
              ).getTime(),
          );
          if (take) results = results.slice(0, take);

          return results.map((task) => ({
            ...task,
            outputs: include?.outputs
              ? []
              : undefined,
            sourceFiles: include?.sourceFiles
              ? []
              : undefined,
          }));
        },
      ),
      findUnique: jest.fn(
        async ({
          where,
          include,
        }: {
          where: Record<string, unknown>;
          include?: Record<string, unknown>;
        }) => {
          const task = taskStore.find(
            (t) => t.id === (where as { id: string }).id,
          );
          if (!task) return null;
          return {
            ...task,
            outputs:
              include?.outputs
                ? []
                : undefined,
            sourceFiles:
              include?.sourceFiles
                ? []
                : undefined,
          };
        },
      ),
      count: jest.fn(
        async ({
          where,
        }: {
          where?: Record<string, unknown>;
        }) => {
          let results = [...taskStore];
          if (where?.platformOrganizationId) {
            results = results.filter(
              (t) =>
                t.platformOrganizationId === where.platformOrganizationId,
            );
          }
          return results.length;
        },
      ),
    },
    platformAuditLog: {
      findMany: jest.fn(async () => []),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(() =>
    Promise.resolve({
      id: "user-1",
      email: "test@aqliya.com",
      name: "Test User",
      role: "VIEWER",
      organizationId: "org-1",
      platformOrganizationId: "org-1",
      organization: { id: "org-1", name: "Test Org" },
    }),
  ),
}));

import {
  listOfficeAiWorkspaceTasks,
  getTaskDetail,
  getTaskAuditTrail,
} from "../office-ai-workspace-actions";

beforeEach(() => {
  taskStore.length = 0;
});

// ─── listOfficeAiWorkspaceTasks ───

describe("listOfficeAiWorkspaceTasks", () => {
  it("returns empty list when no tasks exist", async () => {
    const result = await listOfficeAiWorkspaceTasks();
    expect(result.tasks).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it("returns tasks for the current org", async () => {
    taskStore.push(
      {
        id: "task-1",
        platformOrganizationId: "org-1",
        taskType: "document_summary",
        title: "Test Summary",
        status: "draft",
        language: "ar",
        instructions: null,
        createdByName: "User",
        createdById: "user-1",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
      {
        id: "task-2",
        platformOrganizationId: "org-1",
        taskType: "report_draft",
        title: "Test Report",
        status: "generated",
        language: "ar",
        instructions: null,
        createdByName: "User",
        createdById: "user-1",
        createdAt: new Date("2026-01-02"),
        updatedAt: new Date("2026-01-02"),
      },
    );

    const result = await listOfficeAiWorkspaceTasks();
    expect(result.tasks).toHaveLength(2);
    expect(result.totalCount).toBe(2);
  });

  it("filters tasks by org and ignores other orgs", async () => {
    taskStore.push(
      {
        id: "task-1",
        platformOrganizationId: "org-1",
        taskType: "document_summary",
        title: "Org1 Task",
        status: "draft",
        language: "ar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "task-2",
        platformOrganizationId: "org-2",
        taskType: "report_draft",
        title: "Org2 Task",
        status: "draft",
        language: "ar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const result = await listOfficeAiWorkspaceTasks();
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toBe("task-1");
  });

  it("returns tasks ordered by newest first", async () => {
    taskStore.push(
      {
        id: "task-1",
        platformOrganizationId: "org-1",
        taskType: "document_summary",
        title: "Old",
        status: "draft",
        language: "ar",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
      {
        id: "task-2",
        platformOrganizationId: "org-1",
        taskType: "report_draft",
        title: "New",
        status: "draft",
        language: "ar",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-15"),
      },
    );

    const result = await listOfficeAiWorkspaceTasks();
    expect(result.tasks[0].title).toBe("New");
    expect(result.tasks[1].title).toBe("Old");
  });
});

// ─── getTaskDetail ───

describe("getTaskDetail", () => {
  it("returns null when task not found", async () => {
    const result = await getTaskDetail("nonexistent");
    expect(result).toBeNull();
  });

  it("returns task detail for existing task", async () => {
    taskStore.push({
      id: "task-1",
      platformOrganizationId: "org-1",
      taskType: "executive_summary",
      title: "Exec Summary",
      status: "generated",
      language: "ar",
      instructions: "Summarize the document",
      createdByName: "User",
      createdById: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getTaskDetail("task-1");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("task-1");
    expect(result?.title).toBe("Exec Summary");
    expect(result?.taskType).toBe("executive_summary");
  });

  it("returns null when task belongs to different org", async () => {
    taskStore.push({
      id: "task-1",
      platformOrganizationId: "org-2",
      taskType: "document_summary",
      title: "Other Org Task",
      status: "draft",
      language: "ar",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getTaskDetail("task-1");
    expect(result).toBeNull();
  });
});

// ─── getTaskAuditTrail ───

describe("getTaskAuditTrail", () => {
  it("returns empty array when no audit events", async () => {
    const result = await getTaskAuditTrail("task-1");
    expect(result).toHaveLength(0);
  });
});
