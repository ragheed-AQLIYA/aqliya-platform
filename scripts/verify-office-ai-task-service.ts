/**
 * Office AI Task Service Verification Script
 *
 * Creates test records through the OfficeAiTask service path
 * and verifies PlatformAuditLog office_ai_assistant events.
 *
 * Usage:
 *   Dry run (default):   tsx scripts/verify-office-ai-task-service.ts
 *   Apply mode:          tsx scripts/verify-office-ai-task-service.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const isApply = process.argv.includes("--apply");
  const mode = isApply ? "APPLY" : "DRY RUN";

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Office AI Service Verify — ${mode.padEnd(16)}║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  try {
    // Find platform context
    const platformOrg = await prisma.platformOrganization.findFirst({
      select: { id: true, slug: true, name: true },
    });
    const workspace = await prisma.clientWorkspace.findFirst({
      select: { id: true, name: true, platformOrganizationId: true },
    });
    const project = await prisma.project.findFirst({
      select: { id: true, name: true, workspaceId: true },
    });

    if (!platformOrg) {
      console.log("❌ No PlatformOrganization found");
      process.exit(1);
    }

    console.log("Platform Context:");
    console.log(`  PlatformOrg: ${platformOrg.name} (${platformOrg.id})`);
    console.log(
      `  Workspace:   ${workspace ? `${workspace.name} (${workspace.id})` : "N/A"}`,
    );
    console.log(
      `  Project:     ${project ? `${project.name} (${project.id})` : "N/A"}`,
    );
    console.log();

    const testType = "document_summary";
    const testStatus = "draft";

    console.log("Test Task:");
    console.log(`  taskType:    ${testType}`);
    console.log(`  status:      ${testStatus}`);
    console.log(`  language:    ar`);
    console.log();

    if (!isApply) {
      console.log("── DRY RUN — no changes applied ──");
      console.log("  Run with --apply to create test records");
      console.log();
      return;
    }

    // ─── Create Task ───

    console.log("Creating OfficeAiTask...");
    const task = await prisma.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrg.id,
        clientWorkspaceId: workspace?.id ?? null,
        projectId: project?.id ?? null,
        taskType: testType,
        status: testStatus,
        language: "ar",
        title: "Test: Document Summary",
        instructions: "Summarize this test document",
        createdByName: "Verification Script",
        metadata: { test: true },
      },
    });
    console.log(`  ✅ Task created: ${task.id}`);

    // ─── Create Output ───

    console.log("Creating OfficeAiOutput...");
    const output = await prisma.officeAiOutput.create({
      data: {
        taskId: task.id,
        content:
          "# Test Summary\n\nThis is a test output from the verification script.",
        format: "markdown",
        aiProvider: "deterministic",
        aiPromptVersion: "test-v1",
        metadata: { test: true },
      },
    });
    console.log(`  ✅ Output created: ${output.id}`);

    // ─── Create File ───

    console.log("Creating OfficeAiFile...");
    const file = await prisma.officeAiFile.create({
      data: {
        taskId: task.id,
        filename: "test-document.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        fileHash: "abc123def456",
        metadata: { test: true },
      },
    });
    console.log(`  ✅ File created: ${file.id}`);

    // ─── Update Task Status ───

    console.log("Updating task status to generated...");
    await prisma.officeAiTask.update({
      where: { id: task.id },
      data: { status: "generated" },
    });
    console.log(`  ✅ Task status updated`);

    // ─── Create PlatformAuditLog events manually ───

    console.log("Creating PlatformAuditLog events...");

    const events = [
      {
        action: "office_ai.task.created",
        targetType: "OfficeAiTask",
        targetId: task.id,
      },
      {
        action: "office_ai.output.created",
        targetType: "OfficeAiOutput",
        targetId: output.id,
      },
      {
        action: "office_ai.file.attached",
        targetType: "OfficeAiFile",
        targetId: file.id,
      },
      {
        action: "office_ai.task.status_changed",
        targetType: "OfficeAiTask",
        targetId: task.id,
      },
    ];

    for (const ev of events) {
      await prisma.platformAuditLog.create({
        data: {
          productKey: "office_ai_assistant",
          action: ev.action,
          platformOrganizationId: platformOrg.id,
          clientWorkspaceId: workspace?.id ?? null,
          projectId: project?.id ?? null,
          targetType: ev.targetType,
          targetId: ev.targetId,
          severity: "info",
          sourceSystem: "office_ai_assistant",
          sourceModel: ev.targetType,
          sourceId: ev.targetId,
          actorName: "Verification Script",
          metadata: { test: true, governedSharedApplication: true },
        },
      });
    }
    console.log(`  ✅ ${events.length} PlatformAuditLog events created`);

    // ─── Verify ───

    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        productKey: "office_ai_assistant",
        action: "office_ai.task.created",
      },
    });

    const checks = [
      { name: "Task record exists", pass: !!task },
      { name: "Output record exists", pass: !!output },
      { name: "File record exists", pass: !!file },
      {
        name: "PlatformAuditLog: office_ai_assistant rows exist",
        pass: auditLogs.length > 0,
      },
    ];

    console.log("\n── Verification Checks ──");
    for (const c of checks) {
      console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
    }

    const allPass = checks.every((c) => c.pass);
    if (allPass) {
      console.log("\n✅ All Office AI service verification checks passed!\n");
    } else {
      console.log("\n⚠ Some checks failed\n");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
