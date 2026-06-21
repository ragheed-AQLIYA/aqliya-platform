import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { processOutboxBatch } from "@/lib/core/events";

export const dynamic = "force-dynamic";

/** ADMIN-only outbox poller — Event Bus Phase 1. */
export async function POST() {
  try {
    await requireUserContext("ADMIN");
    const result = await processOutboxBatch(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Outbox processing failed";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
