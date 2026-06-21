import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOutboxEnabled } from "@/lib/core/events/outbox-service";

export const dynamic = "force-dynamic";

/** ADMIN — outbox queue status (Tier 3 Event Bus ops visibility). */
export async function GET() {
  try {
    await requireUserContext("ADMIN");

    if (!isOutboxEnabled()) {
      return NextResponse.json({
        ok: true,
        enabled: false,
        counts: { pending: 0, failed: 0, processing: 0, processed: 0 },
        recentFailed: [],
      });
    }

    const [pending, failed, processing, processed, recentFailed] =
      await Promise.all([
        prisma.platformOutboxEvent.count({ where: { status: "pending" } }),
        prisma.platformOutboxEvent.count({ where: { status: "failed" } }),
        prisma.platformOutboxEvent.count({ where: { status: "processing" } }),
        prisma.platformOutboxEvent.count({ where: { status: "processed" } }),
        prisma.platformOutboxEvent.findMany({
          where: { status: "failed" },
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            eventType: true,
            organizationId: true,
            lastError: true,
            attempts: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

    return NextResponse.json({
      ok: true,
      enabled: true,
      counts: { pending, failed, processing, processed },
      recentFailed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load outbox status";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
