import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const projectId = process.argv[2] ?? "lc-project-demo-001";
  const proj = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  if (!proj) {
    console.error(`Project not found: ${projectId}`);
    process.exit(1);
  }
  const meta =
    proj.metadata && typeof proj.metadata === "object"
      ? { ...(proj.metadata as Record<string, unknown>) }
      : {};
  await prisma.localContentProject.update({
    where: { id: projectId },
    data: {
      metadata: {
        ...meta,
        auditEngagementId: "eng-gulf-2025",
        platformProjectId: "proj-gulf-2025-audit",
      },
    },
  });
  console.log(`Linked ${projectId} → eng-gulf-2025`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
