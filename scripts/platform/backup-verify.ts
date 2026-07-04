// AQLIYA — Multi-Product Backup Verification Helper
// Run: npx tsx scripts/platform/backup-verify.ts
// Checks database connectivity and basic data integrity across all active products.
// Does not perform actual backup or restore.
//
// Products checked:
//   - AuditOS     (core audit data - existing)
//   - LocalContentOS (LCOS models)
//   - DecisionOS  (decision engine models)
//   - WorkflowOS  (workflow engine models)
//   - Shared      (Organization, User, PlatformAuditLog)

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const OK = "✅";
const FAIL = "❌";
const PRODUCTS = ["AuditOS", "LocalContentOS", "DecisionOS", "WorkflowOS"] as const;

async function main() {
  console.log("\nAQLIYA — Multi-Product Backup Verification");
  console.log("=".repeat(60));
  const p = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!),
  });

  try {
    // 1. Database connectivity
    await p.$queryRaw`SELECT 1`;
    console.log(`  ${OK} Database connectivity: OK`);
    console.log("");

    interface TableEntry {
      label: string;
      model: string;
      product?: string;
    }

    const tables: TableEntry[] = [
      // ── Shared ──
      { label: "Organizations", model: "organization", product: "Shared" },
      { label: "Users", model: "user", product: "Shared" },
      { label: "Platform audit log", model: "platformAuditLog", product: "Shared" },

      // ── AuditOS ──
      { label: "Audit engagements", model: "auditEngagement", product: "AuditOS" },
      { label: "Audit events", model: "auditEvent", product: "AuditOS" },
      { label: "Audit evidence", model: "auditEvidence", product: "AuditOS" },
      { label: "Audit findings", model: "auditFinding", product: "AuditOS" },
      { label: "Audit recommendations", model: "auditRecommendation", product: "AuditOS" },
      { label: "Audit AI outputs", model: "auditAiOutput", product: "AuditOS" },

      // ── LocalContentOS ──
      { label: "LCOS projects", model: "localContentProject", product: "LocalContentOS" },
      { label: "LCOS workbooks", model: "lcWorkbook", product: "LocalContentOS" },
      { label: "LCOS suppliers", model: "localContentSupplier", product: "LocalContentOS" },
      { label: "LCOS evidence", model: "localContentEvidence", product: "LocalContentOS" },
      { label: "LCOS findings", model: "localContentFinding", product: "LocalContentOS" },
      { label: "LCOS reviews", model: "localContentReview", product: "LocalContentOS" },

      // ── DecisionOS ──
      { label: "Decisions", model: "decision", product: "DecisionOS" },
      { label: "Decision frameworks", model: "decisionFramework", product: "DecisionOS" },
      { label: "Decision scenarios", model: "decisionScenario", product: "DecisionOS" },
      { label: "Decision evidence", model: "decisionEvidence", product: "DecisionOS" },

      // ── WorkflowOS ──
      { label: "Workflow templates", model: "workflowTemplate", product: "WorkflowOS" },
      { label: "Workflow records", model: "workflowRecord", product: "WorkflowOS" },
      { label: "Workflow audit events", model: "workflowAuditEvent", product: "WorkflowOS" },
    ];

    // Group by product for display
    const productResults: Record<string, { passed: number; failed: number; total: number }> = {};
    for (const pName of PRODUCTS) {
      productResults[pName] = { passed: 0, failed: 0, total: 0 };
    }
    productResults["Shared"] = { passed: 0, failed: 0, total: 0 };

    let allOk = true;

    for (const { label, model, product } of tables) {
      let count = -1;
      let ok = false;
      try {
        count = await (p as any)[model].count();
        ok = count >= 0;
      } catch {
        ok = false;
      }

      const prod = product ?? "Shared";
      if (!productResults[prod]) productResults[prod] = { passed: 0, failed: 0, total: 0 };
      productResults[prod].total++;

      if (ok && count > 0) {
        console.log(`  ${OK} ${label}: ${count} records  [${prod}]`);
        productResults[prod].passed++;
      } else if (ok && count === 0) {
        console.log(`  ${FAIL} ${label}: 0 records — possible data loss  [${prod}]`);
        productResults[prod].failed++;
        allOk = false;
      } else {
        console.log(`  ${FAIL} ${label}: query failed — table may not exist  [${prod}]`);
        productResults[prod].failed++;
        allOk = false;
      }
    }

    // 4. Summary by product
    console.log("");
    console.log("=".repeat(60));
    console.log("  Product Summary:");
    for (const [prodName, result] of Object.entries(productResults)) {
      if (result.total === 0) continue;
      const status = result.failed === 0 ? OK : FAIL;
      console.log(
        `    ${status} ${prodName}: ${result.passed}/${result.total} tables passed`,
      );
    }

    // 5. Shared tables (Organization, User, PlatformAuditLog)
    const sharedPassed =
      (productResults["Shared"]?.passed ?? 0) === (productResults["Shared"]?.total ?? 0);
    const sharedStatus = sharedPassed ? OK : FAIL;
    console.log(`    ${sharedStatus} Shared: ${productResults["Shared"]?.passed ?? 0}/${productResults["Shared"]?.total ?? 0} passed`);

    // 6. Verdict
    console.log("");
    console.log("=".repeat(60));
    if (allOk) {
      console.log(
        `  ${OK} Backup verification: PASS — all product tables have data`,
      );
      console.log("  Products covered: AuditOS, LocalContentOS, DecisionOS, WorkflowOS + Shared");
      console.log("  Note: This is a data integrity check, not a backup test.");
      console.log("  Run: npm run db:backup for actual backup.");
      process.exit(0);
    } else {
      console.log(
        `  ${FAIL} Backup verification: FAIL — data integrity issue detected`,
      );
      console.log("  Review failing tables above and restore from backup if needed.");
      process.exit(1);
    }
  } catch (e: unknown) {
    console.log(`  ${FAIL} Database connectivity: ${(e as Error).message}`);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
}

main().catch(console.error);
