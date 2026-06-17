/**
 * PlatformAuditLog Verification Script
 *
 * Reports PlatformAuditLog counts, coverage, and status.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const total = await prisma.platformAuditLog.count();

  // Test rows (created by verification scripts)
  const testRows = await prisma.platformAuditLog.count({
    where: {
      action: {
        in: ["verify.platform_audit_log_write", "platform.dual_write_test"],
      },
    },
  });

  // AuditOS dual-write rows
  const auditOsRows = await prisma.platformAuditLog.count({
    where: { productKey: "audit_os" },
  });

  // Dual-write test rows specifically
  const dualWriteTestRows = await prisma.platformAuditLog.count({
    where: { productKey: "audit_os", action: "platform.dual_write_test" },
  });

  // DecisionOS dual-write rows
  const decisionOsRows = await prisma.platformAuditLog.count({
    where: { productKey: "decision_os" },
  });
  // DecisionOS test rows
  const decisionOsTestRows = await prisma.platformAuditLog.count({
    where: {
      productKey: "decision_os",
      sourceModel: "AuditLog",
      action: "DECISION_CREATED",
    },
  });

  // Office AI Assistant rows
  const officeAiRows = await prisma.platformAuditLog.count({
    where: { productKey: "office_ai_assistant" },
  });
  const officeAiTestRows = await prisma.platformAuditLog.count({
    where: {
      productKey: "office_ai_assistant",
      action: "office_ai.task.created",
    },
  });

  // Backfilled/source rows
  const auditEventBackfilled = await prisma.platformAuditLog.count({
    where: { sourceModel: "AuditEvent" },
  });

  const nonTestRows = total - testRows;
  const nonTestMissingOrg = await prisma.platformAuditLog.count({
    where: {
      action: {
        notIn: ["verify.platform_audit_log_write", "platform.dual_write_test"],
      },
      platformOrganizationId: null,
    },
  });
  const nonTestMissingWs = await prisma.platformAuditLog.count({
    where: {
      action: {
        notIn: ["verify.platform_audit_log_write", "platform.dual_write_test"],
      },
      clientWorkspaceId: null,
    },
  });
  const nonTestMissingProj = await prisma.platformAuditLog.count({
    where: {
      action: {
        notIn: ["verify.platform_audit_log_write", "platform.dual_write_test"],
      },
      projectId: null,
    },
  });

  // AuditOS-specific coverage
  const auditOsMissingOrg = await prisma.platformAuditLog.count({
    where: {
      productKey: "audit_os",
      platformOrganizationId: null,
      action: { not: "platform.dual_write_test" },
    },
  });
  const auditOsMissingWs = await prisma.platformAuditLog.count({
    where: {
      productKey: "audit_os",
      clientWorkspaceId: null,
      action: { not: "platform.dual_write_test" },
    },
  });
  const auditOsMissingProj = await prisma.platformAuditLog.count({
    where: {
      productKey: "audit_os",
      projectId: null,
      action: { not: "platform.dual_write_test" },
    },
  });

  const bySeverity = await prisma.platformAuditLog.groupBy({
    by: ["severity"],
    _count: true,
  });
  const byProduct = await prisma.platformAuditLog.groupBy({
    by: ["productKey"],
    _count: true,
  });

  console.log("\n=== PlatformAuditLog Verification ===\n");
  console.log(`Total PlatformAuditLog rows:       ${total}`);
  console.log(`  Test rows:                       ${testRows}`);
  console.log(`  Non-test rows:                   ${nonTestRows}`);
  console.log(`  AuditOS (audit_os) rows:         ${auditOsRows}`);
  console.log(`  AuditOS dual-write test rows:    ${dualWriteTestRows}`);
  console.log(`  DecisionOS (decision_os) rows:   ${decisionOsRows}`);
  console.log(`  DecisionOS test rows:            ${decisionOsTestRows}`);
  console.log(`  Office AI (office_ai_assistant) rows: ${officeAiRows}`);
  console.log(`  Office AI test rows:             ${officeAiTestRows}`);
  console.log(`  Source AuditEvent:               ${auditEventBackfilled}`);
  console.log();
  console.log("── Context Coverage (non-test rows) ──");
  console.log(
    `  Missing platformOrganizationId:  ${nonTestMissingOrg}/${nonTestRows}`,
  );
  console.log(
    `  Missing clientWorkspaceId:       ${nonTestMissingWs}/${nonTestRows}`,
  );
  console.log(
    `  Missing projectId:               ${nonTestMissingProj}/${nonTestRows}`,
  );
  console.log();
  console.log("── AuditOS Context Coverage ──");
  const auditOsNonTest = await prisma.platformAuditLog.count({
    where: {
      productKey: "audit_os",
      action: { not: "platform.dual_write_test" },
    },
  });
  console.log(
    `  Missing platformOrganizationId:  ${auditOsMissingOrg}/${auditOsNonTest}`,
  );
  console.log(
    `  Missing clientWorkspaceId:       ${auditOsMissingWs}/${auditOsNonTest}`,
  );
  console.log(
    `  Missing projectId:               ${auditOsMissingProj}/${auditOsNonTest}`,
  );
  console.log();
  console.log("── DecisionOS Context Coverage ──");
  const decisionOsNonTest = await prisma.platformAuditLog.count({
    where: { productKey: "decision_os", sourceModel: { not: "AuditLog" } },
  });
  const decisionOsMissingOrg = await prisma.platformAuditLog.count({
    where: {
      productKey: "decision_os",
      platformOrganizationId: null,
      sourceModel: { not: "AuditLog" },
    },
  });
  console.log(
    `  Missing platformOrganizationId:  ${decisionOsMissingOrg}/${decisionOsNonTest}`,
  );
  console.log();
  console.log("── Office AI Context Coverage ──");
  const officeAiNonTest = await prisma.platformAuditLog.count({
    where: { productKey: "office_ai_assistant", sourceModel: "OfficeAiTask" },
  });
  const officeAiMissingOrg = await prisma.platformAuditLog.count({
    where: {
      productKey: "office_ai_assistant",
      platformOrganizationId: null,
      sourceModel: "OfficeAiTask",
    },
  });
  const officeAiMissingWs = await prisma.platformAuditLog.count({
    where: {
      productKey: "office_ai_assistant",
      clientWorkspaceId: null,
      sourceModel: "OfficeAiTask",
    },
  });
  const officeAiMissingProj = await prisma.platformAuditLog.count({
    where: {
      productKey: "office_ai_assistant",
      projectId: null,
      sourceModel: "OfficeAiTask",
    },
  });
  console.log(
    `  Missing platformOrganizationId:  ${officeAiMissingOrg}/${officeAiNonTest}`,
  );
  console.log(
    `  Missing clientWorkspaceId:       ${officeAiMissingWs}/${officeAiNonTest}`,
  );
  console.log(
    `  Missing projectId:               ${officeAiMissingProj}/${officeAiNonTest}`,
  );
  console.log();
  console.log("── Severity Distribution ──");
  for (const s of bySeverity) {
    console.log(`  ${s.severity}: ${s._count}`);
  }
  console.log();
  console.log("── Product Distribution ──");
  for (const p of byProduct) {
    console.log(`  ${p.productKey}: ${p._count}`);
  }
  console.log();

  if (dualWriteTestRows > 0) {
    console.log("✅ AuditOS dual-write verified — test events found");
  } else if (auditOsRows > 0) {
    console.log("✅ AuditOS dual-write active (no test events)");
  } else {
    console.log("⚠ AuditOS dual-write has not produced any logs yet");
  }

  if (decisionOsTestRows > 0) {
    console.log("✅ DecisionOS dual-write verified — test events found");
  } else if (decisionOsRows > 0) {
    console.log("✅ DecisionOS dual-write active (no test events)");
  } else {
    console.log("⚠ DecisionOS dual-write has not produced any logs yet");
  }

  if (officeAiTestRows > 0) {
    console.log("✅ Office AI Assistant audit events found");
  } else if (officeAiRows > 0) {
    console.log("⚠ Office AI Assistant audit active (no test events)");
  } else {
    console.log("⚠ Office AI Assistant has not produced any audit events yet");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
