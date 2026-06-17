/**
 * PlatformAuditLog Write Verification Script
 *
 * Validates the PlatformAuditLog write path.
 * - Dry-run: validates payload shape without writing (no DB connection needed)
 * - Apply: inserts a single test log marked metadata.test = true
 *
 * Usage:
 *   Dry run (default):   tsx scripts/verify-platform-audit-log-write.ts
 *   Apply mode:          tsx scripts/verify-platform-audit-log-write.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

function makePayload() {
  return {
    productKey: "platform",
    action: "verify.platform_audit_log_write",
    actorId: "system",
    actorType: "system",
    actorName: "Verification Script",
    targetType: "platform_audit_log",
    targetId: "verify-write",
    severity: "info" as const,
    status: "recorded" as const,
    sourceSystem: "verify-platform-audit-log-write",
    metadata: {
      test: true,
      script: "verify-platform-audit-log-write.ts",
      timestamp: new Date().toISOString(),
    },
  };
}

function validatePayload(payload: ReturnType<typeof makePayload>): string[] {
  const errors: string[] = [];
  if (!payload.productKey) errors.push("productKey is required");
  if (!payload.action) errors.push("action is required");
  return errors;
}

async function main() {
  const isApply = process.argv.includes("--apply");
  const mode = isApply ? "APPLY" : "DRY RUN";

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  PlatformAuditLog Write Verify — ${mode.padEnd(14)}║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  const payload = makePayload();
  const errors = validatePayload(payload);

  if (errors.length > 0) {
    console.log("❌ Payload validation errors:");
    for (const err of errors) {
      console.log(`  • ${err}`);
    }
    process.exit(1);
  }

  console.log("✅ Payload shape valid");
  console.log(`  productKey: ${payload.productKey}`);
  console.log(`  action:     ${payload.action}`);
  console.log(`  actorId:    ${payload.actorId ?? "(none)"}`);
  console.log(`  severity:   ${payload.severity}`);
  console.log(`  status:     ${payload.status}`);
  console.log();

  if (!isApply) {
    console.log("── DRY RUN — no test log written ──");
    console.log("  Run with --apply to write a single test log");
    console.log();
    return;
  }

  // Apply mode — test the write path via Prisma directly
  console.log("Connecting to database...");

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  try {
    const log = await prisma.platformAuditLog.create({
      data: {
        productKey: payload.productKey,
        action: payload.action,
        actorId: payload.actorId,
        actorType: payload.actorType,
        actorName: payload.actorName,
        targetType: payload.targetType,
        targetId: payload.targetId,
        severity: payload.severity,
        status: payload.status,
        sourceSystem: payload.sourceSystem,
        metadata: payload.metadata,
      },
    });

    console.log(`✅ Test log written (id: ${log.id})`);
    console.log("  ⚠ This test log is marked metadata.test = true");
    console.log("  ⚠ It should be ignored in production audit views");
    console.log();

    // Verify count
    const count = await prisma.platformAuditLog.count({
      where: { action: "verify.platform_audit_log_write" },
    });
    console.log(`Total test log entries: ${count}`);
    console.log("\n✅ PlatformAuditLog write path verified\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
