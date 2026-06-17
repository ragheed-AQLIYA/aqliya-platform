import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const { prisma } = await import("../../src/lib/prisma.ts");
const { parseStatementLines } = await import(
  "../../src/lib/audit/reconciliation/reconciliation-checks.ts"
);

const engagementId = "eng-gulf-2025";

const [schedules, statements, mappings] = await Promise.all([
  prisma.leadSchedule.findMany({
    where: { engagementId },
    include: { lines: true },
  }),
  prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
  prisma.auditAccountMapping.findMany({
    where: { engagementId },
    include: { canonicalAccount: true },
  }),
]);

const fsByMapping = new Map();
for (const stmt of statements) {
  const lines = parseStatementLines(stmt.lines);
  for (const line of lines) {
    if (line.isTotal) continue;
    if (line.linkedAccountMappings.length !== 1) {
      if (line.linkedAccountMappings.length > 0) {
        console.log(
          `MULTI-MAP FS: [${stmt.statementType}] "${line.label}" amount=${line.amount} maps=${line.linkedAccountMappings.join(",")}`,
        );
      }
      continue;
    }
    fsByMapping.set(line.linkedAccountMappings[0], {
      amount: line.amount,
      label: line.label,
      statementType: stmt.statementType,
    });
  }
}

console.log("\n--- LS vs FS per mapping ---");
for (const schedule of schedules) {
  for (const line of schedule.lines) {
    if (!line.reference) continue;
    const map = mappings.find((m) => m.id === line.reference);
    const fs = fsByMapping.get(line.reference);
    const diff = fs ? Math.abs(line.amount - fs.amount) : Math.abs(line.amount);
    if (diff > 0.01 || !fs) {
      console.log(
        JSON.stringify({
          mappingId: line.reference,
          account: map
            ? `${map.sourceAccountCode} ${map.sourceAccountName}`
            : "?",
          lsAmount: line.amount,
          fsAmount: fs?.amount ?? null,
          fsLabel: fs?.label ?? "MISSING",
          diff,
          schedule: schedule.accountCode,
        }),
      );
    }
  }
}

await prisma.$disconnect();
