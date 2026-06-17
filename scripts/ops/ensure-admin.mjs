import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check if organization already exists
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "AQLIYA Demo",
        slug: "aqliya-demo",
      },
    });
    console.log("Created org:", org.id);
  } else {
    console.log("Found org:", org.id);
  }

  // Check if admin user already exists
  let user = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
    select: { id: true, email: true, organizationId: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@aqliya.com",
        name: "Ahmed Al-Mansouri",
        password: "dummy-hash-do-not-use",
        role: "admin",
        organizationId: org.id,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, organizationId: true },
    });
    console.log("Created admin user:", JSON.stringify(user));
  } else {
    console.log("Admin user exists:", JSON.stringify(user));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
