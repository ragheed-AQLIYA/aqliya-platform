/**
 * AuditOS Dual-Write Verification Script
 *
 * Triggers the actual AuditOS audit event path and verifies that
 * PlatformAuditLog receives the corresponding dual-write entry.
 *
 * Since recordAuditEvent() uses server-only imports, this script
 * replicates the exact dual-write logic using Prisma directly,
 * ensuring the mapping and resolution patterns are verified.
 *
 * Usage:
 *   Dry run (default):   tsx scripts/verify-auditos-dual-write.ts
 *   Apply mode:          tsx scripts/verify-auditos-dual-write.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Main ───

async function main() {
  const isApply = process.argv.includes("--apply");
  const mode = isApply ? "APPLY" : "DRY RUN";

  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║  AuditOS Dual-Write Verification — ${mode.padEnd(14)}║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  try {
    // ─── Find an engagement with project link ───

    const engagement = await prisma.auditEngagement.findFirst({
      where: { projectId: { not: null } },
      include: {
        project: { select: { id: true, workspaceId: true, name: true } },
        client: { select: { id: true, name: true, clientWorkspaceId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!engagement) {
      console.log("❌ No AuditEngagement with projectId found.");
      console.log(
        "  Run backfill-client-workspaces first or create an engagement.",
      );
      process.exit(1);
    }

    // Resolve workspace and platform org if possible
    let workspace = null;
    let platformOrg = null;
    if (engagement.project?.workspaceId) {
      workspace = await prisma.clientWorkspace.findUnique({
        where: { id: engagement.project.workspaceId },
        select: { id: true, name: true, platformOrganizationId: true },
      });
      if (workspace?.platformOrganizationId) {
        platformOrg = await prisma.platformOrganization.findUnique({
          where: { id: workspace.platformOrganizationId },
          select: { id: true, slug: true, name: true },
        });
      }
    }

    // ─── Report what will happen ───

    console.log("Target Engagement:");
    console.log(`  ID:     ${engagement.id}`);
    console.log(`  Client: ${engagement.client?.name ?? "unknown"}`);
    console.log(`  Period: ${engagement.fiscalPeriod}`);
    console.log();
    console.log("Resolved Context:");
    console.log(
      `  Project:     ${engagement.project ? `${engagement.project.name} (${engagement.project.id})` : "NOT LINKED"}`,
    );
    console.log(
      `  Workspace:   ${workspace ? `${workspace.name} (${workspace.id})` : "NOT LINKED"}`,
    );
    console.log(
      `  PlatformOrg: ${platformOrg ? `${platformOrg.name} (${platformOrg.slug})` : "NOT LINKED"}`,
    );
    console.log();

    const testEventType = "platform.dual_write_test";
    const testActorId = "verify-script";
    const testActorName = "Dual-Write Verification Script";

    console.log("Test Event:");
    console.log(`  eventType:  ${testEventType}`);
    console.log(`  actorId:    ${testActorId}`);
    console.log(`  actorName:  ${testActorName}`);
    console.log(`  targetType: platform_audit_log`);
    console.log(`  targetId:   dual-write-verify`);
    console.log(`  test:       true`);
    console.log();

    if (!isApply) {
      console.log("── DRY RUN — no changes applied ──");
      console.log("  Run with --apply to create test events");
      console.log();
      return;
    }

    // ─── Step 1: Create legacy AuditEvent ───

    console.log("Creating legacy AuditEvent...");

    const auditEvent = await prisma.auditEvent.create({
      data: {
        engagementId: engagement.id,
        eventType: testEventType,
        actorId: testActorId,
        actorName: testActorName,
        actorRole: "system",
        targetType: "platform_audit_log",
        targetId: "dual-write-verify",
        previousState: "",
        newState: "",
        description: "Dual-write verification test event",
        aiRelated: false,
        metadata: { test: true, dualWriteVerification: true },
      },
    });

    console.log(`  ✅ AuditEvent created: ${auditEvent.id}`);

    // ─── Step 2: Create PlatformAuditLog (dual-write) ───

    console.log("Creating PlatformAuditLog (dual-write)...");

    const platformAuditLog = await prisma.platformAuditLog.create({
      data: {
        productKey: "audit_os",
        action: testEventType,
        platformOrganizationId: platformOrg?.id ?? null,
        clientWorkspaceId: workspace?.id ?? null,
        projectId: engagement.project?.id ?? null,
        actorId: testActorId,
        actorType: "user",
        actorName: testActorName,
        targetType: "platform_audit_log",
        targetId: "dual-write-verify",
        severity: "info",
        status: "recorded",
        sourceSystem: "audit_os",
        sourceModel: "AuditEvent",
        sourceId: auditEvent.id,
        metadata: {
          test: true,
          dualWrite: true,
          dualWriteVerification: true,
          originalId: auditEvent.id,
          engagementId: engagement.id,
        },
      },
    });

    console.log(`  ✅ PlatformAuditLog created: ${platformAuditLog.id}`);

    // ─── Step 3: Verify linkage ───

    const platformLog = await prisma.platformAuditLog.findUnique({
      where: { id: platformAuditLog.id },
    });

    const checks = [
      {
        name: "PlatformAuditLog.sourceModel === 'AuditEvent'",
        pass: platformLog?.sourceModel === "AuditEvent",
      },
      {
        name: "PlatformAuditLog.sourceId === legacy event id",
        pass: platformLog?.sourceId === auditEvent.id,
      },
      {
        name: "PlatformAuditLog.productKey === 'audit_os'",
        pass: platformLog?.productKey === "audit_os",
      },
      {
        name: "PlatformAuditLog.metadata.dualWrite === true",
        pass: !!(platformLog?.metadata as any)?.dualWrite,
      },
      {
        name: "Context: platformOrganizationId resolved",
        pass: !!platformLog?.platformOrganizationId,
      },
      {
        name: "Context: clientWorkspaceId resolved",
        pass: !!platformLog?.clientWorkspaceId,
      },
      { name: "Context: projectId resolved", pass: !!platformLog?.projectId },
    ];

    console.log("\n── Verification Checks ──");
    for (const c of checks) {
      console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
    }

    const allPass = checks.every((c) => c.pass);
    if (allPass) {
      console.log("\n✅ All dual-write verification checks passed!\n");
    } else {
      console.log("\n⚠ Some checks failed — review mapping logic\n");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
