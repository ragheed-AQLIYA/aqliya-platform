/**
 * ClientWorkspace and Project Link Verification Script
 *
 * Reports link status for all AuditClient → ClientWorkspace
 * and AuditEngagement → Project mappings.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

interface ClientLinkStatus {
  type: string;
  id: string;
  name: string;
  fiscalPeriod?: string;
  linked: boolean;
  workspaceSlug: string | null;
  workspaceName: string | null;
  projectType: string | null;
  projectStatus: string | null;
  skipReason?: string;
}

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  // ─── Stats ───

  const workspaceCount = await prisma.clientWorkspace.count();
  const projectCount = await prisma.project.count();
  const platformOrgCount = await prisma.platformOrganization.count();

  // ─── AuditClient links ───

  const auditClients = await prisma.auditClient.findMany({
    include: {
      clientWorkspace: {
        select: { id: true, slug: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const clientResults: ClientLinkStatus[] = auditClients.map((c) => ({
    type: "AuditClient",
    id: c.id,
    name: c.name,
    linked: !!c.clientWorkspace,
    workspaceSlug: c.clientWorkspace?.slug ?? null,
    workspaceName: c.clientWorkspace?.name ?? null,
    projectType: null,
    projectStatus: null,
  }));

  // ─── AuditEngagement links ───

  const engagements = await prisma.auditEngagement.findMany({
    include: {
      project: {
        select: { id: true, projectType: true, status: true, name: true },
      },
      client: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const engagementResults: ClientLinkStatus[] = engagements.map((e) => ({
    type: "AuditEngagement",
    id: e.id,
    name: `${e.client.name} / ${e.fiscalPeriod}`,
    fiscalPeriod: e.fiscalPeriod,
    linked: !!e.project,
    workspaceSlug: e.project?.name ?? null,
    workspaceName: e.project?.name ?? null,
    projectType: e.project?.projectType ?? null,
    projectStatus: e.project?.status ?? null,
  }));

  // ─── Orphan checks ───

  const orphanWorkspaces = await prisma.clientWorkspace.findMany({
    where: {
      projects: { none: {} },
      auditClients: { none: {} },
    },
    select: { id: true, name: true },
  });

  const orphanProjects = await prisma.project.findMany({
    where: { auditEngagements: { none: {} } },
    select: { id: true, name: true },
  });

  // platformOrganizationId is required on ClientWorkspace, so no null check needed

  // ─── Summary counts ───

  const clientTotal = clientResults.length;
  const clientLinked = clientResults.filter((r) => r.linked).length;
  const clientUnlinked = clientResults.filter((r) => !r.linked).length;

  const engTotal = engagementResults.length;
  const engLinked = engagementResults.filter((r) => r.linked).length;
  const engUnlinked = engagementResults.filter((r) => !r.linked).length;

  // ─── Print ───

  console.log("\n=== ClientWorkspace & Project Link Verification ===\n");
  console.log(`PlatformOrganization records:   ${platformOrgCount}`);
  console.log(`ClientWorkspace records:        ${workspaceCount}`);
  console.log(`Project records:                ${projectCount}\n`);

  // Client links
  console.log("── AuditClient → ClientWorkspace ──");
  for (const r of clientResults) {
    const status = r.linked ? "✅ LINKED" : "❌ UNLINKED";
    console.log(`  ${status}  ${r.name} (${r.id})`);
    if (r.linked) {
      console.log(`         → ${r.workspaceSlug} (${r.workspaceName})`);
    }
  }
  console.log();

  // Engagement links
  console.log("── AuditEngagement → Project ──");
  for (const r of engagementResults) {
    const status = r.linked ? "✅ LINKED" : "❌ UNLINKED";
    console.log(`  ${status}  ${r.name} (${r.id})`);
    if (r.linked) {
      console.log(
        `         → ${r.workspaceName} [${r.projectType}] (${r.projectStatus})`,
      );
    }
  }
  console.log();

  // Summary
  console.log("═".repeat(55));
  console.log("SUMMARY");
  console.log("═".repeat(55));
  console.log(`  AuditClient total:             ${clientTotal}`);
  console.log(`  → Linked:                     ${clientLinked}`);
  console.log(`  → Unlinked:                   ${clientUnlinked}`);
  console.log(
    `  Coverage:                     ${clientTotal > 0 ? ((clientLinked / clientTotal) * 100).toFixed(1) : "N/A"}%`,
  );
  console.log();
  console.log(`  AuditEngagement total:         ${engTotal}`);
  console.log(`  → Linked:                     ${engLinked}`);
  console.log(`  → Unlinked:                   ${engUnlinked}`);
  console.log(
    `  Coverage:                     ${engTotal > 0 ? ((engLinked / engTotal) * 100).toFixed(1) : "N/A"}%`,
  );

  if (orphanWorkspaces.length > 0) {
    console.log(
      `\n⚠ Orphan ClientWorkspaces (no projects, no clients): ${orphanWorkspaces.length}`,
    );
    for (const w of orphanWorkspaces) {
      console.log(`  • ${w.name} (${w.id})`);
    }
  }

  if (orphanProjects.length > 0) {
    console.log(
      `\n⚠ Orphan Projects (no engagements): ${orphanProjects.length}`,
    );
    for (const p of orphanProjects) {
      console.log(`  • ${p.name} (${p.id})`);
    }
  }

  if (clientLinked === clientTotal && engLinked === engTotal) {
    console.log(
      "\n✅ All AuditClient and AuditEngagement records are linked.\n",
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
