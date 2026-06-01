/**
 * PlatformOrganization Backfill Script
 *
 * Links existing Organization (DecisionOS) and AuditOrganization (AuditOS)
 * records to new PlatformOrganization bridge records.
 *
 * Matching strategy (in priority order):
 *   1. Exact ID match: Organization.id === AuditOrganization.id
 *   2. Exact normalized name match (case-insensitive, trimmed)
 *   3. No fallback guessing — unmatched records remain NULL
 *
 * Usage:
 *   Dry run (default):   tsx scripts/backfill-platform-organizations.ts
 *   Apply mode:          tsx scripts/backfill-platform-organizations.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Types ───

interface MatchGroup {
  platformOrgName: string;
  decisionOrg: { id: string; name: string; createdAt: Date } | null;
  auditOrg: { id: string; name: string; slug: string; createdAt: Date } | null;
  matchType: "id" | "name" | "orphan_decision" | "orphan_audit";
}

interface Summary {
  totalDecisionOrgs: number;
  totalAuditOrgs: number;
  idMatches: MatchGroup[];
  nameMatches: MatchGroup[];
  unmatchedDecisionOrgs: { id: string; name: string }[];
  unmatchedAuditOrgs: { id: string; name: string; slug: string }[];
  alreadyLinked: {
    type: string;
    id: string;
    name: string;
    platformOrgId: string;
  }[];
  platformOrgsCreated: number;
  decisionOrgsLinked: number;
  auditOrgsLinked: number;
  sunbulClientsLinked: number;
  errors: string[];
}

// ─── Helpers ───

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugify(name: string, existingSlugs: Set<string>): string {
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) slug = "org";

  // Deduplicate
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
  const mode = isApply ? "APPLY" : "DRY RUN";
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  PlatformOrganization Backfill — ${mode.padEnd(16)}║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const summary: Summary = {
    totalDecisionOrgs: 0,
    totalAuditOrgs: 0,
    idMatches: [],
    nameMatches: [],
    unmatchedDecisionOrgs: [],
    unmatchedAuditOrgs: [],
    alreadyLinked: [],
    platformOrgsCreated: 0,
    decisionOrgsLinked: 0,
    auditOrgsLinked: 0,
    sunbulClientsLinked: 0,
    errors: [],
  };

  try {
    // ─── Fetch all records ───

    const decisionOrgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        platformOrganizationId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const auditOrgs = await prisma.auditOrganization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        platformOrganizationId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const sunbulClients = await prisma.sunbulClient.findMany({
      select: {
        id: true,
        name: true,
        platformOrganizationId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    summary.totalDecisionOrgs = decisionOrgs.length;
    summary.totalAuditOrgs = auditOrgs.length;

    console.log(`Found ${decisionOrgs.length} DecisionOS organizations`);
    console.log(`Found ${auditOrgs.length} AuditOS organizations`);
    console.log(`Found ${sunbulClients.length} SunbulClient records\n`);

    // ─── Check already linked ───

    const decisionLookup = new Map(decisionOrgs.map((o) => [o.id, o]));
    const auditLookup = new Map(auditOrgs.map((o) => [o.id, o]));

    const unmatchedDecisions = new Map(decisionLookup);
    const unmatchedAudits = new Map(auditLookup);

    // Track already-linked records
    for (const [id, org] of decisionLookup) {
      if (org.platformOrganizationId) {
        summary.alreadyLinked.push({
          type: "Organization (DecisionOS)",
          id: org.id,
          name: org.name,
          platformOrgId: org.platformOrganizationId,
        });
        unmatchedDecisions.delete(id);
      }
    }
    for (const [id, org] of auditLookup) {
      if (org.platformOrganizationId) {
        summary.alreadyLinked.push({
          type: "AuditOrganization (AuditOS)",
          id: org.id,
          name: org.name,
          platformOrgId: org.platformOrganizationId,
        });
        unmatchedAudits.delete(id);
      }
    }

    if (summary.alreadyLinked.length > 0) {
      console.log(`Already linked: ${summary.alreadyLinked.length} records`);
      for (const linked of summary.alreadyLinked) {
        console.log(
          `  ↳ ${linked.type}: ${linked.name} (${linked.id}) → ${linked.platformOrgId}`,
        );
      }
      console.log();
    }

    // ─── Step 1: Match by ID ───

    for (const [id, decisionOrg] of unmatchedDecisions) {
      const auditOrg = unmatchedAudits.get(id);
      if (!auditOrg) continue;

      summary.idMatches.push({
        platformOrgName: decisionOrg.name,
        decisionOrg: decisionOrg,
        auditOrg: auditOrg,
        matchType: "id",
      });
      unmatchedDecisions.delete(id);
      unmatchedAudits.delete(id);
    }

    if (summary.idMatches.length > 0) {
      console.log(`ID matches: ${summary.idMatches.length}`);
      for (const m of summary.idMatches) {
        console.log(`  ↳ ${m.decisionOrg!.name} ← ID: ${m.decisionOrg!.id}`);
      }
      console.log();
    }

    // ─── Step 2: Match by name ───

    const nameIndex = new Map<
      string,
      { id: string; name: string; createdAt: Date }
    >();
    for (const [id, org] of unmatchedDecisions) {
      const key = normalizeName(org.name);
      if (!nameIndex.has(key)) {
        nameIndex.set(key, org);
      }
    }

    for (const [id, auditOrg] of unmatchedAudits) {
      const key = normalizeName(auditOrg.name);
      const decisionOrg = nameIndex.get(key);
      if (!decisionOrg) continue;

      // Verify it's still unmatched
      const stillUnmatched = unmatchedDecisions.get(decisionOrg.id);
      if (!stillUnmatched) continue;

      summary.nameMatches.push({
        platformOrgName: auditOrg.name,
        decisionOrg: decisionOrg,
        auditOrg: auditOrg,
        matchType: "name",
      });
      unmatchedDecisions.delete(decisionOrg.id);
      unmatchedAudits.delete(id);
    }

    if (summary.nameMatches.length > 0) {
      console.log(`Name matches: ${summary.nameMatches.length}`);
      for (const m of summary.nameMatches) {
        console.log(`  ↳ "${m.decisionOrg!.name}" ←→ "${m.auditOrg!.name}"`);
      }
      console.log();
    }

    // ─── Remaining unmatched ───

    for (const [, org] of unmatchedDecisions) {
      summary.unmatchedDecisionOrgs.push({ id: org.id, name: org.name });
    }
    for (const [, org] of unmatchedAudits) {
      summary.unmatchedAuditOrgs.push({
        id: org.id,
        name: org.name,
        slug: org.slug,
      });
    }

    // ─── Build combined list of all matched groups + orphan decisions + orphan audits ───

    const allGroups: MatchGroup[] = [
      ...summary.idMatches,
      ...summary.nameMatches,
      // Unmatched DecisionOS orgs become separate platform orgs (orphan decisions)
      ...summary.unmatchedDecisionOrgs.map((o) => ({
        platformOrgName: o.name,
        decisionOrg: { id: o.id, name: o.name, createdAt: new Date() },
        auditOrg: null,
        matchType: "orphan_decision" as const,
      })),
      // Unmatched AuditOS orgs become separate platform orgs (orphan audits)
      ...summary.unmatchedAuditOrgs.map((o) => ({
        platformOrgName: o.name,
        decisionOrg: null,
        auditOrg: {
          id: o.id,
          name: o.name,
          slug: o.slug,
          createdAt: new Date(),
        },
        matchType: "orphan_audit" as const,
      })),
    ];

    // ─── Apply or simulate ───

    if (isApply) {
      const existingSlugs = new Set<string>();
      // Load existing PlatformOrganization slugs to avoid conflicts
      const existingPlatformOrgs = await prisma.platformOrganization.findMany({
        select: { slug: true },
      });
      for (const po of existingPlatformOrgs) {
        existingSlugs.add(po.slug);
      }

      for (const group of allGroups) {
        const slug = slugify(group.platformOrgName, existingSlugs);
        const platformOrg = await prisma.platformOrganization.create({
          data: {
            slug,
            name: group.platformOrgName,
            status: "active",
          },
        });
        summary.platformOrgsCreated++;

        if (group.decisionOrg) {
          await prisma.organization.update({
            where: { id: group.decisionOrg.id },
            data: { platformOrganizationId: platformOrg.id },
          });
          summary.decisionOrgsLinked++;
        }

        if (group.auditOrg) {
          await prisma.auditOrganization.update({
            where: { id: group.auditOrg.id },
            data: { platformOrganizationId: platformOrg.id },
          });
          summary.auditOrgsLinked++;
        }
      }

      // SunbulClient backfill: link by normalized name to PlatformOrganization
      const platformOrgs = await prisma.platformOrganization.findMany({
        select: { id: true, name: true, slug: true },
      });
      const platformByName = new Map(
        platformOrgs.map((po) => [normalizeName(po.name), po.id]),
      );

      for (const client of sunbulClients) {
        if (client.platformOrganizationId) continue;
        const key = normalizeName(client.name);
        let platformOrgId = platformByName.get(key);
        if (!platformOrgId) {
          const slug = slugify(client.name, new Set(platformOrgs.map((p) => p.slug)));
          const created = await prisma.platformOrganization.create({
            data: {
              slug,
              name: client.name,
              status: "active",
            },
          });
          platformOrgId = created.id;
          platformOrgs.push(created);
          platformByName.set(key, created.id);
          summary.platformOrgsCreated++;
        }
        await prisma.sunbulClient.update({
          where: { id: client.id },
          data: { platformOrganizationId: platformOrgId },
        });
        summary.sunbulClientsLinked++;
      }
    }

    // ─── Print summary ───

    console.log();
    console.log("═".repeat(50));
    console.log("SUMMARY");
    console.log("═".repeat(50));
    console.log(`  DecisionOS organizations:     ${summary.totalDecisionOrgs}`);
    console.log(`  AuditOS organizations:        ${summary.totalAuditOrgs}`);
    console.log(
      `  Already linked:               ${summary.alreadyLinked.length}`,
    );
    console.log(`  ID matches:                   ${summary.idMatches.length}`);
    console.log(
      `  Name matches:                 ${summary.nameMatches.length}`,
    );
    console.log(
      `  Unmatched DecisionOS only:    ${summary.unmatchedDecisionOrgs.length}`,
    );
    console.log(
      `  Unmatched AuditOS only:       ${summary.unmatchedAuditOrgs.length}`,
    );

    if (isApply) {
      console.log(
        `  PlatformOrganizations created: ${summary.platformOrgsCreated}`,
      );
      console.log(
        `  DecisionOS organizations linked: ${summary.decisionOrgsLinked}`,
      );
      console.log(
        `  AuditOS organizations linked:    ${summary.auditOrgsLinked}`,
      );
      console.log(
        `  SunbulClient records linked:     ${summary.sunbulClientsLinked}`,
      );
    }

    if (summary.unmatchedDecisionOrgs.length > 0) {
      console.log("\n── Unmatched DecisionOS Organizations ──");
      for (const o of summary.unmatchedDecisionOrgs) {
        console.log(`  • ${o.name} (${o.id})`);
      }
    }

    if (summary.unmatchedAuditOrgs.length > 0) {
      console.log("\n── Unmatched AuditOS Organizations ──");
      for (const o of summary.unmatchedAuditOrgs) {
        console.log(`  • ${o.name} (${o.id}) [slug: ${o.slug}]`);
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
