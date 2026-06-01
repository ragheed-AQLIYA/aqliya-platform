import { prisma } from "@/lib/prisma";
import type { SalesOrgScope } from "./services";

export interface SalesContactView {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  accountId: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function assertAccountInOrg(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: { id: true },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

export async function listContactsForAccount(
  scope: SalesOrgScope,
  accountId: string,
): Promise<SalesContactView[]> {
  await assertAccountInOrg(accountId, scope.organizationId);

  return prisma.salesContact.findMany({
    where: {
      organizationId: scope.organizationId,
      accountId,
    },
    select: contactSelect,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
}
