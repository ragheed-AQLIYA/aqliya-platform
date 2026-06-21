#!/usr/bin/env tsx
/**
 * Tier 2 Intelligence Core — operational smoke (DB + server modules).
 *
 * Usage:
 *   tsx -r ./scripts/mock-server-only.cjs scripts/platform/tier2-operational-smoke.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

process.env.FF_EVENT_OUTBOX = "true";
process.env.FF_EVENT_SCHEMA_REGISTRY = "true";
process.env.FF_ABAC_SHADOW = "true";
process.env.FF_AUDIT_ISA_RULES = "true";

type Check = {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  detail?: string;
};

const checks: Check[] = [];

function record(name: string, status: Check["status"], detail?: string) {
  checks.push({ name, status, detail });
  const icon =
    status === "pass" ? "✓" : status === "warn" ? "⚠" : status === "skip" ? "○" : "✗";
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

function printSummary() {
  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  console.log("\n───────────────────────────────────────────────");
  console.log(`  ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log("───────────────────────────────────────────────\n");
  console.log(JSON.stringify({ checks, summary: { passed, failed, warnings } }, null, 2));
}

async function main() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  AQLIYA Tier 2 Operational Smoke");
  console.log("═══════════════════════════════════════════════\n");

  if (!process.env.DATABASE_URL) {
    record("DATABASE_URL", "fail", "not set");
    printSummary();
    process.exit(1);
  }
  record("DATABASE_URL", "pass");

  const { prisma } = await import("@/lib/prisma");
  const { writePlatformAuditLog } = await import("@/lib/platform/audit-log");
  const { processOutboxBatch } = await import("@/lib/core/events");
  const { listEventSchemas } = await import("@/lib/core/events/schema-registry");
  const { getAbacShadowMismatchReport } = await import(
    "@/core/access/abac-shadow-report"
  );
  await import("@/lib/core/events/outbox-handlers");

  let orgId: string | null = null;
  try {
    const admin = await prisma.user.findFirst({
      where: { email: "admin@aqliya.com" },
      select: { organizationId: true },
    });
    orgId = admin?.organizationId ?? null;
    if (!orgId) {
      record("Admin org lookup", "warn", "admin@aqliya.com not found — run seed");
    } else {
      record("Admin org lookup", "pass", orgId);
    }
  } catch (err) {
    record(
      "Database connect",
      "fail",
      err instanceof Error ? err.message : "connection failed",
    );
    printSummary();
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const outboxCount = await prisma.platformOutboxEvent.count();
    record("platform_outbox_event table", "pass", `rows=${outboxCount}`);
  } catch (err) {
    record(
      "platform_outbox_event table",
      "fail",
      err instanceof Error ? err.message : "missing table — run migrate deploy",
    );
  }

  const schemas = listEventSchemas();
  record(
    "Event schema registry",
    schemas.length >= 3 ? "pass" : "fail",
    `${schemas.length} types registered`,
  );

  if (orgId) {
    try {
      const beforePending = await prisma.platformOutboxEvent.count({
        where: { status: "pending" },
      });

      const write = await writePlatformAuditLog({
        productKey: "platform",
        action: "platform.tier2.smoke",
        actorId: "tier2-smoke",
        actorName: "Tier2 Smoke",
        platformOrganizationId: orgId,
        targetType: "smoke",
        targetId: `tier2-${Date.now()}`,
        metadata: { smoke: true, tier: 2 },
      });

      if (!write.ok || !write.id) {
        record("Audit write + outbox insert", "fail", write.error ?? "no id");
      } else {
        const afterPending = await prisma.platformOutboxEvent.count({
          where: { status: "pending" },
        });
        const inserted = afterPending > beforePending;
        record(
          "Audit write + outbox insert",
          inserted ? "pass" : "warn",
          inserted
            ? `auditId=${write.id}, pending=${afterPending}`
            : "outbox row not created (envelope validation or flag off)",
        );

        const batch = await processOutboxBatch(10);
        record(
          "Outbox processBatch",
          "pass",
          `processed=${batch.processed}, failed=${batch.failed}`,
        );
      }

      const abac = await getAbacShadowMismatchReport(orgId, 30);
      record(
        "ABAC shadow report",
        "pass",
        `evaluations=${abac.totalEvaluations}, mismatchRate=${abac.mismatchRate}%, ready=${abac.enforce.readyForPilot}`,
      );
    } catch (err) {
      record(
        "Tier 2 write/process cycle",
        "fail",
        err instanceof Error ? err.message : "unknown error",
      );
    }
  } else {
    record("Tier 2 write/process cycle", "skip", "no org id");
  }

  printSummary();
  const failed = checks.filter((c) => c.status === "fail").length;
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
