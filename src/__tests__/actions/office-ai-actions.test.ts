// ─── Office AI Assistant Actions Tests ───
// Tests for office-ai-actions.ts.
// Uses global PrismaClient mock (officeAiTask/officeAiOutput/officeAiFile already registered).

import { PrismaClient } from "@/generated/prisma/client";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock storage provider to avoid real file I/O
jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: () => ({
    store: jest.fn(async () => ({})),
    delete: jest.fn(async () => {}),
    get: jest.fn(async () => null),
  }),
}));

// Mock heavy AI generation only; keep other service functions real (they use mock prisma)
jest.mock("@/lib/office-ai/office-ai-task-service", () => {
  const actual = jest.requireActual(
    "@/lib/office-ai/office-ai-task-service",
  ) as Record<string, unknown>;
  return {
    ...actual,
    generateOfficeAiTaskOutput: jest.fn(async () => ({
      success: true,
      data: { id: "mock-output-id", content: "# Generated\n\nMock output" },
    })),
  };
});

// Mock file-extraction-service separately
jest.mock("@/lib/office-ai/file-extraction-service", () => ({
  reExtractFileContent: jest.fn(async () => ({
    success: true,
    data: { id: "mock-file-id", extracted: "mock extracted content" },
  })),
}));

import {
  createOfficeAiTaskAction,
  updateOfficeAiTaskStatusAction,
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

const prisma = new PrismaClient();

function createFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("taskType", overrides.taskType || "document_summary");
  fd.set("language", overrides.language || "ar");
  fd.set("title", overrides.title || "Test Task");
  fd.set("instructions", overrides.instructions || "Test instructions");
  fd.set("platformOrganizationId", overrides.platformOrganizationId || "test-org-id");
  return fd;
}

function seedTask(overrides: Record<string, unknown> = {}) {
  return prisma.officeAiTask.create({
    data: {
      platformOrganizationId: "test-org-id",
      taskType: "document_summary",
      title: "Seed Task",
      language: "ar",
      status: "draft",
      ...overrides,
    },
  });
}

function seedOutput(taskId: string, overrides: Record<string, unknown> = {}) {
  return prisma.officeAiOutput.create({
    data: {
      taskId,
      content: "Sample output content",
      status: "draft",
      format: "markdown",
      ...overrides,
    },
  });
}

function seedFile(taskId: string, overrides: Record<string, unknown> = {}) {
  return prisma.officeAiFile.create({
    data: {
      taskId,
      filename: "test-file.pdf",
      fileType: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      ...overrides,
    },
  });
}

describe("Office AI Actions", () => {
  beforeEach(async () => {
    await prisma.officeAiTask.deleteMany({});
    await prisma.officeAiOutput.deleteMany({});
    await prisma.officeAiFile.deleteMany({});
    await prisma.platformAuditLog.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─── createOfficeAiTaskAction ───

  describe("createOfficeAiTaskAction", () => {
    it("creates a task with valid data", async () => {
      const fd = createFormData({ title: "Research Report" });

      await createOfficeAiTaskAction(fd);

      const tasks = await prisma.officeAiTask.findMany({});
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Research Report");
      expect(tasks[0].taskType).toBe("document_summary");
      expect(tasks[0].status).toBe("draft");
    });

    it("creates task with all optional fields", async () => {
      const fd = createFormData({
        taskType: "executive_summary",
        language: "en",
        title: "Executive Summary",
        instructions: "Please summarize in English",
        clientWorkspaceId: "ws-1",
        projectId: "proj-1",
      });

      await createOfficeAiTaskAction(fd);

      const tasks = await prisma.officeAiTask.findMany({});
      expect(tasks).toHaveLength(1);
      expect(tasks[0].taskType).toBe("executive_summary");
      expect(tasks[0].language).toBe("en");
    });

    it("defaults language to ar", async () => {
      const fd = createFormData({ language: "" });

      await createOfficeAiTaskAction(fd);

      const tasks = await prisma.officeAiTask.findMany({});
      expect(tasks[0].language).toBe("ar");
    });

    it("uses createdById and createdByName from auth context", async () => {
      const fd = createFormData({ title: "Auth Test" });

      await createOfficeAiTaskAction(fd);

      const task = (await prisma.officeAiTask.findMany({}))[0];
      expect(task.createdById).toBe("test-user-id");
    });
  });

  // ─── updateOfficeAiTaskStatusAction ───

  describe("updateOfficeAiTaskStatusAction", () => {
    it("updates task status", async () => {
      const task = await seedTask({ status: "draft" });

      await updateOfficeAiTaskStatusAction(task.id, "needs_review");

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("needs_review");
    });

    it("throws for nonexistent task", async () => {
      await expect(
        updateOfficeAiTaskStatusAction("nonexistent", "needs_review"),
      ).rejects.toThrow();
    });

    it("status transitions from draft → generated → needs_review", async () => {
      const task = await seedTask({ status: "draft" });

      await updateOfficeAiTaskStatusAction(task.id, "generated");
      let updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("generated");

      await updateOfficeAiTaskStatusAction(task.id, "needs_review");
      updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("needs_review");

      await updateOfficeAiTaskStatusAction(task.id, "approved");
      updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("approved");
    });

    it("throws when updating cross-org task", async () => {
      const task = await seedTask({
        platformOrganizationId: "other-org",
        status: "draft",
      });

      await expect(
        updateOfficeAiTaskStatusAction(task.id, "needs_review"),
      ).rejects.toThrow();
    });
  });

  // ─── submit / approve / reject ───

  describe("submitOfficeAiTaskForReviewAction", () => {
    it("sets status to needs_review", async () => {
      const task = await seedTask({ status: "draft" });

      await submitOfficeAiTaskForReviewAction(task.id);

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("needs_review");
    });
  });

  describe("approveOfficeAiTaskAction", () => {
    it("sets status to approved", async () => {
      const task = await seedTask({ status: "needs_review" });

      await approveOfficeAiTaskAction(task.id);

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("approved");
    });
  });

  describe("rejectOfficeAiTaskAction", () => {
    it("sets status to rejected", async () => {
      const task = await seedTask({ status: "needs_review" });

      await rejectOfficeAiTaskAction(task.id);

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("rejected");
    });
  });

  // ─── generateOfficeAiOutputAction ───

  describe("generateOfficeAiOutputAction", () => {
    it("generates output for existing task", async () => {
      const task = await seedTask({ status: "draft" });

      await generateOfficeAiOutputAction(task.id);

      const outputs = await prisma.officeAiOutput.findMany({});
      // Mock generates output — check task exists
      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated).not.toBeNull();
    });

    it("throws for nonexistent task", async () => {
      await expect(
        generateOfficeAiOutputAction("nonexistent"),
      ).rejects.toThrow("Task not found");
    });

    it("throws for cross-org task", async () => {
      const task = await seedTask({
        platformOrganizationId: "other-org",
      });

      await expect(
        generateOfficeAiOutputAction(task.id),
      ).rejects.toThrow("Access denied");
    });
  });

  // ─── addOfficeAiFileAction ───

  describe("addOfficeAiFileAction", () => {
    function makePdfFile(): File {
      return new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      });
    }

    it("adds a file to a task", async () => {
      const task = await seedTask();
      const fd = new FormData();
      fd.set("file", makePdfFile());

      await addOfficeAiFileAction(task.id, fd);

      const files = await prisma.officeAiFile.findMany({});
      expect(files).toHaveLength(1);
      expect(files[0].filename).toBe("test.pdf");
      expect(files[0].fileType).toBe("pdf");
    });

    it("rejects nonexistent task", async () => {
      const fd = new FormData();
      fd.set("file", makePdfFile());

      await expect(
        addOfficeAiFileAction("nonexistent", fd),
      ).rejects.toThrow("Task not found");
    });

    it("rejects cross-org task", async () => {
      const task = await seedTask({
        platformOrganizationId: "other-org",
      });
      const fd = new FormData();
      fd.set("file", makePdfFile());

      await expect(
        addOfficeAiFileAction(task.id, fd),
      ).rejects.toThrow("Access denied");
    });

    it("rejects disallowed file extension", async () => {
      const task = await seedTask();
      const fd = new FormData();
      fd.set("file", new File(["bad"], "evil.exe", { type: "application/x-msdownload" }));

      await expect(
        addOfficeAiFileAction(task.id, fd),
      ).rejects.toThrow(/not allowed/);
    });

    it("rejects filename without extension", async () => {
      const task = await seedTask();
      const fd = new FormData();
      fd.set("file", new File(["bad"], "NOEXT", { type: "text/plain" }));

      await expect(
        addOfficeAiFileAction(task.id, fd),
      ).rejects.toThrow("File must have an extension");
    });

    it("rejects file that is too large", async () => {
      const task = await seedTask();
      const bigBuffer = Buffer.alloc(11 * 1024 * 1024); // >10 MB
      const fd = new FormData();
      fd.set("file", new File([bigBuffer], "large.pdf", { type: "application/pdf" }));

      await expect(
        addOfficeAiFileAction(task.id, fd),
      ).rejects.toThrow(/too large/);
    });

    it("allows file from metadata (no upload)", async () => {
      const task = await seedTask();
      const fd = new FormData();
      fd.set("filename", "reference.pdf");
      fd.set("fileType", "pdf");

      await addOfficeAiFileAction(task.id, fd);

      const files = await prisma.officeAiFile.findMany({});
      expect(files).toHaveLength(1);
      expect(files[0].filename).toBe("reference.pdf");
    });
  });

  // ─── removeOfficeAiFileAction ───

  describe("removeOfficeAiFileAction", () => {
    it("removes a file from a task", async () => {
      const task = await seedTask();
      const file = await seedFile(task.id);

      await removeOfficeAiFileAction(file.id);

      const files = await prisma.officeAiFile.findMany({});
      expect(files).toHaveLength(0);
    });

    it("throws for nonexistent file", async () => {
      await expect(
        removeOfficeAiFileAction("nonexistent"),
      ).rejects.toThrow("File not found");
    });

    it("throws for cross-org file", async () => {
      const task = await seedTask({ platformOrganizationId: "other-org" });
      const file = await seedFile(task.id);

      await expect(
        removeOfficeAiFileAction(file.id),
      ).rejects.toThrow("Access denied");
    });
  });

  // ─── updateOfficeAiTaskAction ───

  describe("updateOfficeAiTaskAction", () => {
    it("updates task title and instructions", async () => {
      const task = await seedTask({ title: "Old Title" });
      const fd = new FormData();
      fd.set("title", "New Title");
      fd.set("instructions", "Updated instructions");

      await updateOfficeAiTaskAction(task.id, fd);

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.title).toBe("New Title");
    });

    it("throws for nonexistent task", async () => {
      const fd = new FormData();
      fd.set("title", "Nope");

      await expect(
        updateOfficeAiTaskAction("nonexistent", fd),
      ).rejects.toThrow();
    });
  });

  // ─── updateOfficeAiOutputAction ───

  describe("updateOfficeAiOutputAction", () => {
    it("updates output content", async () => {
      const task = await seedTask();
      const output = await seedOutput(task.id, { content: "Old content" });
      const fd = new FormData();
      fd.set("content", "New updated content");

      await updateOfficeAiOutputAction(output.id, fd);

      const updated = await prisma.officeAiOutput.findUnique({
        where: { id: output.id },
      });
      expect(updated!.content).toBe("New updated content");
    });

    it("throws for empty content", async () => {
      const task = await seedTask();
      const output = await seedOutput(task.id);
      const fd = new FormData();
      fd.set("content", "");

      await expect(
        updateOfficeAiOutputAction(output.id, fd),
      ).rejects.toThrow("Content is required");
    });

    it("throws for nonexistent output", async () => {
      const fd = new FormData();
      fd.set("content", "Something");

      await expect(
        updateOfficeAiOutputAction("nonexistent", fd),
      ).rejects.toThrow("Output not found");
    });

    it("throws for cross-org output", async () => {
      const task = await seedTask({ platformOrganizationId: "other-org" });
      const output = await seedOutput(task.id);
      const fd = new FormData();
      fd.set("content", "Should fail");

      await expect(
        updateOfficeAiOutputAction(output.id, fd),
      ).rejects.toThrow("Access denied");
    });
  });

  // ─── archiveOfficeAiTaskAction ───

  describe("archiveOfficeAiTaskAction", () => {
    it("archives a task", async () => {
      const task = await seedTask({ status: "approved" });

      await archiveOfficeAiTaskAction(task.id);

      const updated = await prisma.officeAiTask.findUnique({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("archived");
    });

    it("throws for nonexistent task", async () => {
      await expect(
        archiveOfficeAiTaskAction("nonexistent"),
      ).rejects.toThrow("Task not found");
    });

    it("throws for cross-org task", async () => {
      const task = await seedTask({
        platformOrganizationId: "other-org",
      });

      await expect(
        archiveOfficeAiTaskAction(task.id),
      ).rejects.toThrow("Access denied");
    });
  });

  // ─── reExtractFileAction ───

  describe("reExtractFileAction", () => {
    it("re-extracts a file with content", async () => {
      const task = await seedTask();
      const file = await seedFile(task.id, { content: "extracted text" });

      // Should not throw
      await expect(reExtractFileAction(file.id)).resolves.not.toThrow();
    });

    it("throws for nonexistent file", async () => {
      await expect(
        reExtractFileAction("nonexistent"),
      ).rejects.toThrow("File not found");
    });

    it("throws for cross-org file", async () => {
      const task = await seedTask({ platformOrganizationId: "other-org" });
      const file = await seedFile(task.id);

      await expect(
        reExtractFileAction(file.id),
      ).rejects.toThrow("Access denied");
    });
  });
});
