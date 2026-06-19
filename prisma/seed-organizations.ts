import { PrismaClient } from "@prisma/client";

export async function seedOrganizations(
  prisma: PrismaClient,
  platformOrgId: string,
): Promise<{ orgIds: string[] }> {
  const orgNames = [
    "مؤسسة التقنية المتقدمة",
    "شركة الخدمات اللوجستية",
    "مؤسسة الرعاية الصحية الرقمية",
  ];

  const orgIds: string[] = [];

  for (const name of orgNames) {
    const existing = await prisma.organization.findFirst({
      where: { name, platformOrganizationId: platformOrgId },
    });

    if (existing) {
      orgIds.push(existing.id);
      continue;
    }

    const org = await prisma.organization.create({
      data: {
        name,
        platformOrganizationId: platformOrgId,
      },
    });
    orgIds.push(org.id);
  }

  console.log(`Seeded ${orgNames.length} organizations`);
  return { orgIds };
}
