import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  const provider = request.nextUrl.searchParams.get("provider");

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { organizationId };
  if (provider) where.provider = provider;

  const connections = await prisma.crmConnection.findMany({
    where: where as Record<string, never>,
    select: {
      id: true,
      provider: true,
      label: true,
      syncEnabled: true,
      lastSyncAt: true,
      lastSyncStatus: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  return NextResponse.json(connections);
}
