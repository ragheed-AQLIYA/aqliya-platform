import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  const provider = request.nextUrl.searchParams.get("provider") ?? "hubspot";

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const connection = await prisma.crmConnection.findFirst({
    where: { organizationId, provider, syncEnabled: true },
    select: { id: true },
  });

  if (!connection) {
    return NextResponse.json({ dealsImported: 0, contactsImported: 0, accountsImported: 0 });
  }

  const [deals, contacts, accounts] = await Promise.all([
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "opportunity" },
      _sum: { createdRecords: true },
    }),
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "contact" },
      _sum: { createdRecords: true },
    }),
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "account" },
      _sum: { createdRecords: true },
    }),
  ]);

  return NextResponse.json({
    dealsImported: deals._sum.createdRecords ?? 0,
    contactsImported: contacts._sum.createdRecords ?? 0,
    accountsImported: accounts._sum.createdRecords ?? 0,
  });
}
