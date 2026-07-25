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
    select: {
      id: true,
      label: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      syncEnabled: true,
    },
  });

  if (!connection) {
    return NextResponse.json(null);
  }

  const latestLog = await prisma.crmSyncLog.findFirst({
    where: { connectionId: connection.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalRecords: true,
      createdRecords: true,
      updatedRecords: true,
      failedRecords: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json({
    ...connection,
    latestLog,
  });
}
