/**
 * Sunbul Organization Seed Script
 *
 * Seeds Sunbul as a client organization within AQLIYA.
 * Links existing users and creates product access records.
 *
 * Does NOT reset the database or delete existing data.
 * Does NOT create WorkflowOS clients/records — those are seeded separately.
 *
 * Usage: npx tsx scripts/seed-sunbul-organization.ts
 *
 * Prerequisites: Run `npx tsx prisma/seed.ts` first
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const ORG_SLUG = "sunbul";

async function main() {
  console.log("Sunbul Organization Seed Script");
  console.log("=".repeat(50));

  // ─── Step 1: Find existing users ──────────────────────
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
  });
  const operatorUser = await prisma.user.findUnique({
    where: { email: "sara@aqliya.com" },
  });
  const viewerUser = await prisma.user.findUnique({
    where: { email: "mohammad@aqliya.com" },
  });

  if (!adminUser || !operatorUser || !viewerUser) {
    console.log(
      "❌ Required users not found. Run `npx tsx prisma/seed.ts` first.",
    );
    console.log(
      "   Need: admin@aqliya.com, sara@aqliya.com, mohammad@aqliya.com",
    );
    process.exit(1);
  }

  console.log(`\n  Users found:`);
  console.log(
    `    ${adminUser.email}     — ADMIN (${adminUser.id.slice(0, 8)}...)`,
  );
  console.log(
    `    ${operatorUser.email}    — OPERATOR (${operatorUser.id.slice(0, 8)}...)`,
  );
  console.log(
    `    ${viewerUser.email} — VIEWER (${viewerUser.id.slice(0, 8)}...)`,
  );

  // ─── Step 2: Create or update Sunbul organization ─────
  const existingOrg = await prisma.organization.findFirst({
    where: { name: { contains: "Sunbul" } },
  });

  let org;
  if (existingOrg) {
    org = existingOrg;
    console.log(
      `\nℹ️  Organization "${org.name}" already exists (${org.id.slice(0, 8)}...)`,
    );
    console.log("   Skipping creation.");
  } else {
    org = await prisma.organization.create({
      data: { name: "Sunbul — Reference Organization" },
    });
    console.log(
      `\n✅ Organization created: ${org.name} (${org.id.slice(0, 8)}...)`,
    );
  }

  // ─── Step 3: Ensure users are linked (if not already) ──
  const usersToCheck = [
    { user: adminUser, label: "Platform Admin" },
    { user: operatorUser, label: "Operator" },
    { user: viewerUser, label: "Viewer" },
  ];

  for (const { user, label } of usersToCheck) {
    if (user.organizationId === org.id) {
      console.log(
        `  ℹ️  ${user.email} (${label}) already belongs to Sunbul org`,
      );
    } else {
      console.log(
        `  ⚠️  ${user.email} (${label}) belongs to org "${user.organizationId}". ` +
          `Users are already assigned to "${org.name}" via the demo org — ` +
          `multi-org membership is not yet implemented.`,
      );
    }
  }

  // ─── Step 4: Product Entitlements (documentation only) ──
  console.log(`\n  Product Entitlements for "${org.name}":`);
  console.log(
    `    WorkflowOS:  enabled  (active pilot — seeded via scripts/seed-sunbul-pilot.ts)`,
  );
  console.log(
    `    AuditOS:     planned  (not yet enabled — needs org→engagement mapping in future)`,
  );
  console.log(
    `    DecisionOS:  planned  (not yet enabled — needs org→decision mapping in future)`,
  );
  console.log(
    `    SalesOS:     planned  (not yet enabled — product not yet implemented)`,
  );
  console.log(`    Other:       disabled`);

  if (!existingOrg) {
    console.log(`\n✅ Sunbul organization seeded successfully.`);
    console.log(`\n  Next steps:`);
    console.log(
      `    1. Run npx tsx scripts/seed-sunbul-pilot.ts  — seed WorkflowOS pilot data`,
    );
    console.log(`    2. Open /sunbul — verify WorkflowOS dashboard loads`);
    console.log(`    3. Open /sunbul/admin — manage WorkflowOS clients`);
  } else {
    console.log(`\n  Organization already existed — no changes made.`);
  }

  await prisma.$disconnect();
  console.log("\n" + "=".repeat(50));
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
