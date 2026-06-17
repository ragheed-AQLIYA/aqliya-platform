/**
 * ClientWorkspace and Project Backfill Script
 *
 * Creates ClientWorkspace records from existing AuditClient records
 * and Project records from existing AuditEngagement records.
 *
 * Usage:
 *   Dry run (default):   tsx scripts/backfill-client-workspaces.ts
 *   Apply mode:          tsx scripts/backfill-client-workspaces.ts --apply
 *   Strict mode:         tsx scripts/backfill-client-workspaces.ts --apply --strict
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Types ───

interface Summary {
  auditClientTotal: number;
  auditEngagementTotal: number;
  workspacesAlreadyLinked: number;
  projectsAlreadyLinked: number;
  workspacesCreated: number;
  projectsCreated: number;
  auditClientsLinked: number;
  engagementsLinked: number;
  skippedNoPlatformOrg: {
    clientId: string;
    clientName: string;
    reason: string;
  }[];
  skippedNoWorkspace: {
    engagementId: string;
    engagementName: string;
    reason: string;
  }[];
  errors: string[];
}

// ─── Helpers ───

function slugify(name: string, existingSlugs: Set<string>): string {
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) slug = "workspace";

  let candidate = slug;
  let counter = 1;
  while (existingSlugs.has(candidate)) {
    candidate = `${slug}-${counter}`;
    counter++;
  }
  existingSlugs.add(candidate);
  return candidate;
}

// ─── Main ───

async function main() {
  const isApply = process.argv.includes("--apply");
  const isStrict = process.argv.includes("--strict");
  const mode = isApply ? "APPLY" : "DRY RUN";

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  ClientWorkspace & Project Backfill — ${mode.padEnd(12)}║`);
  if (isStrict)
    console.log(`║  STRICT MODE                                   ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const summary: Summary = {
    auditClientTotal: 0,
    auditEngagementTotal: 0,
    workspacesAlreadyLinked: 0,
    projectsAlreadyLinked: 0,
    workspacesCreated: 0,
    projectsCreated: 0,
    auditClientsLinked: 0,
    engagementsLinked: 0,
    skippedNoPlatformOrg: [],
    skippedNoWorkspace: [],
    errors: [],
  };

  try {
    // ─── Step 1: Backfill ClientWorkspace from AuditClient ───

    const auditClients = await prisma.auditClient.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            platformOrganizationId: true,
            slug: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    summary.auditClientTotal = auditClients.length;
    console.log(`Found ${auditClients.length} AuditClient records\n`);

    // Build slug index per PlatformOrganization
    const existingWorkspaceSlugs = new Map<string, Set<string>>();
    const existingWorkspaces = await prisma.clientWorkspace.findMany({
      select: { platformOrganizationId: true, slug: true },
    });
    for (const ws of existingWorkspaces) {
      if (!existingWorkspaceSlugs.has(ws.platformOrganizationId)) {
        existingWorkspaceSlugs.set(ws.platformOrganizationId, new Set());
      }
      existingWorkspaceSlugs.get(ws.platformOrganizationId)!.add(ws.slug);
    }

    // Phase 1A: Link workspace to clients that already have one
    const clientsToProcess = [];
    for (const client of auditClients) {
      if (client.clientWorkspaceId) {
        summary.workspacesAlreadyLinked++;
        continue;
      }
      clientsToProcess.push(client);
    }

    if (summary.workspacesAlreadyLinked > 0) {
      console.log(
        `Already linked workspaces: ${summary.workspacesAlreadyLinked}`,
      );
    }

    if (isStrict && clientsToProcess.length > 0 && !isApply) {
      console.log(
        `\n⚠ Strict mode: ${clientsToProcess.length} clients need workspaces.`,
      );
      console.log(`  Run with --apply to create them.\n`);
    }

    // Phase 1B: Create workspaces for unmatched clients
    const workspaceClients: {
      client: (typeof auditClients)[0];
      slug: string;
    }[] = [];

    for (const client of clientsToProcess) {
      const platformOrgId = client.organization.platformOrganizationId;
      if (!platformOrgId) {
        summary.skippedNoPlatformOrg.push({
          clientId: client.id,
          clientName: client.name,
          reason: `AuditOrganization ${client.organization.name} has no PlatformOrganization link`,
        });
        continue;
      }

      // Get or create slug set for this platform org
      if (!existingWorkspaceSlugs.has(platformOrgId)) {
        existingWorkspaceSlugs.set(platformOrgId, new Set());
      }
      const slugSet = existingWorkspaceSlugs.get(platformOrgId)!;
      const slug = slugify(client.name, slugSet);

      workspaceClients.push({ client, slug });
    }

    if (isApply) {
      for (const { client, slug } of workspaceClients) {
        const platformOrgId = client.organization.platformOrganizationId!;
        try {
          const workspace = await prisma.clientWorkspace.create({
            data: {
              platformOrganizationId: platformOrgId,
              name: client.name,
              slug,
              workspaceType: "client",
              status: client.status === "active" ? "active" : "archived",
              productAccess: { audit: true },
              metadata: {
                source: "audit_client_backfill",
                auditClientId: client.id,
                auditOrganizationId: client.organizationId,
              },
            },
          });

          await prisma.auditClient.update({
            where: { id: client.id },
            data: { clientWorkspaceId: workspace.id },
          });

          summary.workspacesCreated++;
          summary.auditClientsLinked++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          summary.errors.push(
            `Failed to create workspace for client ${client.name}: ${msg}`,
          );
        }
      }
    } else {
      summary.workspacesCreated = workspaceClients.length;
      summary.auditClientsLinked = workspaceClients.length;
    }

    // ─── Step 2: Backfill Project from AuditEngagement ───

    const engagements = await prisma.auditEngagement.findMany({
      include: {
        client: {
          select: { id: true, name: true, clientWorkspaceId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    summary.auditEngagementTotal = engagements.length;
    console.log(`Found ${engagements.length} AuditEngagement records\n`);

    // Phase 2A: Already linked
    const engagementsToProcess = [];
    for (const eng of engagements) {
      if (eng.projectId) {
        summary.projectsAlreadyLinked++;
        continue;
      }
      engagementsToProcess.push(eng);
    }

    if (summary.projectsAlreadyLinked > 0) {
      console.log(`Already linked projects: ${summary.projectsAlreadyLinked}`);
    }

    // Phase 2B: Create projects for unmatched engagements
    const projectEngagements: {
      engagement: (typeof engagements)[0];
      workspaceId: string;
    }[] = [];

    for (const eng of engagementsToProcess) {
      const workspaceId = eng.client.clientWorkspaceId;
      if (!workspaceId) {
        summary.skippedNoWorkspace.push({
          engagementId: eng.id,
          engagementName: `${eng.client.name} / ${eng.fiscalPeriod}`,
          reason: `AuditClient ${eng.client.name} has no ClientWorkspace link`,
        });
        continue;
      }
      projectEngagements.push({ engagement: eng, workspaceId });
    }

    if (isApply) {
      for (const { engagement: eng, workspaceId } of projectEngagements) {
        try {
          const project = await prisma.project.create({
            data: {
              workspaceId,
              name: `${eng.client.name} — ${eng.fiscalPeriod}`,
              projectType: "audit_engagement",
              status: eng.status === "draft" ? "active" : "active",
              metadata: {
                source: "audit_engagement_backfill",
                auditEngagementId: eng.id,
                auditClientId: eng.clientId,
                fiscalPeriod: eng.fiscalPeriod,
              },
            },
          });

          await prisma.auditEngagement.update({
            where: { id: eng.id },
            data: { projectId: project.id },
          });

          summary.projectsCreated++;
          summary.engagementsLinked++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          summary.errors.push(
            `Failed to create project for engagement ${eng.id}: ${msg}`,
          );
        }
      }
    } else {
      summary.projectsCreated = projectEngagements.length;
      summary.engagementsLinked = projectEngagements.length;
    }

    // ─── Print summary ───

    console.log();
    console.log("═".repeat(55));
    console.log("SUMMARY");
    console.log("═".repeat(55));
    console.log(
      `  AuditClient records:                  ${summary.auditClientTotal}`,
    );
    console.log(
      `  AuditEngagement records:              ${summary.auditEngagementTotal}`,
    );
    console.log(
      `  Workspaces already linked:            ${summary.workspacesAlreadyLinked}`,
    );
    console.log(
      `  Projects already linked:              ${summary.projectsAlreadyLinked}`,
    );
    console.log(
      `  Workspaces to be created:             ${summary.workspacesCreated}`,
    );
    console.log(
      `  Projects to be created:               ${summary.projectsCreated}`,
    );
    console.log(
      `  AuditClients to be linked:            ${summary.auditClientsLinked}`,
    );
    console.log(
      `  Engagements to be linked:             ${summary.engagementsLinked}`,
    );
    console.log(
      `  Skipped (no PlatformOrganization):    ${summary.skippedNoPlatformOrg.length}`,
    );
    console.log(
      `  Skipped (no ClientWorkspace):         ${summary.skippedNoWorkspace.length}`,
    );

    if (summary.skippedNoPlatformOrg.length > 0) {
      console.log("\n── Skipped: No PlatformOrganization ──");
      for (const s of summary.skippedNoPlatformOrg) {
        console.log(`  • ${s.clientName} (${s.clientId}): ${s.reason}`);
      }
    }

    if (summary.skippedNoWorkspace.length > 0) {
      console.log("\n── Skipped: No ClientWorkspace ──");
      for (const s of summary.skippedNoWorkspace) {
        console.log(`  • ${s.engagementName} (${s.engagementId}): ${s.reason}`);
      }
    }

    if (summary.errors.length > 0) {
      console.log("\n── Errors ──");
      for (const err of summary.errors) {
        console.log(`  ✗ ${err}`);
      }
    }

    if (!isApply) {
      console.log("\n── DRY RUN — no changes applied ──");
      console.log(`  Run with --apply to execute backfill`);
    } else if (summary.errors.length === 0) {
      console.log("\n✅ Backfill complete");
    } else {
      console.log(
        `\n⚠ Backfill completed with ${summary.errors.length} error(s)`,
      );
    }
  } catch (err) {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
