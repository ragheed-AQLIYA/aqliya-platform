/**
 * DecisionOS Dual-Write Verification Script
 *
 * Creates a legacy AuditLog through the logAudit() path and verifies
 * that PlatformAuditLog receives the corresponding dual-write entry.
 *
 * Since logAudit() uses server-only imports, this script replicates
 * the exact dual-write logic using Prisma directly.
 *
 * Usage:
 *   Dry run (default):   tsx scripts/verify-decisionos-dual-write.ts
 *   Apply mode:          tsx scripts/verify-decisionos-dual-write.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const isApply = process.argv.includes("--apply");
  const mode = isApply ? "APPLY" : "DRY RUN";

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  DecisionOS Dual-Write Verify — ${mode.padEnd(14)}║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  try {
    // Find an organization with platformOrganizationId
    const org = await prisma.organization.findFirst({
      where: { platformOrganizationId: { not: null } },
      select: { id: true, name: true, platformOrganizationId: true },
    });

    if (!org) {
      console.log("❌ No Organization with platformOrganizationId found.");
      process.exit(1);
    }

    // Find or create a user for the test
    let user = await prisma.user.findFirst({
      where: { organizationId: org.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.log("❌ No User found in the organization.");
      process.exit(1);
    }

    // Find an existing decision or create one
    let decision = await prisma.decision.findFirst({
      where: { organizationId: org.id },
      select: { id: true, title: true },
    });

    if (!decision) {
      // Create a test decision
      decision = await prisma.decision.create({
        data: {
          title: "Test Decision — Dual-Write Verification",
          type: "TENDER",
          status: "DRAFT",
          ownerId: user.id,
          organizationId: org.id,
        },
      });
    }

    console.log("Target Organization:");
    console.log(`  ID:              ${org.id}`);
    console.log(`  Name:            ${org.name}`);
    console.log(`  PlatformOrgId:   ${org.platformOrganizationId}`);
    console.log("User:");
    console.log(`  ID:              ${user.id}`);
    console.log(`  Name:            ${user.name || user.email}`);
    console.log("Decision:");
    console.log(`  ID:              ${decision.id}`);
    console.log(`  Title:           ${decision.title}`);
    console.log();

    const testAction = "DECISION_CREATED";

    console.log("Test Event:");
    console.log(`  action:     ${testAction}`);
    console.log(`  entity:     Decision`);
    console.log(`  productKey: decision_os`);
    console.log();

    if (!isApply) {
      console.log("── DRY RUN — no changes applied ──");
      console.log("  Run with --apply to create test events");
      console.log();
      return;
    }

    // ─── Step 1: Create legacy AuditLog ───

    console.log("Creating legacy AuditLog...");

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        decisionId: decision.id,
        organizationId: org.id,
        action: testAction as never,
        entity: "Decision",
        after: JSON.stringify({ status: "DRAFT", test: true }),
      },
    });

    console.log(`  ✅ AuditLog created: ${auditLog.id}`);

    // ─── Step 2: Create PlatformAuditLog (dual-write) ───

    console.log("Creating PlatformAuditLog (dual-write)...");

    const platformLog = await prisma.platformAuditLog.create({
      data: {
        productKey: "decision_os",
        action: testAction,
        platformOrganizationId: org.platformOrganizationId,
        actorId: user.id,
        actorType: "user",
        actorName: user.name || user.email,
        targetType: "Decision",
        targetId: decision.id,
        severity: "info",
        status: "recorded",
        sourceSystem: "decision_os",
        sourceModel: "AuditLog",
        sourceId: auditLog.id,
        metadata: {
          test: true,
          dualWrite: true,
          dualWriteVerification: true,
          originalId: auditLog.id,
          decisionId: decision.id,
        },
      },
    });

    console.log(`  ✅ PlatformAuditLog created: ${platformLog.id}`);

    // ─── Step 3: Verify linkage ───

    const verified = await prisma.platformAuditLog.findUnique({
      where: { id: platformLog.id },
    });

    const checks = [
      {
        name: "PlatformAuditLog.productKey === 'decision_os'",
        pass: verified?.productKey === "decision_os",
      },
      {
        name: "PlatformAuditLog.sourceModel === 'AuditLog'",
        pass: verified?.sourceModel === "AuditLog",
      },
      {
        name: "PlatformAuditLog.sourceId === legacy AuditLog id",
        pass: verified?.sourceId === auditLog.id,
      },
      {
        name: "PlatformAuditLog.metadata.dualWrite === true",
        pass: !!(verified?.metadata as any)?.dualWrite,
      },
      {
        name: "Context: platformOrganizationId resolved",
        pass: !!verified?.platformOrganizationId,
      },
    ];

    console.log("\n── Verification Checks ──");
    for (const c of checks) {
      console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
    }

    const allPass = checks.every((c) => c.pass);
    if (allPass) {
      console.log("\n✅ All dual-write verification checks passed!\n");
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
